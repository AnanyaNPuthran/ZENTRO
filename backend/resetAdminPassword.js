const readline = require('readline');
const bcrypt = require('bcryptjs');
const Datastore = require('@seald-io/nedb');
const path = require('path');

const DB_PATH = path.join(__dirname, 'zentro_users.db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function resetAdminPassword() {
  console.log('\n--- ZENTRO Admin Password Reset Tool ---');
  const email = (await ask('Enter admin email to reset: ')).trim().toLowerCase();
  const newPassword = await ask('Enter new admin password: ');

  if (!email || !newPassword) {
    console.log('Error: Both email and new password are required.');
    rl.close();
    return;
  }

  const db = new Datastore({ filename: DB_PATH, autoload: true });
  await new Promise(resolve => setTimeout(resolve, 500));

  db.findOne({ email, role: 'admin' }, async (findErr, admin) => {
    if (findErr) {
      console.error('Database error:', findErr);
      rl.close();
      return;
    }

    if (!admin) {
      console.log(`No admin account found with email "${email}".`);
      rl.close();
      return;
    }

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      db.update(
        { email, role: 'admin' },
        { $set: { password: hashedPassword } },
        {},
        (updateErr) => {
          if (updateErr) {
            console.error('Error updating password:', updateErr);
          } else {
            if (typeof db.compactDatafile === 'function') {
              db.compactDatafile();
            }
            console.log(`\nPassword reset successfully for admin: ${email}`);
          }
          rl.close();
        }
      );
    } catch (err) {
      console.error('Hashing error:', err);
      rl.close();
    }
  });
}

resetAdminPassword();
