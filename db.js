const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./films.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT,
    dateDeSortie TEXT,
    realisateur TEXT,
    notePublic REAL,
    note REAL,
    compagnie TEXT,
    description TEXT,
    origine TEXT,
    lienImage TEXT
  )`);
});

module.exports = db;
