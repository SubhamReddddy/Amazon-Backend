import { ProductModel } from "../Models/ProductModel.js";
import ErrorHandler from "../Utils/ErrorHandler.js";
import catchAsyncError from "../Utils/catchAsyncError.js";

export const getAllProduct = catchAsyncError(async (req, res, next) => {
  const products = await ProductModel.find();
  if (products.length === 0) {
    return next(new ErrorHandler("store does not have any products!", 404));
  }
  res.status(200).json({
    success: true,
    products,
  });
});

export const getSingleProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const product = await ProductModel.findById(id);
  if (!product) {
    return next(new ErrorHandler("Product Not Found!", 404));
  }
  res.status(200).json({
    success: true,
    product,
  });
});

export const getProductsByCatagory = catchAsyncError(async (req, res, next) => {
  const { productCategories } = req.params;
  const product = await ProductModel.find({ productCategories });
  if (!product) {
    return next(new ErrorHandler("Product Not Found!", 404));
  }
  res.status(200).json({
    success: true,
    product,
  });
});

export const getAllProductFilter = catchAsyncError(async (req, res, next) => {
  const limit = 10;
  let totalPages;
  const { search, productCategories, currentPage, less } = req.query;
  const skip = (currentPage - 1) * limit;

  let FatchQuery = {};
  if (search) {
    FatchQuery.productName = {
      $regex: search,
      $options: "i",
    };
  }

  if (less) {
    FatchQuery.productPrice = {
      $lt: less,
    };
  }

  if (productCategories) {
    FatchQuery.productCategories = productCategories;
  }

  const product = await ProductModel.find(FatchQuery).limit(limit).skip(skip);
  const allProduct = await ProductModel.find(FatchQuery);

  totalPages = Math.ceil(allProduct.length / limit);

  res.status(200).json({
    success: true,
    product,
    totalPages,
  });
});
