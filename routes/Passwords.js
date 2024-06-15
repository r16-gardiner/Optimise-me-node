require('dotenv').config(); 
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const secretKey = process.env.SECRETKEY;
const passwordHash = process.env.MUMHASH;

// Example user data
const user = {
    username: 'Admin',
    passwordHash: passwordHash // Hashed password
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
        next();
    });
};

// Login route
router.post('/', async (req, res) => {
    const { username, password } = req.body;

    if (username === user.username) {
        const match = await bcrypt.compare(password, user.passwordHash);
        if (match) {
            const token = jwt.sign({ id: user.username }, secretKey, { expiresIn: '1h' });
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
    res.json({ message: 'Welcome to the admin dashboard!' });
});

module.exports = router

