const readline = require('readline');
const db = require('./db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function updateAdminEmail() {
  console.log('\n--- ZENTRO Admin Email Update Tool ---');
  const oldEmail = (await ask('Enter current admin email: ')).trim().toLowerCase();
  const newEmail = (await ask('Enter new admin email: ')).trim().toLowerCase();

  if (!oldEmail || !newEmail) {
    console.log('Error: Both current and new emails are required.');
    rl.close();
    return;
  }

  db.findOne({ email: newEmail }, (err, existing) => {
    if (err) {
      console.error('Database error:', err);
      rl.close();
      return;
    }

    if (existing) {
      console.log(`An account with email "${newEmail}" already exists.`);
      rl.close();
      return;
    }

    db.update(
      { email: oldEmail, role: 'admin' },
      { $set: { email: newEmail } },
      {},
      (updateErr, count) => {
        if (updateErr) {
          console.error('Update failed:', updateErr);
        } else if (count === 0) {
          console.log(`No admin account found with email "${oldEmail}".`);
        } else {
          console.log(`Admin email updated successfully to: ${newEmail}`);
        }
        rl.close();
      }
    );
  });
}

updateAdminEmail();
