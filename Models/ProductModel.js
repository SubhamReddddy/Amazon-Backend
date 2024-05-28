import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, "Please Enter Product Name"],
  },
  productPrice: {
    type: Number,
    required: [true, "Please Enter Product Price"],
  },
  productDiscription: {
    type: String,
    required: [true, "Please Enter Product Description"],
  },
  productCategories: {
    type: String,
    required: [true, "Please Enter Product Category"],
  },
  images: [
    {
      public_id: {
        type: String,
        required: [true, "Please Enter Product Image id"],
      },
      url: {
        type: String,
        required: [true, "Please Enter Product Image url"],
      },
    },
  ],
  productStock: {
    type: Number,
    required: [true, "Please Enter Product Stock"],
  },
  rating: {
    rate: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.ObjectId,
          ref: "user",
          required: true,
        },
        userName: {
          type: String,
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        userAvtar: {
          type: String,
          required: true,
        },
      },
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const ProductModel = mongoose.model("Product", ProductSchema);
