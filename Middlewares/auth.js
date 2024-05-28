import { userModel } from "../Models/UserModel.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "../Utils/ErrorHandler.js";
export const isAuthoriser = async (req, res, next) => {
  const { AmazonToken } = req.cookies;
  if (AmazonToken) {
    const { AmazonToken } = req.cookies;
    const { _id } = jwt.verify(AmazonToken, process.env.JWT_SECRET);
    const user = await userModel.findById({ _id });
    if (user) {
      req.user = user;
      return next();
    } else {
      return next(new ErrorHandler("user not found", 404));
    }
  } else {
    res.status(400).json({
      success: false,
      message: "Please Login First",
    });
  }
};

export const isAdmin = async (req, res, next) => {
  const user = req.user;
  if (user.role === "admin") {
    return next();
  } else {
    res.status(400).json({
      success: false,
      message: "Please Login To Admin Account",
    });
  }
};
