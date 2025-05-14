const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Counter = require('./Counter');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userId: { type: Number, unique: true, default: 0 }
});

userSchema.pre('save', async function (next) {
    if(this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { _id: 'userId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.userId = counter.seq;
    }
    if (this.isModified('password') || this.isNew) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
})

module.exports = mongoose.model('User', userSchema);
