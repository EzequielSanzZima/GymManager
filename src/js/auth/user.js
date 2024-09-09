const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    birthdate: {
        type: Date,
        required: true
    },
    dni: {
        type: String,
        required: true,
        unique: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    avatar: {
        type: Buffer,
        required: true
    },
    rol: {
        type: String,
    },
    registerTime: {
        type: String,
    },
    pass:{
        type: String,
    },
    hasPaid: {
        type: Boolean,
        default: false
    },
    paymentDate: {
        type: String,
    },
    nextPayDate: {
        type: String,
    },
    lastAccess: {
        type: String,
    },
});

UserSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

let User;
if (mongoose.models.User) {
    User = mongoose.model('User');
} else {
    User = mongoose.model('User', UserSchema);
}

module.exports = User;