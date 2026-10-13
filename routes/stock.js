import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import allowedRoles from "../middleware/allowRole.js";
import { addStock , getAllStock , updateStock , deleteStock , searchStock , detailsStock} from "../Controllers/stockController.js";


const router = express.Router();

router.post("/add", authMiddleware, allowedRoles("admin", "manager"), addStock); 

router.get("/", authMiddleware , allowedRoles("admin", "manager"), getAllStock);

router.patch("/:id", authMiddleware, allowedRoles("admin"), updateStock);

router.delete("/:id", authMiddleware, allowedRoles("admin"), deleteStock);

router.post("/search" , authMiddleware, allowedRoles("admin") ,searchStock);

router.get("/:id" , authMiddleware, allowedRoles("admin") ,detailsStock);

export default router;