import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please fill a valid email address",
      ],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [
        /^\d{10}$/,
        "Please fill a valid 10 digit phone number",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      maxlength: 100,
      select: false,
    },

    role: {
      type: String,
      enum: [
        "user",
        "admin",
        "superadmin",
        "manager",
        "employee",
        "accountant",
        "warehouse-manager",
        "warehouse-employee",
        "sales-manager",
        "sales-employee",
        "delivery-manager",
        "delivery-employee",
      ],
      default: "user",
    },

    profileImage: {
      type: String,
      default: null,
    },

    address: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
     gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },  


  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

export default User;