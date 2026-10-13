
import express from "express";
import { generateReceipt } from "../Controllers/receiptController.js";

const router = express.Router();

router.post("/", generateReceipt);

export default router;
