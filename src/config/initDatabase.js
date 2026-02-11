const db = require('./database')
const bcrypt = require('bcrypt')

const initDatabase = async () => {
  // Table users
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Table messages
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users (id)
    )
  `)

  console.log('Tables created or verified ✅')

  // Création des 2 utilisateurs seulement s'ils n'existent pas
  const users = [
    { email: "manix@gmail.com", password: "manixpass1234" },
    { email: "lg@gmail.com", password: "lgpass1234" }
  ]

  for (let user of users) {
    db.get("SELECT * FROM users WHERE email = ?", [user.email], async (err, row) => {
      if (!row) {
        const hashedPassword = await bcrypt.hash(user.password, 10)
        db.run(
          "INSERT INTO users (email, password) VALUES (?, ?)",
          [user.email, hashedPassword]
        )
        console.log(`User ${user.email} created ✅`)
      }
    })
  }
}

module.exports = initDatabase
