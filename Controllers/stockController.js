import { ApiResponse } from "../utils/respatterns.js";
import mongoose from "mongoose";
import stockModels from "../models/stock.js";
import productModels from "../models/product.js";


export async function addStock(req, res, next) {
  try {
    const { productId, quantity, minStock, maxStock } = req.body;

    console.log("REQ BODY:", req.body);

    // 1. Required field validation (Proper check for numbers)
    if (
      !productId ||
      quantity === undefined ||
      minStock === undefined ||
      maxStock === undefined
    ) {
      return res.status(400).json(
        new ApiResponse(false, null, "Missing required fields: productId, quantity, minStock, maxStock are required")
      );
    }

    // 2. Validate MongoDB ObjectId format before database query
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json(
        new ApiResponse(false, null, "Invalid productId format")
      );
    }

    // 3. Check product existence in Database
    const productExists = await productModels.findById(productId);

    if (!productExists) {
      return res.status(404).json(
        new ApiResponse(false, null, "Product not found")
      );
    }

    // 4. Create stock record
    const newStock = await stockModels.create({
      productId,
      quantity,
      minStock,
      maxStock,
    });

    return res.status(201).json({
      status: true,
      message: "Stock added successfully",
      data: newStock,
    });

  } catch (error) {
    console.error("EXACT ERROR IN ADDSTOCK:", error);

    return res.status(500).json(
      new ApiResponse(false, null, "Internal server error")
    );
  }
}

export async function getAllStock(req, res, next) {
  try {
    const stocks = await stockModels.find().populate("productId", "name price description category");

    if (!stocks || stocks.length === 0) {
      return res.status(404).json(
        new ApiResponse(false, null, "No stocks found")
      );
    }

    return res.status(200).json(new ApiResponse(true, stocks, "Stocks retrieved successfully"));

  } catch (error) {
    console.error("EXACT ERROR IN GETALLSTOCK:", error);
    return res.status(500).json(
      new ApiResponse(false, null, "Internal server error")
    );
  }
}

export async function updateStock(req, res, next) {

  try { 
       const { id } = req.params;
      const { quantity, minStock, maxStock } = req.body;

      // Validate MongoDB ObjectId format before database query
      if(!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json(
              new ApiResponse(false, null, "Invalid stock ID format")
          );
      }

      const stock = await stockModels.findById(id);

      if (!stock) {
          return res.status(404).json(
              new ApiResponse(false, null, "Stock not found")
          );
      }


      // Update stock fields if provided

      let updatedFields = {};
      if (quantity !== undefined) updatedFields.quantity = quantity;
      if (minStock !== undefined) updatedFields.minStock = minStock;
      if (maxStock !== undefined) updatedFields.maxStock = maxStock;

      const updatedStock = await stockModels.findByIdAndUpdate(id, updatedFields, { returnDocument: "after" });

      return res.status(200).json(
          new ApiResponse(true, updatedStock, "Stock updated successfully")
      );
  }

  catch (error) {
      console.error("EXACT ERROR IN UPDATESTOCK:", error);
      return res.status(500).json(
          new ApiResponse(false, null, "Internal server error")
      );
  }
}

export async function deleteStock(req, res, next) {
  try {
      const { id } = req.params;
      const stock = await stockModels.findByIdAndDelete(id);

      if (!stock) {

          return res.status(404).json(
              new ApiResponse(false, null, "Stock not found")
          );
      } 

      return res.status(200).json(
          new ApiResponse(true, null, "Stock deleted successfully")
      );
  } 

  catch (error) {
      console.error("EXACT ERROR IN DELETESTOCK:", error);
      return res.status(500).json(
          new ApiResponse(false, null, "Internal server error")
      );
  } 
}

export async function searchStock(req, res, next) {
  try {
    const { productName} = req.body;

    // Validate input

    if (!productName) {
      return res.status(400).json(
        new ApiResponse(false, null, "Product name is required for search")
      );
    } 

    // Find products matching the name

    const products = await productModels.find({name : {$regex: productName, $options: "i"}});

    if (!products || products.length === 0) {
      return res.status(404).json(
        new ApiResponse(false, null, "No products found matching the name")
      );
    }

    // Extract product IDs
    const productIds = products.map(product => product._id);    

    // Find stocks for the matching products
    const stocks = await stockModels.find({ productId: { $in: productIds } }).populate("productId", "name price description category");

    if (!stocks || stocks.length === 0) {

      return res.status(404).json(
        new ApiResponse(false, null, "No stocks found for the matching products")
      );
    } 

    return res.status(200).json(  
      new ApiResponse(true, stocks, "Stocks retrieved successfully for the matching products")
    );


  }
  catch (error) {
    console.error("EXACT ERROR IN SEARCHSTOCK:", error);
    return res.status(500).json(
      new ApiResponse(false, null, "Internal server error")
    );
  }

  }

export async function detailsStock(req, res, next) {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format before database query
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(
        new ApiResponse(false, null, "Invalid stock ID format")
      );
    }

    const stock = await stockModels.findById(id).populate("productId", "name price description category minStock maxStock");

    if (!stock) {
      return res.status(404).json(
        new ApiResponse(false, null, "Stock not found")
      );
    }

    return res.status(200).json(
      new ApiResponse(true, stock, "Stock details retrieved successfully")
    );

  } catch (error) {
    console.error("EXACT ERROR IN DETAILSSTOCK:", error);
    return res.status(500).json(
      new ApiResponse(false, null, "Internal server error")
    );
  }
}
