const mongoose = require('mongoose');

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

module.exports = User;
