import express from "express";
import login, { forgetPassword  , resetPassword, verifyotp} from "../Controllers/authController.js";

const router = express.Router();

router.post("/login", login);

router.patch("/forget" , forgetPassword)

router .put("/verify" , verifyotp)

router.post("/reset" , resetPassword)

export default router;