const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User
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
    genderPreference: { type: String },
    customQuestions: { type: Boolean, default: false },
    authorize: { type: Boolean, required: true }
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
