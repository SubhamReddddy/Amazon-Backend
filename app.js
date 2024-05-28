import express from "express";
import dotenv from "dotenv";
import path from "path";
import userRoute from "./Routes/userRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import AdminRoutes from "./Routes/adminRoutes.js";
import productRoutes from "./Routes/productRoutes.js";
import StatsRouter from "./Routes/StatsRouter.js";

//config env file path
dotenv.config({ path: path.join(path.resolve(), "./Config/config.env") });

//creating a instance of express
export const app = express();

//useing middelwears
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());
app.use(cookieParser());
app.use(
  cors({
    origin: [`${process.env.FRONTEND}`],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
//routes
app.use("/api/v1", userRoute);
app.use("/api/v1", productRoutes);
app.use("/api/v1", AdminRoutes);
app.use("/api/v1", StatsRouter);
