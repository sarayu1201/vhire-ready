const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
let client;
let db;

async function connectDB() {
  if (db) return db;
  client = new MongoClient(uri, {
    tls: true,
    tlsAllowInvalidCertificates: false,
  });
  await client.connect();
  db = client.db();
  console.log('✅ Connected to MongoDB');
  return db;
}

module.exports = { connectDB };