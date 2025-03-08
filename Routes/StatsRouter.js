import express from "express";
import { isAdmin, isAuthoriser } from "../Middlewares/auth.js";
import { PieChart, Stats, cancle } from "../Controllers/StatsController.js";

const StatsRouter = express.Router();

StatsRouter.get("/admin/stats", isAuthoriser, isAdmin, Stats);
StatsRouter.get("/admin/piechart", isAuthoriser, isAdmin, PieChart);
StatsRouter.get("/admin/cancel", isAuthoriser, isAdmin, cancle);
export default StatsRouter;
