import mongoose from "mongoose";

const MobileOtpSchema = new mongoose.Schema({
    phoneno: {
        type: String,
        required: [true, "Please Enter Your Phone Number"],
        
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

export const MobileOtpModel = mongoose.model('MobileOtp',MobileOtpSchema);