import { ApiResponse } from "../utils/respatterns.js";
import userModel from "../models/user.js";
import { verifyToken } from "../config/jwt.js";

export  default async function authMiddleware(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json(new ApiResponse(
                false, null, "Unauthorized: No token provided"
            ));
        }

        const decoded = await verifyToken(token);

        if(!decoded) {
            return res.status(401).json(new ApiResponse(
                false, null, "Unauthorized: Invalid token"
            ));
        }

       const userDocument = await userModel.findOne({ _id: decoded.id,role : decoded.role ,isDeleted: false });
       if (!userDocument) {
            return res.status(401).json(new ApiResponse(
                false, null, "Unauthorized: User not found"
            ));
        }
        const user = userDocument.toObject();
        delete user.password;
        delete user.isDeleted;
        delete user.__v;


        req.user = user;
        next();

        
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json(new ApiResponse(
                false, null, "Unauthorized: Invalid or expired token"
            ));
        }

        console.error("Authentication middleware error:", error);
        return res.status(500).json(new ApiResponse(
            false, null, "Internal server error"
        ));
    }   
      
    
}
