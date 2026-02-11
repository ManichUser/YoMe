const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Chemin vers la base
const dbPath = path.resolve(__dirname, '../../chat.db')

// Connexion
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message)
  } else {
    console.log('Connected to SQLite database ✅')
  }
})

module.exports = db
