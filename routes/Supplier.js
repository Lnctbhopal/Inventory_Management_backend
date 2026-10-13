import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import allowedRoles from "../middleware/allowRole.js";
import { registerSupplier , getAllSuppliers , updateSupplier , deleteSupplier , searchSupplier } from "../Controllers/supplierController.js";

const router = express.Router();

router.post("/register",registerSupplier);

router.get("/getAll", authMiddleware, allowedRoles("admin"), getAllSuppliers);

router.patch("/:id" , updateSupplier)

router.delete("/:id" , deleteSupplier);

router.get("/search/:name?/:state?", searchSupplier);

export default router;