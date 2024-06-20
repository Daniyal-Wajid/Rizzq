const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt'); // Include bcrypt module
const AppliedJob = require('./models/AppliedJob'); // Adjust the path based on your project structure
const multer = require('multer');

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

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const filetypes = /pdf|jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only PDF and image files are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
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
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
    isEmployer: { type: Boolean, default: false },
    cv: { type: String }
});

const User = mongoose.model('User', userSchema);

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

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
}

// Update the /appliedjobs route to fetch jobs applied by the current user
app.get('/appliedjobs', async (req, res) => {
    try {
        // Fetch applied jobs for the logged-in user
        const jobs = await AppliedJob.find({ userId: req.session.userId });

        res.render('appliedjobs', { jobs }); // Render the appliedjobs.ejs template with jobs data
    } catch (error) {
        console.error('Error fetching applied jobs:', error);
        res.status(500).send('Server error');
    }
});

app.get('/apply', isAuthenticated, async (req, res) => {
    const jobId = req.query.jobId;
    const userId = req.session.userId;

    try {
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).send('Job not found');
        }

        const existingApplication = await AppliedJob.findOne({ userId: userId, jobId: jobId });
        if (existingApplication) {
            const jobs = await Job.find({});
            return res.render('findjob', { jobs, error: 'You have already applied for this job' });
        }

        const application = new AppliedJob({
            userId: userId,
            jobId: jobId,
            title: job.title,
            description: job.description,
            skills: job.skills,
            careerLevel: job.careerLevel,
            positions: job.positions,
            location: job.location,
            qualification: job.qualification,
            experience: job.experience,
            industry: job.industry,
            salary: job.salary,
            genderPreference: job.genderPreference
        });

        await application.save();
        res.redirect('/appliedjobs');
    } catch (error) {
        console.error('Error applying for job:', error);
        res.status(500).send('Server error');
    }
});



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

// POST route to handle profile updates with CV upload
app.post('/updateprofile', upload.single('cv'), async (req, res) => {
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

        if (req.file) {
            updateData.cv = req.file.path;
            console.log('File uploaded:', req.file);
        }

        const updatedUser = await User.findByIdAndUpdate(req.session.userId, updateData, { new: true });

        if (updatedUser) {
            res.redirect('/');
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// Route to handle CV download
app.get('/download-cv', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (user && user.cv) {
            res.download(user.cv);
        } else {
            res.status(404).send('CV not found');
        }
    } catch (error) {
        res.status(500).send('Server error');
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
app.post('/jobs', isAuthenticated, async (req, res) => {
    try {
        const jobData = {
            ...req.body,
            userId: req.session.userId // Associate job with the logged-in user
        };

        const newJob = new Job(jobData);
        const savedJob = await newJob.save();
        res.status(201).json(savedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Route to find jobs with a query
app.get('/findjob/query', async (req, res) => {
    try {
        let query = {};
        if (req.query.search) {
            query = { description: { $regex: req.query.search, $options: 'i' } };
        }
        const jobs = await Job.find(query);
        res.render('findjob',{ jobs: jobs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/download-cv/:userId', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (user && user.cv) {
            res.download(user.cv);
        } else {
            res.status(404).send('CV not found');
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// Existing /applied-jobs-with-applicants route
app.get('/applied-jobs-with-applicants', async (req, res) => {
    try {
        const appliedJobs = await AppliedJob.find()
            .populate({
                path: 'userId',
                select: 'username email qualification workExperience skills cv'
            })
            .populate({
                path: 'jobId',
                select: 'title description skills careerLevel location qualification experience industry salary'
            });

        res.render('applicant', { appliedJobs });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
// Route to fetch a specific job
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

// Route to render the edit job page
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

// Route to update a job
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

// Route to delete a job
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

// Signup route
app.get('/signup', (req, res) => {
    res.render('signup');
});

// Login route
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Home route
app.get('/', async (req, res) => {
    try {
        const jobs = await Job.find(); // Fetch all jobs or limit as required
        res.render('home', { jobs });  // Pass the jobs to the EJS template
    } catch (error) {
        console.error('Failed to fetch jobs', error);
        res.status(500).send('Server error');
    }
});

app.post('/signup', upload.single('cv'), async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            qualification: req.body.qualification,
            workExperience: req.body.workExperience,
            skills: req.body.skills,
            isEmployer: req.body.isEmployer === 'on',
            cv: req.file ? req.file.path : null // Save CV file path if uploaded
        });
        console.log('File uploaded:', req.file);
        const savedUser = await user.save();
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
});


// User login
app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user && await bcrypt.compare(req.body.password, user.password)) {
            req.session.userId = user._id;
            res.redirect('/');
        } else {
            res.render('login', { error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).render('login', { error: error.message });
    }
});

// User logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.redirect('/');
    });
});

// Static file routes
app.get('/hirefreelancer', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'hirefreelancer.html'));
});

app.get('/cvreview', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cvreview.html'));
});

app.get('/postjob', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'postjob.html'));
});

// Fetch jobs posted by the logged-in user and render the employer dashboard
app.get('/employers', isAuthenticated, async (req, res) => {
    try {
        const jobs = await Job.find({ userId: req.session.userId });
        res.render('employers', { jobs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
