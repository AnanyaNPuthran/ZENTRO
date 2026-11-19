// ─── Zentro Database ────────────────────────────────────────────────────────
// NeDB — pure JavaScript embedded database, stored permanently at backend/zentro_users.db
// No native compilation, no external server, works on any OS.

const Datastore = require('@seald-io/nedb');
const path      = require('path');

const db = new Datastore({
  filename:   path.join(__dirname, 'zentro_users.db'),
  autoload:   true,   // loads from disk on start
  timestampData: true // adds createdAt / updatedAt automatically
});

// Ensure email is unique
db.ensureIndex({ fieldName: 'email', unique: true }, err => {
  if (err) console.error('Index error:', err);
  else     console.log('✅ Database ready: zentro_users.db');
});

module.exports = db;
