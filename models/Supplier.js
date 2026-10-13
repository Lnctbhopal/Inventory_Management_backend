
import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Supplier name is required"],
      trim: true
    },

    companyName: {
      type: String,
      trim: true,
      default: ""
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ""
    },

    phone: {
      type: String,
      required: [true, "Supplier phone is required"],
      trim: true
    },

    address: {
      type: String,
      trim: true,
      default: ""
    },

    city: {
      type: String,
      trim: true,
      default: ""
    },

    state: {
      type: String,
      trim: true,
      default: ""
    },

    pincode: {
      type: String,
      trim: true,
      default: ""
    },

    gstNumber: {
      type: String,
      required: [true, "GST number is required"],
      trim: true,
      uppercase: true,
      default: ""
    },

    isActive: {
      type: Boolean,
      default: true
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const supplierModels = mongoose.model("Supplier", supplierSchema);

export default supplierModels;