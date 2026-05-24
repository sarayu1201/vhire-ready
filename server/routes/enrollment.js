const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { connectDB } = require('../db');
const { courses, allAccessPlans } = require('../data/courses');

const router = express.Router();

// Screenshots dir
const screenshotsDir = path.join(__dirname, '../data/screenshots');
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

// Multer
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, screenshotsDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname.replace(/\s/g, '_')}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Get userId from token
const getUserId = (req) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.replace('Bearer ', '').trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
};

// POST /api/enrollment/single
router.post('/single', upload.single('paymentScreenshot'), async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: 'Please login again' });
  if (!req.file) return res.status(400).json({ message: 'Payment screenshot is required' });

  const fileHash = crypto.createHash('sha256').update(fs.readFileSync(req.file.path)).digest('hex');
  const db = await connectDB();
  const enrollments = db.collection('enrollments');

  if (await enrollments.findOne({ fileHash }))
    return res.status(409).json({ message: 'This screenshot was already used. Upload a new one.' });

  const entry = {
    userId,
    type: 'single',
    courseId: req.body.courseId || null,
    planId: null,
    name: req.body.name || '',
    age: req.body.age || '',
    mobile: req.body.mobile || '',
    status: 'pending',
    fileHash,
    screenshotFile: req.file.filename,
    screenshotPath: req.file.path,
    amount: req.body.amount || 0,
    submittedAt: new Date().toISOString(),
    expiresAt: null,
    courseLink: null,
  };

  const result = await enrollments.insertOne(entry);
  res.status(201).json({ success: true, status: 'pending', id: result.insertedId.toString() });
});

// POST /api/enrollment/plan
router.post('/plan', upload.single('paymentScreenshot'), async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: 'Please login again' });
  if (!req.file) return res.status(400).json({ message: 'Payment screenshot is required' });

  const { planId, duration } = req.body;
  if (!planId) return res.status(400).json({ message: 'planId is required' });

  const plan = allAccessPlans.find((p) => String(p.id) === String(planId));
  const months = parseInt(duration) || (plan ? plan.duration : 3);
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + months);

  const fileHash = crypto.createHash('sha256').update(fs.readFileSync(req.file.path)).digest('hex');
  const db = await connectDB();
  const enrollments = db.collection('enrollments');

  if (await enrollments.findOne({ fileHash }))
    return res.status(409).json({ message: 'This screenshot was already used. Upload a new one.' });

  const entry = {
    userId,
    type: 'plan',
    courseId: null,
    planId,
    name: req.body.name || '',
    age: req.body.age || '',
    mobile: req.body.mobile || '',
    status: 'pending',
    duration: months,
    fileHash,
    screenshotFile: req.file.filename,
    screenshotPath: req.file.path,
    amount: plan ? plan.price : 0,
    submittedAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  const result = await enrollments.insertOne(entry);
  res.status(201).json({ success: true, status: 'pending', expiresAt: entry.expiresAt, id: result.insertedId.toString() });
});

// GET /api/enrollment/my-courses
router.get('/my-courses', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const db = await connectDB();
  const now = new Date();

  const all = await db.collection('enrollments').find({ userId }).toArray();

  const result = all.map((e) => {
    const id = e._id.toString();
    let status = e.status;
    if (status === 'active' && e.expiresAt && new Date(e.expiresAt) <= now) status = 'expired';

    if (e.type === 'single') {
      const course = courses.find((c) => String(c.id) === String(e.courseId));
      // Use courseLink from enrollment (set by admin on approve) OR from courses data
      const courseLink = status === 'active'
        ? (e.courseLink || course?.link || null)
        : null;
      return {
        ...e,
        id,
        status,
        courseName: course?.name || e.courseName || 'Course',
        courseLink,
      };
    }

    const plan = allAccessPlans.find((p) => String(p.id) === String(e.planId));
    return { ...e, id, status, planName: plan?.name || 'Plan' };
  });

  res.json(result);
});

// GET /api/enrollment/check/:courseId
router.get('/check/:courseId', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const now = new Date();
  const courseId = req.params.courseId;
  const course = courses.find((c) => String(c.id) === String(courseId));
  if (!course) return res.status(404).json({ message: 'Course not found' });

  const db = await connectDB();
  const allEnrollments = await db.collection('enrollments').find({ userId }).toArray();

  const single = allEnrollments.find((e) => e.type === 'single' && String(e.courseId) === String(courseId));
  if (single) {
    if (single.status === 'active') return res.json({ hasAccess: true, reason: 'single', courseLink: single.courseLink || course.link });
    if (single.status === 'pending') return res.json({ hasAccess: false, reason: 'pending' });
    if (single.status === 'rejected') return res.json({ hasAccess: false, reason: 'rejected', rejectionReason: single.rejectionReason });
  }

  const plans = allEnrollments.filter((e) => e.type === 'plan');
  const pendingPlan = plans.find((e) => e.status === 'pending');
  if (pendingPlan) return res.json({ hasAccess: false, reason: 'pending' });

  const activePlan = plans.find((e) => e.status === 'active' && new Date(e.expiresAt) > now);
  if (activePlan) return res.json({ hasAccess: true, reason: 'plan', expiresAt: activePlan.expiresAt, courseLink: course.link });

  const rejectedPlan = plans.find((e) => e.status === 'rejected');
  if (rejectedPlan) return res.json({ hasAccess: false, reason: 'rejected', rejectionReason: rejectedPlan.rejectionReason });

  const expiredPlan = plans.filter((e) => e.status === 'active').sort((a, b) => new Date(b.expiresAt) - new Date(a.expiresAt))[0];
  if (expiredPlan) return res.json({ hasAccess: false, reason: 'expired', expiresAt: expiredPlan.expiresAt });

  res.json({ hasAccess: false, reason: 'none' });
});

module.exports = router;
