const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Sign up route
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).send('Username or email already exists');
        }
        
        const user = new User({ username, email, password });
        await user.save();

        // Set session
        req.session.user = {
            name: user.name,
            email: user.email
        };
        
        // Redirect to home page
        res.redirect('/');
    } catch (error) {
        res.status(500).send("Internal Server Error: ",error.message);
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        const isMatch = await bcrypt.compare(password, user.password);

        if (!user || !isMatch) {
            return res.status(401).send('Invalid username or password');
        }
        req.session.user = {
            username: String(user.username),
            email: String(user.email)
        };
        req.session.save(() => {
            return res.redirect('/')
        })
    } catch (error) {
        res.status(500).send("Internal Server Error: ", error.message);
    }
});

module.exports = router;
