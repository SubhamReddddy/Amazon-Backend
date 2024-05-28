import mongoose from "mongoose";
import { OrderModel } from "../Models/OrderModle.js";
import { ProductModel } from "../Models/ProductModel.js";
import { userModel } from "../Models/UserModel.js";
import ErrorHandler from "../Utils/ErrorHandler.js";
import catchAsyncError from "../Utils/catchAsyncError.js";
import { v2 as cloudinary } from "cloudinary";
import { AddressModle } from "../Models/AddressModel.js";

//admin
export const addNewProduct = catchAsyncError(async (req, res, next) => {
  let productArray = [];
  let CloudinaryProductArray = [];

  if (typeof req.body.images === "string") {
    productArray.push(req.body.images);
  } else {
    productArray = [...req.body.images];
  }

  for (const image of productArray) {
    try {
      const response = await cloudinary.uploader.upload(image, {
        folder: "Amazon_Product",
      });
      CloudinaryProductArray.push({
        public_id: response.public_id,
        url: response.secure_url,
      });
    } catch (error) {
      console.error(error);
      return next(new ErrorHandler(error.message, error.http_code));
    }
  }

  const {
    productName,
    productPrice,
    productDiscription,
    productCategories,
    productStock,
  } = req.body;

  const product = await ProductModel.create({
    productName,
    productPrice,
    productDiscription,
    productCategories,
    images: CloudinaryProductArray,
    productStock,
  });

  res.status(200).json({
    success: true,
    message: "product added successfully",
  });
});

export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const user = await userModel.find();
  res.status(200).json({
    success: true,
    user,
  });
});

export const getAllOrders = catchAsyncError(async (req, res, next) => {
  const order = await OrderModel.find();
  if (order.length === 0) {
    return next(new ErrorHandler("order not found", 404));
  }
  res.status(200).json({
    success: true,
    order,
  });
});

export const updateOrders = catchAsyncError(async (req, res, next) => {
  const { id1, id2, newProcessing } = req.body;
  const { ObjectId } = mongoose.Types;
  const id = new ObjectId(String(id2));
  const order = await OrderModel.findById(id1);
  if (!order) return next(new ErrorHandler("order not found", 404));
  let count = 0;
  order.orderItems.map((item) => {
    if (item._id.equals(id)) {
      item.deliveryStatus = newProcessing;
      count++;
    }
  });

  if (count === 0) {
    return next(new ErrorHandler("order not found", 404));
  } else {
    await order.save();
    res.status(200).json({
      success: true,
      message: "order updated successfully",
    });
  }
});

export const UpdateProduct = catchAsyncError(async (req, res, next) => {
  const data = req.body;
  const product = await ProductModel.findById({ _id: data._id });
  if (data.images) {
    for (const image of product.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }
    product.images = [];
    for (const image of data.images) {
      try {
        const response = await cloudinary.uploader.upload(image, {
          folder: "Amazon_Product",
        });
        product.images.push({
          public_id: response.public_id,
          url: response.secure_url,
        });
      } catch (error) {
        console.error(error);
        return next(new ErrorHandler(error.message, error.http_code));
      }
    }
  }

  product.productName = data.productName;
  product.productPrice = data.productPrice;
  product.productDiscription = data.productDiscription;
  product.productCategories = data.productCategories;
  product.productStock = data.productStock;
  await product.save();

  res.status(200).json({
    success: true,
    message: "product updated successfully",
  });
});

export const DeleteProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const product = await ProductModel.findById({ _id: id });
  for (const image of product.images) {
    await cloudinary.uploader.destroy(image.public_id);
  }
  await product.save();
  await ProductModel.findByIdAndDelete({ _id: id });

  res.status(200).json({
    success: true,
    message: "product deleted successfully",
  });
});

export const updateUser = catchAsyncError(async (req, res, next) => {
  const { id, role } = req.body;
  const user = await userModel.findById({ _id: id });
  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }
  user.role = role;
  await user.save();
  res.status(200).json({
    success: true,
    message: "user updated successfully",
  });
});

export const getSingleUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const user = await userModel.findById({ _id: id });
  if (!user) return next(new ErrorHandler("user not found", 404));

  res.status(200).json({
    success: true,
    user,
  });
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const user = await userModel.deleteMany({ _id: id });
  if (!user) return next(new ErrorHandler("user not found", 404));
  const address = await AddressModle.deleteMany({
    userId: id,
  });
  const order = await OrderModel.deleteMany({
    userId: id,
  });

  res.status(200).json({
    success: true,
    message: "user deleted successfully",
  });
});
