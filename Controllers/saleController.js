import mongoose from "mongoose";
import ProductModels from "../models/product.js";
import saleModels from "../models/sale.js";
import { ApiResponse } from "../utils/respatterns.js";


export async function createSale(req, res, next) {
    try {
        const { customerName, items, paymentMethod, paymentStatus } = req.body;

        if (
            !customerName?.trim() ||
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return res.status(400).json(
                new ApiResponse(false, null, "Customer name and items are required")
            );
        }

        const purchaseItems = [];
        const stockRequired = new Map();
        let totalAmount = 0;

        // Validate items and calculate total stock required
        for (const item of items) {
            const { product, quantity } = item;

            if (
                !product ||
                !mongoose.isValidObjectId(product) ||
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {
                return res.status(400).json(
                    new ApiResponse(false, null, "Valid product ID and quantity are required")
                );
            }

            const productExists = await ProductModels.findById(product);

            if (!productExists) {
                return res.status(404).json(
                    new ApiResponse(false, null, "Product not found")
                );
            }

            const sellingPrice = Number(productExists.price);

            if (!Number.isFinite(sellingPrice) || sellingPrice < 0) {
                return res.status(400).json(
                    new ApiResponse(false, null, "Invalid product selling price")
                );
            }

            const itemTotal = quantity * sellingPrice;
            totalAmount += itemTotal;

            stockRequired.set(
                product,
                (stockRequired.get(product) || 0) + quantity
            );

            purchaseItems.push({
                product,
                quantity,
                sellingPrice,
                total: itemTotal
            });
        }

        // Check whether sufficient stock is available
        for (const [productId, quantity] of stockRequired) {
            const product = await ProductModels.findById(productId);

            if (product.stock < quantity) {
                return res.status(400).json(
                    new ApiResponse(
                        false,
                        null,
                        `Insufficient stock for ${product.name}`
                    )
                );
            }
        }

        // Reduce stock
        for (const [productId, quantity] of stockRequired) {
            const updatedProduct = await ProductModels.findOneAndUpdate(
                { _id: productId, stock: { $gte: quantity } },
                { $inc: { stock: -quantity } },
                { new: true }
            );

            if (!updatedProduct) {
                // Restore previous stock changes if a later update fails
                for (const [rollbackId, rollbackQty] of stockRequired) {
                    if (rollbackId === productId) break;

                    await ProductModels.findByIdAndUpdate(
                        rollbackId,
                        { $inc: { stock: rollbackQty } }
                    );
                }

                return res.status(409).json(
                    new ApiResponse(false, null, "Stock changed. Please try again")
                );
            }
        }

        const sale = await saleModels.create({
            customerName: customerName.trim(),
            items: purchaseItems,
            totalAmount,
            paymentMethod,
            paymentStatus
        });

        return res.status(201).json(
            new ApiResponse(true, sale, "Sale created successfully")
        );
    } catch (error) {
        return res.status(500).json(new ApiResponse(false , null , "Internal server error"));
    }
}


export async function getAllSales(req,res , next){
    try{

        const sales = await saleModels.find({isDeleted : false})
        .populate("items.product" , "name sku price stock")
        .sort({createdAt : -1});

        return res.status(200).json(new ApiResponse(true ,sales , "All sales fetched successfully"));


    } catch(error) {
       return res.status(500).json(new ApiResponse (false , null , "Internal server error"))
    }
}

export async function getSaleById(req,res,next) {
     try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json(
                new ApiResponse(false, null, "Invalid sale ID")
            );
        }

        const sale = await saleModels
            .findOne({ _id: id, isDeleted: false })
            .populate("items.product", "name sku price stock");

        if (!sale) {
            return res.status(404).json(
                new ApiResponse(false, null, "Sale not found")
            );
        }

        return res.status(200).json(
            new ApiResponse(true, sale, "Sale fetched successfully")
        );
    } catch (error) {
       return res.status(500).json(new ApiResponse(false , null , "Internal Server error"))
    }
}

export async function cancelSale(req , res , next){
     try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json(
                new ApiResponse(false, null, "Invalid sale ID")
            );
        }

        const sale = await saleModels.findOne({
            _id: id,
            isDeleted: false
        });

        if (!sale) {
            return res.status(404).json(
                new ApiResponse(false, null, "Sale not found or already cancelled")
            );
        }

    
        const stockRestored = [];

        for (const item of sale.items) {
            const product = await ProductModels.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity } },
                { new: true }
            );

            if (!product) {
                // Roll back previous restorations if a product is missing
                for (const restored of stockRestored) {
                    await ProductModels.findByIdAndUpdate(
                        restored.product,
                        { $inc: { stock: -restored.quantity } }
                    );
                }

                return res.status(409).json(
                    new ApiResponse(
                        false,
                        null,
                        "A product is missing; sale cancellation was not completed"
                    )
                );
            }

            stockRestored.push({
                product: item.product,
                quantity: item.quantity
            });
        }

        sale.isDeleted = true;
        await sale.save();

        return res.status(200).json(
            new ApiResponse(true, sale, "Sale cancelled and stock restored successfully")
        );
    } catch (error) {
         return res.status(500).json(new ApiResponse(false , null , "Internal Server error"));
    }
}
