import purchaseModel from "../models/purchase.js";
import productModels from "../models/product.js";
import supplierModels from "../models/Supplier.js";
import { ApiResponse } from "../utils/respatterns.js";

export async function createPurchase(req, res, next) {
    try {
        const { supplier, items, paymentStatus } = req.body;

        // Validate required fields
        if (!supplier || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json(
                new ApiResponse(
                    false,
                    null,
                    "Supplier and purchase items are required"
                )
            );
        }

        // Check supplier
        const supplierExists = await supplierModels.findById(supplier);

        if (!supplierExists) {
            return res.status(404).json(
                new ApiResponse(false, null, "Supplier not found")
            );
        }

        let totalAmount = 0;
        const purchaseItems = [];

        // Validate products and calculate total
        for (const item of items) {
            const { product, quantity, purchasePrice } = item;

            if (
                !product ||
                !Number.isInteger(quantity) ||
                quantity <= 0 ||
                !Number.isFinite(purchasePrice) ||
                purchasePrice < 0
            ) {
                return res.status(400).json(
                    new ApiResponse(
                        false,
                        null,
                        "Valid product, quantity and purchase price are required"
                    )
                );
            }

            const productExists = await productModels.findById(product);

            if (!productExists) {
                return res.status(404).json(
                    new ApiResponse(false, null, "Product not found")
                );
            }

            const itemTotal = quantity * purchasePrice;

            totalAmount += itemTotal;

            purchaseItems.push({
                product,
                quantity,
                purchasePrice,
                total: itemTotal
            });
        }

        // Create purchase
        const purchase = await purchaseModel.create({
            supplier,
            items: purchaseItems,
            totalAmount,
            paymentStatus
        });

        // Update product stock
        for (const item of purchaseItems) {
            await productModels.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        return res.status(201).json(
            new ApiResponse(
                true,
                purchase,
                "Purchase created successfully"
            )
        );

    } catch (error) {
        return res.status(500).json(new ApiResponse(false, null, "internal Server error"))
    }
}


export async function getAllPurchases(req, res, next) {
    try {

        const purchases = await purchaseModel.find({ isDeleted: false })
            .populate("supplier", "name email phone")
            .populate("items.product", "name sku stock price")
            .sort({ createdAt: -1 })


        return res.status(200).json(new ApiResponse(true, purchases, "All purchases fetched successfully"))



    } catch (error) {

        return res.status(500).json(false, null, "Internal Server error")

    }
}

export async function getPurchaseById(req, res, next) {
    try {

        const { id } = req.params;

        const purchase = await purchaseModel.findOne({ _id: id, isDeleted: false })
            .populate("supplier", "name email phone")
            .populate("items.product", "name sku price stock description")


        if (!purchase) {
            return res.status(404).json(new ApiResponse(false, null, "purchase not found"))
        }

        return res.status(200).json(new ApiResponse(true, purchase, "Purchase fetched successfully"))
    }

    catch (error) {
        
        return res.status(500).json(new ApiResponse(false , null , "Internal Server error"))

    }
}

export async function getPurchasesBySupplier(req, res, next) {
    try {
        const { supplierId } = req.params;

        const purchases = await purchaseModel
            .find({ supplier: supplierId, isDeleted: false })
            .populate("supplier", "name email phone")
            .populate("items.product", "name sku price stock")
            .sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(true, purchases, "Supplier purchases fetched successfully")
        );
    } catch (error) {
        return res.status(500).json(new ApiResponse(false , null , "Internal Server error"))
    }
}


export async function cancelPurchase(req, res, next) {
    try {
        const { id } = req.params;

        const purchase = await purchaseModel.findOne({
            _id: id,
            isDeleted: false
        });

        if (!purchase) {
            return res.status(404).json(
                new ApiResponse(false, null, "Purchase not found")
            );
        }

        // Prevent cancelling the samepurchase twice
        
        purchase.isDeleted = true;
        await purchase.save();

        // Reverse the stock increase from this purchase
        for (const item of purchase.items) {
            await productModels.findByIdAndUpdate(
                item.product,
                { $inc: { stock: -item.quantity } }
            );
        }

        return res.status(200).json(
            new ApiResponse(true, purchase, "Purchase cancelled successfully")
        );
    } catch (error) {
       return res.status(500).json(new ApiResponse(false , null , "Inter"))
    }
}