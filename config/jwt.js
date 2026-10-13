import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export async function generateToken(payload) {
    try {
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        return token;
    } catch (error) {
        throw new Error("Error generating token");
    }
}

export async function verifyToken(token) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.verify(token, process.env.JWT_SECRET);
}