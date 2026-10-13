import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/allowRole.js";

import {
    createPurchase,
    getAllPurchases,
    getPurchaseById,
     getPurchasesBySupplier,
    cancelPurchase
} from "../Controllers/purchaseController.js";

const router = express.Router();

// Create purchase
router.post("/", authMiddleware, allowRoles("admin"), createPurchase);

// Get all purchases
router.get("/", authMiddleware, allowRoles("admin"), getAllPurchases);

// Get purchase by ID
router.get("/:id", authMiddleware, allowRoles("admin"), getPurchaseById);

// Get purchases by supplier
router.get(
    "/supplier/:supplierId",
    authMiddleware,
    allowRoles("admin"),
    getPurchasesBySupplier
);

// // Cancel purchase
router.patch(
    "/:id/cancel",
    authMiddleware,
    allowRoles("admin"),
    cancelPurchase
);

export default router;
