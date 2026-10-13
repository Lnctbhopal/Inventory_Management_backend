import { ApiResponse } from '../utils/respatterns.js';
import userModel from '../models/user.js';
import { verifyPassword, hashPassword } from '../config/bcrypt.js';


export async function getAllUsers(req, res, next) {
    try {

        let page = req.query.page > 0 ? parseInt(req.query.page) : 1;
        let limit = req.query.limit > 0 ? parseInt(req.query.limit) : 30;
        let skip = page === 1 ? 0 : (page - 1) * limit;

        const users = await userModel.find({ isDeleted: false })
            .skip(skip)
            .limit(limit);

        res.status(200).json(new ApiResponse(
            true, users, "Users fetched successfully"
        ));


    } catch (error) {
        res.status(500).json(new ApiResponse(
            false, null, "Internal server error"
        ));
    }
}

export async function registerUser(req, res, next) {
    try {
        const { name, phone, email, password } = req.body;

        if (![name, phone, email, password].every(
            (value) => typeof value === "string" && value.trim()
        )) {
            return res.status(400).json(new ApiResponse(
                false, null, "Name, phone, email, and password are required"
            ));
        }

        const hash = await hashPassword(password);
        const user = await userModel.create({ name, phone, email, password: hash });
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json(new ApiResponse(
            true, userResponse, "User registered successfully"
        ));
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json(new ApiResponse(
                false, null, error.message
            ));
        }
        if (error.code === 11000) {
            return res.status(409).json(new ApiResponse(
                false, null, "Email or phone number is already registered"
            ));
        }
        next(error);
    }
}

export async function updateUser(req, res, next) {
    try {
        const { id } = req.params;
        const { name, phone, email, address, gender } = req.body;

        if (!(name && phone && email && address && gender)) {
            return res.status(400).json(new ApiResponse(
                false, null, "All field is required to update"
            ));
        }

        let user = await userModel.findByIdAndUpdate(id, { name, phone, email, address, gender }, { returnDocument: "after" });

        if (!user) {
            return res.status(404).json(new ApiResponse(
                false, null, "User not found"
            ));
        }
        res.status(200).json(new ApiResponse(
            true, user, "User updated successfully"
        ));
    } catch (error) {
        res.status(500).json(new ApiResponse(
            false, null, "Internal server error"
        ));
    }
}

export async function deleteUser(req, res, next) {
    try {
        const { id } = req.params;

        let user = await userModel.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json(new ApiResponse(
                false, null, "User not found"
            ));
        }

        res.status(200).json(new ApiResponse(
            true, user, "User deleted successfully"
        ));

    } catch (error) {
        res.status(500).json(new ApiResponse(
            false, null, "Internal server error"
        ));
    }
}

export async function changePassword(req, res, next) {

    try {

        const { oldpassword, newpassword } = req.body;

        if (!(oldpassword && newpassword)) {
            return res.status(400).json(new ApiResponse(
                false, null, "Old password and new password are required"
            ));
        }

        let user = await userModel
            .findOne({
                _id: req.user._id,
                isDeleted: false
            
            })
            .select("+password");


        if (!user) {
            return res.status(404).json(new ApiResponse(
                false, null, "User not found"
            ));
        }

        const isMatch = await verifyPassword(oldpassword, user.password);

        if (!isMatch) {
            return res.status(400).json(new ApiResponse(
                false, null, "Old password is incorrect"
            ));
        }

        let hashedPassword = await hashPassword(newpassword);

        let updatedUser = await userModel.findByIdAndUpdate(req.user._id, { password: hashedPassword }, { returnDocument: "after" });

        res.status(200).json(new ApiResponse(
            true, updatedUser, "Password changed successfully"
        ));
    }catch (error) { 

    console.log("CHANGE PASSWORD ERROR:", error);

    res.status(500).json(new ApiResponse( 
        false, null, error.message
    )); 
}
    

}


export async function toggleUserStatus(req, res, next) {
    try {
        const { id } = req.body;

        let user = await usermodel.findById(id);

        if(!user) {
            return res.status(404).json(new ApiResponse(
                false, null, "User not found"
            ));
        }

        user.isActive = !user.isActive;

        await user.save();  

    } catch (error) {
        res.status(500).json(new ApiResponse(
            false, null, "Internal server error"
        ));
    }
}


export async function userProfile(req, res, next) {
    try {
        const profile = req.file;

        if (!profile) {
            return res.status(400).json(
                new ApiResponse(
                    false,
                    null,
                    "Profile image is required"
                )
            );
        }

        if (!req.user?._id) {
            return res.status(401).json(
                new ApiResponse(false, null, "Unauthorized")
            );
        }

        const profilepath =
            `${req.protocol}://${req.get("host")}/uploads/${profile.filename}`;

        const user = await userModel.findById(req.user._id);

        if (!user) {
            return res.status(404).json(
                new ApiResponse(false, null, "User not found")
            );
        }

        // Save the profile image
        user.profileImage = profilepath;
        await user.save();

        return res.status(200).json(
            new ApiResponse(
                true,
                {
                    profileImage: user.profileImage
                },
                "Profile image uploaded successfully"
            )
        );

    } catch (error) {
        console.error("Profile upload error:", error);

        return res.status(500).json(
            new ApiResponse(
                false,
                null,
                "Internal server error"
            )
        );
    }
}


