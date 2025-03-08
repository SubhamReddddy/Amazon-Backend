import mongoose from "mongoose";

const cancleSchema = new mongoose.Schema({
  orderId1: {
    type: mongoose.Schema.ObjectId,
    ref: "Order",
    required: true,
  },
  orderId2: {
    type: mongoose.Schema.ObjectId,
    ref: "Order",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const cancleModle = mongoose.model("CancleOrder", cancleSchema);
