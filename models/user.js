const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Custom id field
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    qualification: { type: String, required: true },
    workExperience: { type: Number, required: true },
    skills: { type: String, required: true },
    isEmployer: { type: Boolean, default: false },
    cv: { type: String }
}, { _id: false }); // Prevents automatic creation of _id field

const User = mongoose.model('User', userSchema);

module.exports = User;
