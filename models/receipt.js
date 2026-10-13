
import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema(
    {
        receiptNumber: {
            type: String,
            required: true,
            unique: true
        },
        customerName: {
            type: String,
            required: true,
            trim: true
        },
        customerPhone: {
            type: String,
            default: ""
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },
                price: {
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
        grandTotal: {
            type: Number,
            required: true,
            min: 0
        }
    },
    { timestamps: true }
);

export default mongoose.model("Receipt", receiptSchema);
