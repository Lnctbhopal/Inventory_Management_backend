
import { ApiResponse } from "../utils/respatterns.js";
import userModel from "../models/user.js";
import { generateToken, verifyToken } from "../config/jwt.js";
import { verifyPassword, hashPassword } from "../config/bcrypt.js";
import generateOTP from "../config/otpgenrator.js";
import { transporter } from "../config/mailTransporter.js";
import { resetPasswordTemplate } from "../Templates/resetotp.js";
import { forgotPasswordOTPTemplate } from "../Templates/otpsent.js";

// LOGIN
export default async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json(
                new ApiResponse(false, null, "Email and password are required")
            );
        }

        const user = await userModel.findOne({
            email: email.toLowerCase().trim(),
            isDeleted: false
        }).select("+password");

        if (!user) {
            return res.status(401).json(
                new ApiResponse(false, null, "User not found")
            );
        }

        const isMatch = await verifyPassword(password, user.password);

        if (!isMatch) {
            return res.status(401).json(
                new ApiResponse(false, null, "Invalid password")
            );
        }

        const token = await generateToken({
            id: user._id,
            role: user.role,
            name: user.name,
            email: user.email
        });

        const userResponse = user.toObject();

        delete userResponse.password;
        delete userResponse.isDeleted;
        delete userResponse.__v;

        userResponse.token = token;

        return res.status(200).json(
            new ApiResponse(true, userResponse, "Login successful")
        );

    } catch (error) {
        next(error);
    }
}


// FORGOT PASSWORD
export async function forgetPassword(req, res, next) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json(
                new ApiResponse(false, null, "Email is required")
            );
        }

        const user = await userModel.findOne({
            email: email.toLowerCase().trim(),
            isDeleted: false
        });

        if (!user) {
            return res.status(404).json(
                new ApiResponse(false, null, "User not found")
            );
        }

        // Generate 6-digit OTP
        const otp = generateOTP(6);

        // Send OTP email
        await transporter.sendMail({
            from: `"Inventory Management" <${process.env.GMAIL_USER}>`,
            to: user.email,
            subject: "Password Reset OTP",
            html: forgotPasswordOTPTemplate(user.name, otp)
        });

        // Hash OTP
        const hashedOtp = await hashPassword(otp);

        // Generate OTP token with 10-minute expiry
        const token = await generateToken(
            {
                otp: hashedOtp,
                user: { _id: user._id }
            },
            "10m"
        );

        res.cookie("xotpsent", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 10 * 60 * 1000
        });

        return res.status(200).json(
            new ApiResponse(
                true,
                null,
                "Password reset OTP sent successfully"
            )
        );

    } catch (error) {
        next(error);
    }
}


// VERIFY OTP

export async function verifyotp(req, res, next) {
    try {
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json(
                new ApiResponse(false, null, "OTP is required")
            );
        }

        const token = req.cookies?.xotpsent;

        if (!token) {
            return res.status(403).json(
                new ApiResponse(false, null, "OTP expired or invalid")
            );
        }

        let decodeToken;

        try {
            decodeToken = await verifyToken(token);
        } catch (error) {
            return res.status(403).json(
                new ApiResponse(false, null, "OTP expired or invalid")
            );
        }

        if (!decodeToken?.otp || !decodeToken?.user?._id) {
            return res.status(403).json(
                new ApiResponse(false, null, "Invalid OTP token")
            );
        }

        const match = await verifyPassword(
            String(otp),
            decodeToken.otp
        );

        if (!match) {
            return res.status(403).json(
                new ApiResponse(false, null, "Wrong OTP")
            );
        }

        const accessToken = await generateToken(
            { user: { _id: decodeToken.user._id } },
            "10m"
        );

        res.cookie("accesstoken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 10 * 60 * 1000
        });

        return res.status(200).json(
            new ApiResponse(true, null, "OTP verified successfully")
        );

    } catch (error) {
        return res.status(500).json(new ApiResponse(false , null , "Internal Server error"))
    }
}



// RESET PASSWORD

export async function resetPassword(req, res, next) {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json(
                new ApiResponse(false, null, "Password is required")
            );
        }

        const token = req.cookies?.accesstoken;

        if (!token) {
            return res.status(403).json(
                new ApiResponse(false, null, "Token expired or invalid")
            );
        }

        let decodeToken;

        try {
            decodeToken = await verifyToken(token);
        } catch (error) {
            return res.status(403).json(
                new ApiResponse(false, null, "Token expired or invalid")
            );
        }

        if (!decodeToken?.user?._id) {
            return res.status(403).json(
                new ApiResponse(false, null, "Invalid reset token payload")
            );
        }

        const userId = decodeToken.user._id;

        const userExits = await userModel.findOne({
            _id: userId,
            isDeleted: false
        });

        if (!userExits) {
            return res.status(404).json(
                new ApiResponse(false, null, "Invalid user")
            );
        }

        const hash = await hashPassword(password);

        userExits.password = hash;
        await userExits.save();

        await transporter.sendMail({
            from: `"Inventory Management" <${process.env.GMAIL_USER}>`,
            to: userExits.email,
            subject: "Password Reset Successful",
            html: resetPasswordTemplate(userExits.name)
        });

        res.clearCookie("xotpsent", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        res.clearCookie("accesstoken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        return res.status(200).json(
            new ApiResponse(true, null, "Password reset successful")
        );

    } catch (error) {
        next(error);
    }
}

