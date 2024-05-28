import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please Enter Your Name"],
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
  },
  phoneno: {
    type: String,
    required: [true, "Please Enter Your Phone Number"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please Enter Your Password"],
    select: false,
  },
  role: {
    type: String,
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  avtar: {
    public_id: {
      type: String,
      default: "vuyguygu6vvt768",
    },
    url: {
      type: String,
      default:
        "https://w7.pngwing.com/pngs/831/88/png-transparent-user-profile-computer-icons-user-interface-mystique-miscellaneous-user-interface-design-smile.png",
    },
  },
});

export const userModel = mongoose.model("user", userSchema);
