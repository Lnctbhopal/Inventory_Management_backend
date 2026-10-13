import supplierModels from "../models/Supplier.js";
import { ApiResponse } from "../utils/respatterns.js";
import mongoose from "mongoose";


export async function registerSupplier(req, res, next) {
  try {
    const { name, email, phone, address, city, state, pincode, gstNumber } = req.body;


    let supplier = new supplierModels({
      name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      gstNumber
    });

    await supplier.save();

    return res.status(201).json(
      new ApiResponse(true, supplier, "Supplier registered successfully")
    );

  }
  catch (error) {
    console.error("EXACT ERROR IN REGISTERSUPPLIER:", error);
    return res.status(500).json(
      new ApiResponse(false, null, "Internal server error")
    );
  }
}


export async function getAllSuppliers(req, res, next) {
  try {
    const supplier = await supplierModels.find({
      isDeleted: false
    });

    if (!supplier || supplier.length === 0) {
      return res.status(404).json(
        new ApiResponse(false, null, "Supplier not found")
      );
    }

    return res.status(200).json(
      new ApiResponse(true, supplier, "Suppliers fetched successfully")
    );

  } catch (error) {
    console.error("EXACT ERROR IN GETALLSUPPLIERS:", error);

    return res.status(500).json(
      new ApiResponse(false, null, "Internal server error")
    );
  }
}


export async function updateSupplier(req, res, next) {
  try {
    const { name, email, phone, address, state, city } = req.body;
    const { id } = req.params;

    // Validate supplier ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(
        new ApiResponse(false, null, "Invalid supplier ID")
      );
    }

    // Check if all fields are missing
    if (
      name === undefined &&
      email === undefined &&
      phone === undefined &&
      address === undefined &&
      state === undefined &&
      city === undefined
    ) {
      return res.status(400).json(
        new ApiResponse(false, null, "Missing supplier details")
      );
    }

    const supplier = await supplierModels.findOne({
      _id: id,
      isDeleted: false
    });

    if (!supplier) {
      return res.status(404).json(
        new ApiResponse(false, null, "Supplier not found")
      );
    }

    // Update only provided fields
    const updatedFields = {};

    if (name !== undefined) updatedFields.name = name;
    if (email !== undefined) updatedFields.email = email;
    if (phone !== undefined) updatedFields.phone = phone;
    if (address !== undefined) updatedFields.address = address;
    if (state !== undefined) updatedFields.state = state;
    if (city !== undefined) updatedFields.city = city;

    const update = await supplierModels.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    return res.status(200).json(
      new ApiResponse(
        true,
        update,
        "Supplier updated successfully"
      )
    );

  } catch (error) {
    console.error("EXACT ERROR IN UPDATESUPPLIER:", error);

    return res.status(500).json(
      new ApiResponse(false, null, "Internal server error")
    );
  }
}

export async function deleteSupplier(req, res, next) {
  try {
    const { id } = req.params;

    const supplier = await supplierModels.findById(id);

    if (!supplier || supplier.isDeleted) {
      return res.status(404).json(
        new ApiResponse(false, null, "Supplier not found")
      );
    }

    supplier.isDeleted = true;
    await supplier.save();

    return res.status(200).json(
      new ApiResponse(true, supplier, "Supplier deleted successfully")
    );

  } catch (error) {
    console.log("print the error", error);

    return res.status(500).json(
      new ApiResponse(false, null, "Internal Server error")
    );
  }
}

export async function searchSupplier(req, res, next) {
    try {
        const { name, state } = req.query;

        if (!name && !state) {
            return res.status(400).json(
                new ApiResponse(false, null, "Please provide name or state to search")
            );
        }

        const search = await supplierModels.find({
            $or: [
                ...(name ? [{ name: { $regex: name, $options: "i" } }] : []),
                ...(state ? [{ state: { $regex: state, $options: "i" } }] : [])
            ]
        });

        if (search.length === 0) {
            return res.status(404).json(
                new ApiResponse(false, null, "Supplier not found")
            );
        }

        return res.status(200).json(
            new ApiResponse(true, search, "Search successfully")
        );

    } catch (error) {
        console.error(error);
        return res.status(500).json(
            new ApiResponse(false, null, "Internal server error")
        );
    }
}


