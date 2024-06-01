import express from "express";

import { isAdmin, isAuthoriser } from "../Middlewares/auth.js";
import { addNewProduct } from "../Controllers/AdminControllers.js";
import {
  getAllProduct,
  getAllProductFilter,
  getProductsByCatagory,
  getSingleProduct,
} from "../Controllers/productControllers.js";
import {
  latestProducts,
  mensProduct,
  mostSellProducts,
  womensProduct,
} from "../Controllers/userControllers.js";

const productRoutes = express.Router();

productRoutes.post("/admin/product/add", isAuthoriser, isAdmin, addNewProduct);
productRoutes.get("/admin/product/all", getAllProduct);
productRoutes.get("/admin/product/filter", getAllProductFilter);
productRoutes.get("/admin/product/latest", latestProducts);
productRoutes.get("/admin/product/mostsell", mostSellProducts);
productRoutes.get("/admin/product/womensproduct", womensProduct);
productRoutes.get("/admin/product/mensproduct", mensProduct);
productRoutes.get("/admin/product/:id", getSingleProduct);
productRoutes.get(
  "/admin/product/category/:productCategories",
  getProductsByCatagory
);

export default productRoutes;
