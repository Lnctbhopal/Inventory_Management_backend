import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export default async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbname: "inventory_management" });
        console.log("Connected to MongoDB");
    } catch(error) {
        console.error("Error connecting to MongoDB:", error);
    }
}
