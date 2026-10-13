import mongoose from "mongoose";
import Receipt from "../models/receipt.js";
import productModels from "../models/product.js";
import { ApiResponse } from "../utils/respatterns.js";


export async function generateReceipt(req, res, next) {
    console.log("[1] Generate receipt API called");

    try {
        console.log("[2] Request body:", req.body);

        const { customerName, customerPhone, items } = req.body;

        if (!customerName || !Array.isArray(items) || items.length === 0) {
            console.log("[ERROR] Invalid request body");

            return res.status(400).json(
                new ApiResponse(false, null, "Customer name and items are required")
            );
        }

        for (const item of items) {
            if (
                !mongoose.isValidObjectId(item.productId) ||
                !Number.isInteger(item.quantity) ||
                item.quantity < 1
            ) {
                console.log("[ERROR] Invalid item:", item);

                return res.status(400).json(
                    new ApiResponse(false, null, "Invalid product ID or quantity")
                );
            }
        }

        console.log("[3] Validation successful");

        let grandTotal = 0;
        const receiptItems = [];
        const deductedItems = [];

        try {
            for (const item of items) {
                const { productId, quantity } = item;

                console.log("[4] Finding product:", productId);

                const product = await productModels.findOneAndUpdate(
                    {
                        _id: productId,
                        isDeleted: false,
                        stock: { $gte: quantity }
                    },
                    { $inc: { stock: -quantity } },
                    { new: true, maxTimeMS: 5000 }
                );

                console.log("[5] Product query completed");

                if (!product) {
                    throw new Error(
                        `Product not found or insufficient stock: ${productId}`
                    );
                }

                deductedItems.push({
                    productId: product._id,
                    quantity
                });

                const price = Number(product.price);

                if (!Number.isFinite(price) || price < 0) {
                    throw new Error(`Invalid product price: ${productId}`);
                }

                const total = price * quantity;

                receiptItems.push({
                    product: product._id,
                    name: product.name,
                    quantity,
                    price,
                    total
                });

                grandTotal += total;

                console.log("[6] Product processed:", product.name);
            }

            const receiptNumber =
                `REC-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

            console.log("[7] Saving receipt:", receiptNumber);

            const receipt = await Receipt.create({
                receiptNumber,
                customerName,
                customerPhone: customerPhone || "",
                items: receiptItems,
                grandTotal
            });

            console.log("[8] Receipt saved:", receipt._id);

            return res.status(201).json(
                new ApiResponse(true, receipt, "Receipt generated successfully")
            );

        } catch (error) {
            console.error("[PROCESSING ERROR]", error.message);

            for (const item of deductedItems) {
                await productModels.updateOne(
                    { _id: item.productId },
                    { $inc: { stock: item.quantity } },
                    { maxTimeMS: 5000 }
                );
            }

            throw error;
        }

    } catch (error) {
        console.error("[GENERATE RECEIPT ERROR]", error);

        if (
            error.message.startsWith("Product not found") ||
            error.message.startsWith("Invalid product")
        ) {
            return res.status(400).json(
                new ApiResponse(false, null, error.message)
            );
        }

        return next(error);
    }
}


