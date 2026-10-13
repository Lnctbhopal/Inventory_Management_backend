import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 0,
    },

    minStock: {
      type: Number,
      default: 5,
      min: 2,
    },

    maxStock: {
      type: Number,
      default: 1000,
      min: 3,
    },

    stockStatus: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      default: "In Stock",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-update stockStatus before saving
stockSchema.pre("save", function () {
  if (this.quantity === 0) {
    this.stockStatus = "Out of Stock";
  } else if (this.quantity <= this.minStock) {
    this.stockStatus = "Low Stock";
  } else {
    this.stockStatus = "In Stock";
  }
});

const Stock = mongoose.model("Stock", stockSchema);

export default Stock;