import express from "express";
import {
  AddReview,
  ForgotPassword,
  UpdateEmail,
  UpdatePassword,
  UpdatePhone,
  UpdateUserName,
  UserAdressDetails,
  UserAdressUpdate,
  addToWish,
  defaultAddressUpdate,
  deleteUserAdress,
  emailotpsend,
  emailotpvarify,
  getAllOrders,
  getSingleOrders,
  getUserAddress,
  getUserDetails,
  mobileotpsend,
  mobileotpsendAtForgotPassword,
  mobileotpvarify,
  payment,
  paymentStatus,
  updateUserAvtar,
  userAdress,
  userLogin,
  userLogout,
  userRegister,
  wishListProducts,
} from "../Controllers/userControllers.js";
import { isAuthoriser } from "../Middlewares/auth.js";

const userRoute = express.Router();

userRoute.post("/user/signup", userRegister);
userRoute.post("/user/login", userLogin);
userRoute.get("/user/me", isAuthoriser, getUserDetails);
userRoute.get("/user/me/address", isAuthoriser, getUserAddress);
userRoute.get("/user/logout", isAuthoriser, userLogout);
userRoute.post("/user/mobileauth", mobileotpsend);
userRoute.post(
  "/user/mobileauth/forgot/password",
  mobileotpsendAtForgotPassword
);
userRoute.post("/user/mobilevarify", mobileotpvarify);
userRoute.post("/user/sendotpemail", emailotpsend);
userRoute.post("/user/emailvarify", emailotpvarify);
userRoute.post("/user/address", isAuthoriser, userAdress);
userRoute.delete("/user/address/delete/:id", isAuthoriser, deleteUserAdress);
userRoute.get("/user/address/details/:id", isAuthoriser, UserAdressDetails);
userRoute.put("/user/address/update", isAuthoriser, UserAdressUpdate);
userRoute.put("/user/me/update/avtar", isAuthoriser, updateUserAvtar);
userRoute.put("/user/me/update/username", isAuthoriser, UpdateUserName);
userRoute.put("/user/me/update/email", isAuthoriser, UpdateEmail);
userRoute.put("/user/me/update/phone", isAuthoriser, UpdatePhone);
userRoute.put("/user/me/update/password", isAuthoriser, UpdatePassword);
userRoute.put("/user/me/forgot/password", ForgotPassword);
userRoute.post("/user/me/payment", isAuthoriser, payment);
userRoute.post("/user/me/paymentstatus/:id", isAuthoriser, paymentStatus);
userRoute.get("/user/me/wish/products", isAuthoriser, wishListProducts);
userRoute.get("/user/me/wish/:id", isAuthoriser, addToWish);
getAllOrders;
userRoute.put(
  "/user/me/defaultAddressUpdate",
  isAuthoriser,
  defaultAddressUpdate
);
userRoute.get("/user/me/Orders", isAuthoriser, getAllOrders);
userRoute.get("/user/me/Orders/:id1/:id2", isAuthoriser, getSingleOrders);
userRoute.post("/user/me/rating/:id", isAuthoriser, AddReview);
export default userRoute;
