import express from "express";
import { isAdmin, isAuthoriser } from "../Middlewares/auth.js";
import {
  DeleteProduct,
  UpdateProduct,
  deleteUser,
  getAllOrders,
  getAllUsers,
  getSingleUser,
  updateOrders,
  updateUser,
} from "../Controllers/AdminControllers.js";

const AdminRoutes = express.Router();

AdminRoutes.get("/admin/users/all", isAuthoriser, isAdmin, getAllUsers);
AdminRoutes.get("/admin/users/:id", isAuthoriser, isAdmin, getSingleUser);
AdminRoutes.post("/admin/users/update", isAuthoriser, isAdmin, updateUser);
AdminRoutes.get("/admin/orders/all", isAuthoriser, isAdmin, getAllOrders);
AdminRoutes.post("/admin/orders/update", isAuthoriser, isAdmin, updateOrders);
AdminRoutes.put("/admin/product/update", isAuthoriser, isAdmin, UpdateProduct);
AdminRoutes.delete(
  "/admin/product/delete/:id",
  isAuthoriser,
  isAdmin,
  DeleteProduct
);
AdminRoutes.delete("/admin/user/delete/:id", isAuthoriser, isAdmin, deleteUser);
export default AdminRoutes;
