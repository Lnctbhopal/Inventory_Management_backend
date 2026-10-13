import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/allowRole.js";
import userUpload from "../config/multer.js";


import { getAllUsers ,registerUser ,updateUser ,deleteUser ,changePassword,toggleUserStatus ,userProfile} from "../Controllers/userController.js";

const router = express.Router();

router.get("/", getAllUsers);

router.post("/register",registerUser);

router.patch("/:id", authMiddleware, updateUser);

router.delete("/:id",authMiddleware, deleteUser);

router.post("/change-password",authMiddleware, changePassword);

router.post("/", authMiddleware, toggleUserStatus);


router.patch( "/profile/:id", authMiddleware ,userUpload.single("image"), userProfile);



export default router;