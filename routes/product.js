import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/allowRole.js";

import {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProduct,
    scanProduct,
    viewProduct
} from "../Controllers/productController.js";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    allowRoles("admin"),
    getAllProducts
);

router.post(
    "/",
    authMiddleware,
    allowRoles("admin"),
    createProduct
);

router.patch(
    "/",
    authMiddleware,
    allowRoles("admin"),
    updateProduct
);

router.delete(
    "/",
    authMiddleware,
    allowRoles("admin"),
    deleteProduct
);

router.put(
    "/Category",
    authMiddleware,
    allowRoles("admin", "user"),
    searchProduct
);

// Scan barcode
router.post(
    "/scan",
    authMiddleware,
    allowRoles("admin", "user"),
    scanProduct
);

router.get(
    "/view/:barcode",
    viewProduct
);

export default router;