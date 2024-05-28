import mongoose from "mongoose";

export const DB_Connection = () => {
  mongoose
    .connect(
      "mongodb+srv://subhamreddy121:lctJTPLGhWkKC0Dh@cluster0.1qyxmdh.mongodb.net/Amazon_clone"
    )
    .then(() => {
      console.log("successfully connected to mongodb database!");
    })
    .catch((error) => {
      console.log(error.message);
    });
};
