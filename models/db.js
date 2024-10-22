const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../transactions.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to the database', err);
    } else {
        console.log('Connected to the SQLite database');
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense'))
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        category INTEGER NOT NULL,
        amount REAL NOT NULL,
        date DATE NOT NULL,
        description TEXT,
        userId INTEGER,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
        FOREIGN KEY (category) REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )`);

    db.run(`INSERT INTO categories (name, type) VALUES ('Salary', 'income')`);
    db.run(`INSERT INTO categories (name, type) VALUES ('Freelance', 'income')`);
    db.run(`INSERT INTO categories (name, type) VALUES ('Groceries', 'expense')`);
    db.run(`INSERT INTO categories (name, type) VALUES ('Rent', 'expense')`);
    db.run(`INSERT INTO categories (name, type) VALUES ('Utilities', 'expense')`);
});

module.exports = db;
