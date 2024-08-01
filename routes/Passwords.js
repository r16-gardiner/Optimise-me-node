require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const secretKey = process.env.SECRETKEY;
const adminPasswordHash = process.env.MUMHASH;
const karenPasswordHash = process.env.KARENHASH;

// Example user data
const users = {
    Admin: {
        username: 'Admin',
        passwordHash: adminPasswordHash,
        role: 'admin'
    },
    Karen: {
        username: 'Karen',
        passwordHash: karenPasswordHash,
        role: 'karen'
    }
};

// Middleware to verify the token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to authenticate token' });
        }

        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

// Login route
router.post('/', async (req, res) => {
    const { username, password } = req.body;

    if (users[username]) {
        const match = await bcrypt.compare(password, users[username].passwordHash);
        if (match) {
            const token = jwt.sign({ id: users[username].username, role: users[username].role }, secretKey, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).json({ message: 'Invalid password' });
        }
    } else {
        res.status(401).json({ message: 'Invalid username' });
    }
});

// Protected route example
router.get('/admin', verifyToken, (req, res) => {
    if (req.userRole === 'admin') {
        res.json({ message: 'Welcome to the admin dashboard!' });
    } else {
        res.status(403).json({ message: 'Access denied' });
    }
});

router.get('/karen', verifyToken, (req, res) => {
    if (req.userRole === 'karen') {
        res.json({ message: 'Welcome to the Karen dashboard!' });
    } else {
        res.status(403).json({ message: 'Access denied' });
    }
});

module.exports = router;