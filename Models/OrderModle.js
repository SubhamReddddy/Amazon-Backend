import mongoose from "mongoose";

export const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
    required: true,
  },
  orderItems: [
    {
      productId: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      baseAmount: {
        type: Number,
        required: true,
      },
      productName: {
        type: String,
        required: true,
      },
      productDiscription: {
        type: String,
        required: true,
      },
      images: {
        type: String,
        required: true,
      },
      deliveryStatus: {
        type: String,
        required: true,
        default: "Pending",
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    required: true,
    default: "Not Paid",
  },
  onlineTransactionId: {
    type: String,
    required: true,
  },
  shippingAddress: {
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
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const OrderModel = mongoose.model("Order", OrderSchema);
