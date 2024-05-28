import mongoose from "mongoose";

const EmailOtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        
    },
    otp: {
        type: String,
        required: true
    },
    expirytime: {
        type: Date,
        required:true
    }
})

export const EmailOtpModel = mongoose.model('EmailOtp',EmailOtpSchema);