/**
 * Migration script: Import existing JSON data into MongoDB
 * Run once: node migrate.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) { console.error('❌ MONGODB_URI not set in .env'); process.exit(1); }

const readJSON = (file) => {
  const p = path.join(__dirname, 'data', file);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
};

async function migrate() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    console.log('✅ Connected to MongoDB');

    const users = readJSON('users.json');
    const enrollments = readJSON('enrollments.json');
    const admins = readJSON('admins.json');

    if (users.length > 0) {
      await db.collection('users').deleteMany({});
      await db.collection('users').insertMany(users);
      console.log(`✅ Migrated ${users.length} users`);
    }

    if (enrollments.length > 0) {
      await db.collection('enrollments').deleteMany({});
      await db.collection('enrollments').insertMany(enrollments);
      console.log(`✅ Migrated ${enrollments.length} enrollments`);
    }

    if (admins.length > 0) {
      await db.collection('admins').deleteMany({});
      await db.collection('admins').insertMany(admins);
      console.log(`✅ Migrated ${admins.length} admins`);
    }

    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('admins').createIndex({ email: 1 }, { unique: true });
    await db.collection('enrollments').createIndex({ userId: 1 });
    await db.collection('enrollments').createIndex({ fileHash: 1 });
    console.log('✅ Indexes created');

    console.log('\n🎉 Migration complete! Your data is now in MongoDB.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await client.close();
  }
}

migrate();
