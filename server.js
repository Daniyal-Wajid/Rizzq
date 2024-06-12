const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/Jobs')
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

app.set('view engine', 'ejs');
const methodOverride = require('method-override');

// Middleware to support PUT and DELETE methods via HTML forms
app.use(methodOverride('_method'));


// Route to handle form submission
app.post('/jobs', async (req, res) => {
  try {
    // Create a new job instance with the data from the request body
    const newJob = new Job(req.body);

    // Save the new job instance to the database
    const savedJob = await newJob.save();

    res.status(201).json(savedJob); // Respond with the saved job data
  } catch (error) {
    res.status(400).json({ message: error.message }); // Handle errors
  }
});

app.get('/findjob', async (req, res) => {
    try {
        let query = {};

        // Check if there is a search query
        if (req.query.search) {
            // Use a regular expression to perform a case-insensitive search
            query = { $or: [{ title: { $regex: req.query.search, $options: 'i' } }] };
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


// Route to get the edit form
app.get('/jobs/:id/edit', async (req, res) => {
    try {
        console.log("Req:"+req.params.id);
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

// Route to update the job
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


// Delete a job posting
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

// Existing routes for serving static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/hirefreelancer', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'hirefreelancer.html'));
});

app.get('/cvreview', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cvreview.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
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
