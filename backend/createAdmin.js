const readline = require('readline');
const bcrypt = require('bcryptjs');
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

async function createAdmin() {
  const name = (await ask('Enter admin name: ')).trim();
  const email = (await ask('Enter admin email: ')).trim().toLowerCase();
  const password = await ask('Enter admin password: ');

  if (!name || !email || !password) {
    console.log('All fields are required.');
    rl.close();
    return;
  }

  db.findOne({ email }, async (err, existingUser) => {
    if (err) {
      console.log('Database error:', err);
      rl.close();
      return;
    }

    if (existingUser) {
      console.log('This email already exists. Choose another email.');
      rl.close();
      return;
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 12);

      db.insert({
        name,
        email,
        password: hashedPassword,
        role: 'admin'
      }, (insertError) => {
        if (insertError) {
          console.log('Could not create admin:', insertError);
        } else {
          console.log('Admin account created successfully!');
        }

        rl.close();
      });
    } catch (error) {
      console.log('Error:', error);
      rl.close();
    }
  });
}

createAdmin();