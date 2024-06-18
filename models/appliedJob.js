const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appliedJobSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
    title: String,
    description: String,
    skills: [String],
    careerLevel: String,
    positions: Number,
    location: String,
    qualification: String,
    experience: Number,
    industry: String,
    salary: Number,
    genderPreference: String
});

const AppliedJob = mongoose.model('AppliedJob', appliedJobSchema);

module.exports = AppliedJob;
