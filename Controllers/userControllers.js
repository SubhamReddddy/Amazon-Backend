import fast2Sms from "fast-two-sms";
import { MobileOtpModel } from "../Models/MobileOtpModel.js";
import otpgenerator from "otp-generator";
import catchAsyncError from "../Utils/catchAsyncError.js";
import ErrorHandler from "../Utils/ErrorHandler.js";
import { userModel } from "../Models/UserModel.js";
import { sendCookie } from "../Utils/features.js";
import nodeMailer from "nodemailer";
import { EmailOtpModel } from "../Models/EmailOtpModel.js";
import mongoose from "mongoose";
import { AddressModle } from "../Models/AddressModel.js";
import Stripe from "stripe";
import { ProductModel } from "../Models/ProductModel.js";
import { OrderModel } from "../Models/OrderModle.js";
import { v2 as cloudinary } from "cloudinary";
import { cancleModle } from "../Models/CancleModel.js";
const StripeInstance = new Stripe(
  "sk_test_51PB8pqSCGPBJnNhBvbRAs2nI6u3B9g52D7Fq4CV8mdX3vrDEfSYPEa9RlG1sReAgqfVPGx4JOLIOdxji12KgBbvD00VuTlkbM4"
);
export const mobileotpsend = catchAsyncError(async (req, res, next) => {
  const { phoneno } = req.body;
  const isUserExist = await userModel.findOne({ phoneno });
  if (isUserExist) {
    return next(new ErrorHandler("User Allready Exist!", 403));
  }
  let update = false;
  const ifExist = await MobileOtpModel.findOne({ phoneno });

  if (ifExist) {
    const expiry =
      (ifExist.expirytime.getTime() - new Date(Date.now()).getTime()) / 60000;
    if (expiry > 0) {
      update = false;
      return res.status(429).json({
        message: `please wait ${expiry.toFixed(
          2
        )} minutes before requesting another OTP!`,
        time: ifExist.expirytime.getTime(),
      });
    } else {
      update = true;
    }
  } else {
    update = true;
  }

  if (update) {
    const otp = otpgenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    let options = {
      authorization: process.env.FAST2SMSKEY,
      message: otp,
      numbers: [phoneno],
    };
    const SMS = await fast2Sms.sendMessage(options);
    console.log(SMS);

    res.status(SMS.status_code || 200).json({
      success: SMS.return || false,
      message:
        (SMS.return ? SMS.message[0] : SMS.message) ||
        "Please try after some time!",
      time: new Date(Date.now() + 1000 * 60 * 15 * 0).getTime(),
    });

    if (SMS.return) {
      const data = await MobileOtpModel.findOneAndUpdate(
        { phoneno },
        { otp, expirytime: new Date(Date.now() + 1000 * 60 * 15 * 0) },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  }
});

export const mobileotpsendAtForgotPassword = catchAsyncError(
  async (req, res, next) => {
    const { phoneno } = req.body;
    const isUserExist = await userModel.findOne({ phoneno });
    if (!isUserExist) {
      return next(new ErrorHandler("User Not Fount!", 404));
    }
    let update = false;
    const ifExist = await MobileOtpModel.findOne({ phoneno });

    if (ifExist) {
      const expiry =
        (ifExist.expirytime.getTime() - new Date(Date.now()).getTime()) / 60000;
      if (expiry > 0) {
        update = false;
        return res.status(429).json({
          message: `please wait ${expiry.toFixed(
            2
          )} minutes before requesting another OTP!`,
          time: ifExist.expirytime.getTime(),
        });
      } else {
        update = true;
      }
    } else {
      update = true;
    }

    if (update) {
      const otp = otpgenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      let options = {
        authorization: process.env.FAST2SMSKEY,
        message: otp,
        numbers: [phoneno],
      };
      const SMS = await fast2Sms.sendMessage(options);
      res.status(SMS.status_code || 200).json({
        success: SMS.return || false,
        message:
          (SMS.return ? SMS.message[0] : SMS.message) ||
          "Please try after some time!",
        time: new Date(Date.now() + 1000 * 60 * 15).getTime(),
      });

      if (SMS.return) {
        const data = await MobileOtpModel.findOneAndUpdate(
          { phoneno },
          { otp, expirytime: new Date(Date.now() + 1000 * 60 * 15) },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }
  }
);

export const mobileotpvarify = catchAsyncError(async (req, res, next) => {
  const { phoneno, otp } = req.body;
  const data = await MobileOtpModel.findOne({ phoneno });
  if (!data) {
    return next(new ErrorHandler("Invalide Mobile Number!", 404));
  } else {
    const expiry =
      (data.expirytime.getTime() - new Date(Date.now()).getTime()) / 60000;
    if (expiry < 0) {
      return next(new ErrorHandler("your otp has been expired!", 408));
    } else {
      if (data.otp !== otp) {
        return next(new ErrorHandler("Wrong OTP Entered!", 401));
      } else {
        const user = await MobileOtpModel.deleteOne({ phoneno });
        res.status(200).json({
          success: true,
          message: "your mobile number has been successfully verified!",
        });
      }
    }
  }
});

export const userRegister = catchAsyncError(async (req, res, next) => {
  const { username, phoneno, email, password } = req.body;
  const isUserExist = await userModel.findOne({ phoneno });
  if (isUserExist) {
    return next(new ErrorHandler("User Allready Exist!", 403));
  }

  const user = await userModel.create({ username, phoneno, email, password });
  sendCookie(user, res, "Registered Successfully!", 200);
});

export const userLogin = catchAsyncError(async (req, res, next) => {
  const { phoneno, password } = req.body;
  const isUserExist = await userModel.findOne({ phoneno }).select("+password");
  if (!isUserExist) {
    return next(new ErrorHandler("Wrong phone number or password!", 401));
  }

  if (isUserExist.password !== password) {
    return next(new ErrorHandler("Wrong phone number or password!", 401));
  }
  sendCookie(isUserExist, res, `welcome back ${isUserExist.username}!`, 200);
});

export const getUserDetails = catchAsyncError(async (req, res, next) => {
  const { user } = req;
  res.status(200).json({
    success: true,
    user,
  });
});

export const getUserAddress = catchAsyncError(async (req, res, next) => {
  const { user } = req;
  const data = await AddressModle.findOne({ userId: user._id });
  if (!data) {
    return next(new ErrorHandler("Please add a delivery address !", 400));
  }

  res.status(200).json({
    success: true,
    address: data.address,
  });
});

export const emailotpsend = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const isUserExist = await userModel.findOne({ email });
  if (isUserExist) {
    return next(new ErrorHandler("User Allready Exist!", 403));
  }
  let update = false;
  const ifExist = await EmailOtpModel.findOne({ email });

  if (ifExist) {
    const expiry =
      (ifExist.expirytime.getTime() - new Date(Date.now()).getTime()) / 60000;
    if (expiry > 0) {
      update = false;
      return res.status(429).json({
        message: `please wait ${expiry.toFixed(
          2
        )} minutes before requesting another OTP!`,
        time: ifExist.expirytime.getTime(),
      });
      // return next(new ErrorHandler(`please wait ${expiry.toFixed(2)} minutes before requesting another OTP!`,429));
    } else {
      update = true;
    }
  } else {
    update = true;
  }

  if (update) {
    const otp = otpgenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const transporter = nodeMailer.createTransport({
      host: process.env.SMPT_HOST,
      port: process.env.SMPT_PORT,
      service: process.env.SMPT_SERVICE,
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMPT_MAIL,
      to: email,
      subject: "Amazon verification code",
      text: `your email verification code :\n${otp}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: `A verification code has been sent to your email ${email}`,
      time: new Date(Date.now() + 1000 * 60 * 15).getTime(),
    });
    const data = await EmailOtpModel.findOneAndUpdate(
      { email },
      { otp, expirytime: new Date(Date.now() + 1000 * 60 * 15) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
});

export const emailotpvarify = catchAsyncError(async (req, res, next) => {
  const { email, otp } = req.body;
  const data = await EmailOtpModel.findOne({ email });
  if (!data) {
    return next(new ErrorHandler("Invalide Email Address!", 404));
  } else {
    const expiry =
      (data.expirytime.getTime() - new Date(Date.now()).getTime()) / 60000;
    if (expiry < 0) {
      return next(new ErrorHandler("your otp has been expired!", 408));
    } else {
      if (data.otp !== otp) {
        return next(new ErrorHandler("Wrong OTP Entered!", 401));
      } else {
        const user = await EmailOtpModel.deleteOne({ email });
        res.status(200).json({
          success: true,
          message: "your email has been successfully verified!",
        });
      }
    }
  }
});

export const userLogout = catchAsyncError(async (req, res, next) => {
  const { AmazonToken } = req.cookies;
  if (AmazonToken) {
    res
      .status(200)
      .cookie("AmazonToken", null, {
        httpOnly: true,
        maxAge: 0,
        sameSite: "none",
        secure: true,
      })
      .json({
        success: true,
        message: "Logged Out SuccessFully!",
      });
  }
});

export const userAdress = catchAsyncError(async (req, res, next) => {
  const { flatNo, area, landmark, city, state, country, pinCode } = req.body;
  const isAddress = await AddressModle.findOne({ userId: req.user._id });
  if (isAddress) {
    if (isAddress.address.length > 0) {
      isAddress.address.push({
        flatNo,
        area,
        landmark,
        city,
        state,
        country,
        pinCode,
        defaultAddress: false,
      });
    } else {
      isAddress.address.push({
        flatNo,
        area,
        landmark,
        city,
        state,
        country,
        pinCode,
        defaultAddress: true,
      });
    }
    await isAddress.save();
  } else {
    await AddressModle.create({
      userId: req.user._id,
      address: {
        flatNo,
        area,
        landmark,
        city,
        state,
        country,
        pinCode,
        defaultAddress: true,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: "Address Added SuccessFully!",
  });
});

export const deleteUserAdress = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const data = await AddressModle.findOne({ userId: req.user._id });
  if (!data) {
    return next(new ErrorHandler("Data Not Found!", 404));
  }
  const { ObjectId } = mongoose.Types;
  const id1 = new ObjectId(String(id));
  const temp = [];

  for (let i = 0; i < data.address.length; i++) {
    if (data.address[i]._id.equals(id1)) {
      continue;
    } else {
      temp.push(data.address[i]);
    }
  }
  data.address = [...temp];
  await data.save();

  res.status(200).json({
    success: true,
    message: "Address Deleted Successfully!",
    address: temp,
  });
});

export const UserAdressDetails = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const data = await AddressModle.findOne({ userId: req.user._id });
  if (!data) {
    return next(new ErrorHandler("Data Not Found!", 404));
  }
  const { ObjectId } = mongoose.Types;
  const id1 = new ObjectId(String(id));
  let temp = null;
  for (let i = 0; i < data.address.length; i++) {
    if (data.address[i]._id.equals(id1)) {
      temp = data.address[i];
    }
  }

  if (temp === null) {
    return next(new ErrorHandler("data not found", 404));
  }

  res.status(200).json({
    success: true,
    address: temp,
  });
});

export const UserAdressUpdate = catchAsyncError(async (req, res, next) => {
  const { body } = req;
  const data = await AddressModle.findOne({ userId: req.user._id });
  if (!data) {
    return next(new ErrorHandler("Data Not Found!", 404));
  }
  const { ObjectId } = mongoose.Types;
  const id1 = new ObjectId(String(body.id));

  for (let i = 0; i < data.address.length; i++) {
    if (data.address[i]._id.equals(id1)) {
      data.address[i].flatNo = body.flatNo;
      data.address[i].area = body.area;
      data.address[i].landmark = body.landmark;
      data.address[i].city = body.city;
      data.address[i].state = body.state;
      data.address[i].country = body.country;
      data.address[i].pinCode = body.pinCode;
    }
  }
  data.save();

  res.status(200).json({
    success: true,
    message: "Address Updated Successfully!",
  });
});

export const UpdateUserName = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req.user._id);
  const { name } = req.body;
  user.username = name;
  user.save();

  res.status(200).json({
    success: true,
    message: "Name Updated SuccessFully!",
    user,
  });
});

export const UpdateEmail = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req.user._id);
  const { newEmail } = req.body;
  user.email = newEmail;
  user.save();

  res.status(200).json({
    success: true,
    message: "Email Updated SuccessFully!",
    user,
  });
});

export const UpdatePhone = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req.user._id);
  const { NewPhoneNumber } = req.body;
  user.phoneno = NewPhoneNumber;
  user.save();

  res.status(200).json({
    success: true,
    message: "Phone Number Updated SuccessFully!",
    user,
  });
});

export const UpdatePassword = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req.user._id).select("+password");
  const { newPassword } = req.body;
  if (user.password === newPassword) {
    return next(new ErrorHandler("please enter a different password !", 403));
  }
  user.password = newPassword;
  user.save();

  res.status(200).json({
    success: true,
    message: "Your Password Updated SuccessFully!",
    user,
  });
});

export const ForgotPassword = catchAsyncError(async (req, res, next) => {
  const { phoneno, newPassword } = req.body;
  const user = await userModel.findOne({ phoneno }).select("+password");
  if (user.password === newPassword) {
    return next(new ErrorHandler("please enter a different password !", 403));
  }
  user.password = newPassword;
  user.save();

  res.status(200).json({
    success: true,
    message: "Your Password Updated SuccessFully!",
  });
});

export const payment = catchAsyncError(async (req, res, next) => {
  const { data } = req.body;
  const products = data.cart;
  const { address } = data;
  const deliveryAddress = address.find(
    (element) => element.defaultAddress === true
  );

  // creating line items
  const line_items = products.map((items) => {
    return {
      price_data: {
        currency: "INR",
        product_data: {
          name: items.productName,
          images: [items.images[0].url],
          description: items.productDiscription,
        },
        unit_amount: Number(
          (items.productPrice * 100 + items.productPrice * 100 * 0.28).toFixed(
            2
          )
        ),
      },
      quantity: items.quantity,
    };
  });

  // Create or retrieve customer object
  const customer = await StripeInstance.customers.create({
    email: req.user.email,
    name: req.user.username,
    address: {
      line1: deliveryAddress.area,
      city: deliveryAddress.city,
      state: deliveryAddress.state,
      postal_code: deliveryAddress.pinCode,
      country: "IN",
    },
  });

  // creating customer object
  const session = await StripeInstance.checkout.sessions.create({
    payment_method_types: ["card"],
    customer: customer.id, // Associate session with customer
    line_items,
    mode: "payment",
    success_url: `${process.env.FRONTEND}/payment/success`,
    cancel_url: `${process.env.FRONTEND}/product/cart`,
  });

  res.status(200).json({
    success: true,
    id: session.id,
  });
});

export const defaultAddressUpdate = catchAsyncError(async (req, res, next) => {
  const { id } = req.body;
  const data = await AddressModle.findOne({ userId: req.user._id });
  const { ObjectId } = mongoose.Types;
  const id1 = new ObjectId(String(id));

  for (let i = 0; i < data.address.length; i++) {
    if (data.address[i]._id.equals(id1)) {
      data.address[i].defaultAddress = true;
    } else {
      data.address[i].defaultAddress = false;
    }
  }
  data.save();
  res.status(200).json({
    success: true,
    address: data.address,
  });
});

export const paymentStatus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { cart } = req.body;
  const address = await AddressModle.find({ userId: req.user._id }).select(
    "address"
  );
  const deliveryAddress = address[0].address.find(
    (element) => element.defaultAddress === true
  );

  // create order in database
  if (id) {
    // shipping address
    const shippingAddress = {
      flatNo: deliveryAddress.flatNo,
      area: deliveryAddress.area,
      landmark: deliveryAddress.landmark,
      city: deliveryAddress.city,
      state: deliveryAddress.state,
      country: deliveryAddress.country,
      pinCode: deliveryAddress.pinCode,
    };

    let orderItems = [];
    let totalAmount = 0;
    const promise1 = cart.forEach(async (element) => {
      orderItems.push({
        productId: element._id,
        quantity: element.quantity,
        baseAmount: element.productPrice * element.quantity,
        productName: element.productName,
        productDiscription: element.productDiscription,
        images: element.images[0].url,
        deliveryStatus: "Pending",
      });
      totalAmount = totalAmount + element.productPrice * element.quantity;
    });

    const promise2 = OrderModel.create({
      userId: req.user._id,
      orderItems,
      totalAmount,
      paymentStatus: "unpaid",
      onlineTransactionId: id,
      shippingAddress,
    });
    await Promise.all([promise1, promise2]);
  }

  const session = await StripeInstance.checkout.sessions.retrieve(id);

  if (session.payment_status === "paid") {
    const isOrdered = await OrderModel.findOne({ onlineTransactionId: id });
    isOrdered.paymentStatus = session.payment_status;
    await isOrdered.save();
    const products = isOrdered.orderItems;
    products.forEach(async (element) => {
      const product = await ProductModel.findById({ _id: element.productId });
      product.productStock = product.productStock - element.quantity;
      product.sells = product.sells + element.quantity;
      await product.save();
    });
  }
  res.status(200).json({
    success: true,
    paymentStatus: session.payment_status,
  });
});

export const getAllOrders = catchAsyncError(async (req, res, next) => {
  const orders = await OrderModel.find({ userId: req.user._id });
  res.status(200).json({
    success: true,
    orders,
  });
});

export const getSingleOrders = catchAsyncError(async (req, res, next) => {
  const { id1, id2 } = req.params;
  const { ObjectId } = mongoose.Types;
  const id = new ObjectId(String(id2));
  const orders = await OrderModel.findOne({ _id: id1 });
  if (!orders) return next(new ErrorHandler("order not found", 404));
  let Item = null;
  orders.orderItems.forEach((element, idx) => {
    if (element._id.equals(id)) {
      Item = element;
      return;
    }
  });
  if (!Item) return next(new ErrorHandler("order not found", 404));
  const data = {
    Item,
    shippingAddress: orders.shippingAddress,
    paymentStatus: orders.paymentStatus,
  };

  res.status(200).json({
    success: true,
    data,
  });
});

export const updateUserAvtar = catchAsyncError(async (req, res, next) => {
  const { avtar } = req.body;

  const user = await userModel.findById({ _id: req.user._id });

  const noobres = await cloudinary.uploader.destroy(user.avtar.public_id);

  let CloudinaryAvtarArray = {};
  try {
    const response = await cloudinary.uploader.upload(avtar, {
      folder: "Amazon_Avatars",
    });
    CloudinaryAvtarArray = {
      public_id: response.public_id,
      url: response.secure_url,
    };
  } catch (error) {
    return next(new ErrorHandler(error.message, error.http_code));
  }

  user.avtar = CloudinaryAvtarArray;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});

export const AddReview = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { review, addRating } = req.body;

  const product = await ProductModel.findById({ _id: id });
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  if (product.rating.count === 0) {
    product.rating.count = 1;
    product.rating.rate = addRating;
    product.rating.reviews.push({
      userId: req.user._id,
      userName: req.user.username,
      message: review,
      rating: addRating,
      userAvtar: req.user.avtar.url,
    });
  } else {
    const isReviewed = product.rating.reviews.find((rev) =>
      rev.userId.equals(req.user._id)
    );
    if (isReviewed) {
      product.rating.rate =
        (product.rating.rate * product.rating.count -
          isReviewed.rating +
          addRating) /
        product.rating.count;
      product.rating.reviews.forEach((item) => {
        if (item.userId.equals(req.user._id)) {
          item.message = review;
          item.rating = addRating;
        }
      });
    } else {
      product.rating.rate =
        (product.rating.rate * product.rating.count + addRating) /
        (product.rating.count + 1);
      product.rating.count = product.rating.count + 1;
      product.rating.reviews.push({
        userId: req.user._id,
        userName: req.user.username,
        message: review,
        rating: addRating,
        userAvtar: req.user.avtar.url,
      });
    }
  }

  await product.save();
  res.status(200).json({
    success: true,
    message: "Review Added Successfully",
    product,
  });
});

export const latestProducts = catchAsyncError(async (req, res, next) => {
  const thisMonthEnd = new Date();
  const thisMonthStart = new Date(
    thisMonthEnd.getFullYear(),
    thisMonthEnd.getMonth(),
    1
  );

  const products = await ProductModel.find({
    createdAt: {
      $gte: thisMonthStart,
      $lte: thisMonthEnd,
    },
  });

  res.status(200).json({
    success: true,
    products,
  });
});

export const mostSellProducts = catchAsyncError(async (req, res, next) => {
  const products = await ProductModel.find({}).sort({ sells: -1 }).limit(10);
  res.status(200).json({
    success: true,
    products,
  });
});

export const womensProduct = catchAsyncError(async (req, res, next) => {
  const products = await ProductModel.find({
    productName: {
      $regex: "women",
      $options: "i",
    },
  });
  res.status(200).json({
    success: true,
    products,
  });
});

export const mensProduct = catchAsyncError(async (req, res, next) => {
  const products = await ProductModel.find({
    productName: {
      $regex: "\\bmen\\b",
      $options: "i",
    },
  });
  res.status(200).json({
    success: true,
    products,
  });
});

export const addToWish = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const product = await ProductModel.findById({ _id: id }).select("_id");
  const user = await userModel.findById({ _id: req.user._id });
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  if (user.wishes.length > 0) {
    const index = user.wishes.findIndex((wish) => wish.productId.equals(id));
    if (index !== -1) {
      user.wishes.splice(index, 1);
      await user.save();
      res.status(200).json({
        success: true,
        message: "Product Removed from wishlist",
        user,
      });
    } else {
      user.wishes.push({ productId: id });
      await user.save();
      res.status(200).json({
        success: true,
        message: "Product Added to wishlist",
        user,
      });
    }
  } else {
    user.wishes.push({ productId: id });
    await user.save();
    res.status(200).json({
      success: true,
      message: "Product Added to wishlist",
      user,
    });
  }
});

export const wishListProducts = catchAsyncError(async (req, res, next) => {
  const products = [];
  const { wishes } = await userModel
    .findById({ _id: req.user.id })
    .select("wishes");

  for (const wish of wishes) {
    const product = await ProductModel.findById({ _id: wish.productId });
    if (product) {
      products.push(product);
    }
  }
  res.status(200).json({
    products,
  });
});

export const cancelOrderCon = catchAsyncError(async (req, res, next) => {
  const { id1, id2 } = req.params;

  const order = await OrderModel.findById({ _id: id1 });

  const { ObjectId } = mongoose.Types;
  const id = new ObjectId(String(id2));

  order.orderItems.forEach(async (item) => {
    if (item._id.equals(id)) {
      if (item.deliveryStatus !== "Cancelled") {
        item.deliveryStatus = "Cancelled";
        const data = await cancleModle.create({ orderId1: id1, orderId2: id2 });
      }
    }
  });
  await order.save();

  res.status(200).json({
    success: true,
    message: "Order Cancelled Successfully",
    order,
  });
});
