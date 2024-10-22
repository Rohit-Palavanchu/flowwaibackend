// required routes and npm modules
const express = require('express');
const router = express.Router();
const db = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const { v4: uuidv4 } = require('uuid');

// Register a new user
router.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const addUserQuery = `INSERT INTO users (username, password) VALUES (?, ?)`;

    db.run(addUserQuery, [username, hashedPassword], function(err) {
        if (err) {
            console.error('Error registering user:', err);
            return res.status(500).json({ error: 'Internal server error while registering user' });
        }

        res.status(201).json({ message: 'User registered successfully' });
    });
});

// Login user
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const findUserQuery = `SELECT * FROM users WHERE username = ?`;

    db.get(findUserQuery, [username], (err, user) => {
        if (err) {
            console.error('Error retrieving user:', err);
            return res.status(500).json({ error: 'Internal server error while retrieving user' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (err || !result) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
            res.status(200).json({ message: 'Login successful', token });
        });
    });
});

// Middleware for JWT verification
const middleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(403).json({ error: 'Token is required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = { id: decoded.id };
        next();
    });
};

// Add a new transaction (authenticated)
router.post('/transactions', middleware, (req, res) => {
    const { type, category, amount, date, description } = req.body;
    const userId = req.user.id;

    const addTransactionQuery = `INSERT INTO transactions (type, category, amount, date, description, userId) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(addTransactionQuery, [type, category, amount, date, description, userId], function(err) {
        if (err) {
            console.error('Error adding transaction:', err);
            return res.status(500).json({ error: 'Internal server error while adding transaction' });
        }
        res.status(201).json({ message: 'Transaction added successfully', transactionId: this.lastID });
    });
});

// Retrieve all transactions for the authenticated user (with pagination)
router.get('/transactions', middleware, (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    const getAllTransactionsQuery = `SELECT * FROM transactions WHERE userId = ? LIMIT ? OFFSET ?`;
    db.all(getAllTransactionsQuery, [userId, parseInt(limit), parseInt(offset)], (err, rows) => {
        if (err) {
            console.error('Error retrieving transactions:', err);
            return res.status(500).json({ error: 'Internal server error while retrieving transactions' });
        }

        const countQuery = `SELECT COUNT(*) AS total FROM transactions WHERE userId = ?`;
        db.get(countQuery, [userId], (err, result) => {
            if (err) {
                console.error('Error counting transactions:', err);
                return res.status(500).json({ error: 'Internal server error while counting transactions' });
            }

            const total = result.total;
            const totalPages = Math.ceil(total / limit);

            res.status(200).json({
                total,     // total results in the table
                page: parseInt(page), // page the result should be in 
                limit: parseInt(limit),  // limit a page should have(offset limit)
                totalPages,  
                data: rows   // returned rows
            });
        });
    });
});

// Retrieve a specific transaction by ID (authenticated)
router.get('/transactions/:id', middleware, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const getTransactionQuery = `SELECT * FROM transactions WHERE id = ? AND userId = ?`;
    db.get(getTransactionQuery, [id, userId], (err, row) => {
        if (err) {
            console.error('Error retrieving transaction:', err);
            return res.status(500).json({ error: 'Internal server error while retrieving transaction' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.status(200).json(row);
    });
});

// Update a transaction by ID (authenticated)
router.put('/transactions/:id', middleware, (req, res) => {
    const { type, category, amount, date, description } = req.body;
    const { id } = req.params;
    const userId = req.user.id;

    const updateTransactionQuery = `UPDATE transactions SET type = ?, category = ?, amount = ?, date = ?, description = ? WHERE id = ? AND userId = ?`;
    db.run(updateTransactionQuery, [type, category, amount, date, description, id, userId], function(err) {
        if (err) {
            console.error('Error updating transaction:', err);
            return res.status(500).json({ error: 'Internal server error while updating transaction' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Transaction not found or no changes made' });
        }

        res.status(200).json({ message: 'Transaction updated successfully' });
    });
});

// Delete a transaction by ID (authenticated)
router.delete('/transactions/:id', middleware, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const deleteTransactionQuery = `DELETE FROM transactions WHERE id = ? AND userId = ?`;
    db.run(deleteTransactionQuery, [id, userId], function(err) {
        if (err) {
            console.error('Error deleting transaction:', err);
            return res.status(500).json({ error: 'Internal server error while deleting transaction' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.status(200).json({ message: 'Transaction deleted successfully' });
    });
});


router.get('/summary', middleware, (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate, categoryId } = req.query;

    let query = `
        SELECT
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS totalIncome,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS totalExpenses
        FROM transactions
        WHERE userId = ?
    `;
    const params = [userId];

    if (startDate) {
        query += ' AND date >= ?';
        params.push(startDate);
    }
    if (endDate) {
        query += ' AND date <= ?';
        params.push(endDate);
    }
    if (categoryId) {
        query += ' AND category = ?';
        params.push(categoryId);
    }

    db.get(query, params, (err, row) => {
        if (err) {
            console.error('Error retrieving transaction summary:', err);
            return res.status(500).json({ error: 'Internal server error while retrieving summary' });
        }

        const totalIncome = row.totalIncome || 0;
        const totalExpenses = row.totalExpenses || 0;
        const balance = totalIncome - totalExpenses;

        res.status(200).json({ totalIncome, totalExpenses, balance });
    });
});

module.exports = router;
