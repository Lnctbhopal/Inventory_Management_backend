
import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
    {
        customerName: {
            type: String,
            required: true,
            trim: true
        },

        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },
                sellingPrice: {
                    type: Number,
                    required: true,
                    min: 0
                },
                total: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ],

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        paymentMethod: {
            type: String,
            enum: ["cash", "upi", "card"],
            default: "cash"
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid"],
            default: "paid"
        },

        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const saleModels = mongoose.model("Sale", saleSchema);

export default saleModels;
