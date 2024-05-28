import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
    required: true,
  },
  address: [
    {
      flatNo: {
        type: String,
        required: true,
      },

      area: {
        type: String,
        required: true,
      },

      landmark: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      country: {
        type: String,
        required: true,
      },

      pinCode: {
        type: Number,
        required: true,
      },
      defaultAddress: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

export const AddressModle = mongoose.model("address", AddressSchema);

// userId,flatNo,area,landmark,city,state,country,pinCode
