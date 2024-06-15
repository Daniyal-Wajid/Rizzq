const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt'); // Include bcrypt module

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Set view engine to EJS
app.set('view engine', 'ejs');

// Session management
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware to set user data in response locals
app.use(async (req, res, next) => {
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            if (user) {
                res.locals.user = user;
            }
        } catch (err) {
            console.error(err);
        }
    } else {
        res.locals.user = null; // Ensure user is null if not logged in
    }
    next();
});

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/Jobs', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
    });

// Define your Job schema and model
const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    skills: { type: String, required: true },
    careerLevel: { type: String, required: true },
    positions: { type: Number, required: true },
    location: { type: String, required: true },
    qualification: { type: String, required: true },
    experience: { type: Number, required: true },
    industry: { type: String, required: true },
    salary: { type: Number, required: true },
    genderPreference: { type: String, default: 'no-preference' },
    customQuestions: { type: Boolean, default: false },
    authorize: { type: Boolean, required: true }
});

const Job = mongoose.model('Job', jobSchema);

// Define your User schema and model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    qualification: { type: String, required: true },
    workExperience: { type: Number, required: true },
    skills: { type: String, required: true },
    isEmployer: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

// GET route to render the update profile form
app.get('/updateprofile', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    
    try {
        const user = await User.findById(req.session.userId);
        if (user) {
            res.render('updateprofile', { user });
        } else {
            res.redirect('/');
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// POST route to handle profile updates
app.post('/updateprofile', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    
    try {
        const updateData = {
            username: req.body.username,
            email: req.body.email,
            qualification: req.body.qualification,
            workExperience: req.body.workExperience,
            skills: req.body.skills,
            isEmployer: req.body.isEmployer === 'on'
        };
        
        if (req.body.password) {
            updateData.password = await bcrypt.hash(req.body.password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(req.session.userId, updateData, { new: true });

        if (updatedUser) {
            res.redirect('/');
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// POST route to handle deleting the user account
app.post('/deleteaccount', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect if user is not logged in
    }

    try {
        // Delete user from database
        const deletedUser = await User.findByIdAndDelete(req.session.userId);

        if (deletedUser) {
            req.session.destroy(err => {
                if (err) {
                    return res.status(500).json({ message: err.message });
                }
                res.redirect('/'); // Redirect to home page after successful deletion
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Route to handle job form submission
app.post('/jobs', async (req, res) => {
  try {
    const newJob = new Job(req.body);
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/findjob', async (req, res) => {
    try {
        let query = {};
        if (req.query.search) {
            query = { $or: [{ description: { $regex: req.query.search, $options: 'i' } }] }; // Search by description
        }
        const jobs = await Job.find(query);
        res.render('findjob', { jobs: jobs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/findjob/query', async (req, res) => {
    try {
        let query = {};
        if (req.query.search) {
            query = { description: { $regex: req.query.search, $options: 'i' } }; // Search by description, case-insensitive
        }
        const jobs = await Job.find(query);
        res.render('findjob', { jobs: jobs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



app.get('/jobs/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (job) {
            res.status(200).json(job);
        } else {
            res.status(404).json({ message: 'Job not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/jobs/:id/edit', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (job) {
            res.render('editjob', { job });
        } else {
            res.status(404).send('Job not found');
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
});

app.put('/jobs/:id', async (req, res) => {
    try {
        const updateData = {
            title: req.body.title,
            description: req.body.description,
            skills: req.body.skills,
            careerLevel: req.body.careerLevel,
            positions: req.body.positions,
            location: req.body.location,
            qualification: req.body.qualification,
            experience: req.body.experience,
            industry: req.body.industry,
            salary: req.body.salary,
            genderPreference: req.body.genderPreference,
            customQuestions: req.body.customQuestions === 'on',
            authorize: req.body.authorize === 'on'
        };

        const updatedJob = await Job.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (updatedJob) {
            res.redirect("/employers");
        } else {
            res.status(404).json({ message: 'Job not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/jobs/:id', async (req, res) => {
    try {
        const deletedJob = await Job.findByIdAndDelete(req.params.id);
        if (deletedJob) {
            res.status(200).json({ message: 'Job deleted' });
        } else {
            res.status(404).json({ message: 'Job not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/', (req, res) => {
    res.render('home');
});

// User routes
app.post('/signup', async (req, res) => {
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

app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user && await bcrypt.compare(req.body.password, user.password)) {
            req.session.userId = user._id;
            res.redirect('/');
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.redirect('/');
    });
});

// Existing routes for serving static files

app.get('/hirefreelancer', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'hirefreelancer.html'));
});

app.get('/cvreview', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cvreview.html'));
});

app.get('/postjob', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'postjob.html'));
});

app.get('/findjob', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'findjob.html'));
});

// Fetch all jobs and render employer dashboard with job data
app.get('/employers', async (req, res) => {
    try {
        const jobs = await Job.find({});
        res.render('employers', { jobs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
