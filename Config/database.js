import mongoose from "mongoose";

export const DB_Connection = () => {
  mongoose
    .connect(
      process.env.DBConnection,
    )
    .then(() => {
      console.log("successfully connected to mongodb database!");
    })
    .catch((error) => {
      console.log(error.message);
    });
};
