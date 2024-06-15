const express = require('express');
const bcrypt = require('bcrypt');
const User = require('./models/user'); // Assuming the user model is in the models folder
const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            qualification: req.body.qualification,
            workExperience: req.body.workExperience,
            skills: req.body.skills,
            isEmployer: req.body.isEmployer === 'on'
        });
        const savedUser = await user.save();
        res.redirect('/login');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user && await bcrypt.compare(req.body.password, user.password)) {
            req.session.userId = user._id;
            res.redirect('/employers');
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.redirect('/');
    });
});

module.exports = router;
