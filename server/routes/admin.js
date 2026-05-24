const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { ObjectId } = require('mongodb');
const { connectDB } = require('../db');
const { courses, allAccessPlans } = require('../data/courses');

const router = express.Router();
const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'vhire_admin_secret_2024';

const adminAuth = (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Admin token required' });
  try {
    req.admin = jwt.verify(token, ADMIN_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

const signAdminToken = (admin) =>
  jwt.sign({ id: admin._id?.toString() || admin.id, email: admin.email, name: admin.name }, ADMIN_SECRET, { expiresIn: '12h' });

router.post('/signup', async (req, res) => {
  const { name, email, password, inviteCode } = req.body;
  if (!name || !email || !password || !inviteCode)
    return res.status(400).json({ message: 'All fields including invite code are required' });

  if (inviteCode !== 'VHIRE_ADMIN_INVITE_2024')
    return res.status(403).json({ message: 'Invalid invite code' });

  const db = await connectDB();
  const admins = db.collection('admins');

  if (await admins.findOne({ email }))
    return res.status(409).json({ message: 'Admin with this email already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const result = await admins.insertOne({ name, email, password: hashed, createdAt: new Date().toISOString() });
  const admin = { _id: result.insertedId, name, email };

  res.status(201).json({ token: signAdminToken(admin), admin: { id: result.insertedId.toString(), name, email } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  const db = await connectDB();
  const admin = await db.collection('admins').findOne({ email });
  if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, admin.password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  res.json({ token: signAdminToken(admin), admin: { id: admin._id.toString(), name: admin.name, email } });
});

const enrich = (e, users) => {
  const user = users.find((u) => u._id?.toString() === e.userId || u.id === e.userId);
  let itemName = '';
  let rawAmount = e.amount;

  if (e.type === 'single') {
    const course = courses.find((c) => String(c.id) === String(e.courseId));
    itemName = course?.name || e.courseName || 'Single Course';
    if (!rawAmount && course) rawAmount = course.price;
  } else {
    const plan = allAccessPlans.find((p) => String(p.id) === String(e.planId));
    itemName = plan?.name || `Plan (${e.planId})`;
    if (!rawAmount && plan) rawAmount = plan.price;
  }

  const numericAmount = parseInt(String(rawAmount || 0).replace(/[^0-9]/g, '') || '0', 10);

  return {
    ...e,
    id: e._id?.toString() || e.id,
    enrollmentId: e._id?.toString() || e.id,
    userName: user?.name || e.name || 'Unknown',
    userEmail: user?.email || '—',
    mobile: e.mobile || '—',
    age: e.age || '—',
    courseName: e.type === 'single' ? itemName : undefined,
    planName: e.type !== 'single' ? itemName : undefined,
    amount: numericAmount,
    screenshotFile: e.screenshotPath ? path.basename(e.screenshotPath) : e.screenshotFile,
  };
};

router.get('/stats', adminAuth, async (req, res) => {
  const db = await connectDB();
  const [users, enrollments] = await Promise.all([
    db.collection('users').find().toArray(),
    db.collection('enrollments').find().toArray(),
  ]);

  let activeEnrollments = 0, pendingEnrollments = 0, rejectedEnrollments = 0;
  let totalRevenue = 0, pendingRevenue = 0;

  enrollments.forEach((e) => {
    const enriched = enrich(e, users);
    if (e.status === 'active') { activeEnrollments++; totalRevenue += enriched.amount; }
    else if (e.status === 'pending') { pendingEnrollments++; pendingRevenue += enriched.amount; }
    else if (e.status === 'rejected') { rejectedEnrollments++; }
  });

  res.json({
    totalUsers: users.length,
    totalEnrollments: enrollments.length,
    pendingEnrollments,
    activeEnrollments,
    rejectedEnrollments,
    totalRevenue,
    pendingRevenue,
  });
});

router.get('/enrollments', adminAuth, async (req, res) => {
  const { status = 'all' } = req.query;
  const db = await connectDB();
  const [users, rawEnrollments] = await Promise.all([
    db.collection('users').find().toArray(),
    db.collection('enrollments').find().toArray(),
  ]);

  let enrollments = rawEnrollments.map((e) => enrich(e, users));
  if (status !== 'all') enrollments = enrollments.filter((e) => e.status === status);
  enrollments.sort((a, b) => new Date(b.submittedAt || b.purchasedAt || 0) - new Date(a.submittedAt || a.purchasedAt || 0));

  res.json(enrollments);
});

router.get('/users', adminAuth, async (req, res) => {
  const db = await connectDB();
  const [users, rawEnrollments] = await Promise.all([
    db.collection('users').find().toArray(),
    db.collection('enrollments').find().toArray(),
  ]);

  const enrichedEnrollments = rawEnrollments.map((e) => enrich(e, users));

  const enrichedUsers = users.map((u) => {
    const uid = u._id.toString();
    const userEnrollments = enrichedEnrollments.filter((e) => e.userId === uid);
    const activeEnrollments = userEnrollments.filter((e) => e.status === 'active');
    const totalPaid = activeEnrollments.reduce((sum, e) => sum + e.amount, 0);
    const activeCourses = activeEnrollments.map((e) => e.courseName || e.planName);
    const latestEnrollment = userEnrollments.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];

    return {
      ...u,
      id: uid,
      enrollmentCount: userEnrollments.length,
      activeCourses,
      totalPaid,
      mobile: latestEnrollment?.mobile || '—',
      age: latestEnrollment?.age || '—',
      createdAt: u.createdAt || new Date().toISOString(),
    };
  });

  res.json(enrichedUsers);
});

router.get('/screenshot/:filename', adminAuth, async (req, res) => {
  const { filename } = req.params;
  const db = await connectDB();
  const enrollment = await db.collection('enrollments').findOne({
    $or: [{ screenshotFile: filename }, { screenshotPath: { $regex: filename } }],
  });

  let filePath = '';
  if (enrollment?.screenshotPath) {
    filePath = path.resolve(enrollment.screenshotPath);
  } else {
    filePath = path.join(__dirname, '../data/screenshots', filename);
  }

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: 'Screenshot file not found' });
  }
});

router.post('/approve/:enrollmentId', adminAuth, express.json(), async (req, res) => {
  const { enrollmentId } = req.params;
  const db = await connectDB();

  let query;
  try { query = { _id: new ObjectId(enrollmentId) }; } catch { query = { id: enrollmentId }; }

  const result = await db.collection('enrollments').findOneAndUpdate(
    query,
    { $set: {
        status: 'active',
        approvedAt: new Date().toISOString(),
        courseLink: req.body?.courseLink || '',
        courseId: req.body?.courseId || null,
    }},
    { returnDocument: 'after' }
  );

  if (!result) return res.status(404).json({ message: 'Not found' });
  res.json({ success: true, message: 'Enrollment approved' });
});

router.post('/reject/:enrollmentId', adminAuth, express.json(), async (req, res) => {
  const { enrollmentId } = req.params;
  const db = await connectDB();

  let query;
  try { query = { _id: new ObjectId(enrollmentId) }; } catch { query = { id: enrollmentId }; }

  const result = await db.collection('enrollments').findOneAndUpdate(
    query,
    { $set: { status: 'rejected', rejectionReason: req.body?.reason || 'Payment could not be verified.', rejectedAt: new Date().toISOString() } },
    { returnDocument: 'after' }
  );

  if (!result) return res.status(404).json({ message: 'Not found' });
  res.json({ success: true, message: 'Enrollment rejected' });
});

router.delete('/user/:userId', adminAuth, async (req, res) => {
  const { userId } = req.params;
  const db = await connectDB();

  let userQuery;
  try { userQuery = { _id: new ObjectId(userId) }; } catch { userQuery = { id: userId }; }

  await Promise.all([
    db.collection('users').deleteOne(userQuery),
    db.collection('enrollments').deleteMany({ userId }),
  ]);

  res.json({ success: true, message: 'User deleted' });
});

module.exports = router;
