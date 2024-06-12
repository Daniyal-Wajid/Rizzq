const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: String,
    description: String,
    skills: String,
    careerLevel: String,
    positions: Number,
    location: String,
    qualification: String,
    experience: Number,
    industry: String,
    salary: Number,
    genderPreference: String,
    customQuestions: Boolean,
    authorize: Boolean
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
