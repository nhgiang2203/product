const mongoose = require('mongoose');

const forgotPasswordScheme = new mongoose.Schema(
{
    email: String,
    otp: String,
    expireAt: {
        type: Date,
        expires: 180
    }
},
{
    timestamps: true
})

const ForgotPassword = mongoose.model('ForgotPassword', forgotPasswordScheme, 'forgot-password');
module.exports = ForgotPassword;