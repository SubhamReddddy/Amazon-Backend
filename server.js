import { app } from "./app.js";
import { DB_Connection } from "./Config/database.js";
import errorMiddleware from "./Middlewares/error.js";
import { v2 as cloudinary } from "cloudinary";
import { EventEmitter } from "events";
// connecting to database
DB_Connection();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

process.on("warning", (warning) => {
  console.warn(warning.name); // Print the warning name
  console.warn(warning.message); // Print the warning message
  console.warn(warning.stack); // Print the stack trace
});

EventEmitter.defaultMaxListeners = 15; // or any number greater than the number of listeners you expect to add

app.listen(process.env.PORT, () => {
  console.log(
    `connected to the server || http://localhost:${process.env.PORT}`
  );
});

app.use(errorMiddleware);
