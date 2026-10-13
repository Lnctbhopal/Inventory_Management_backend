
import express from "express";


import {
    createSale ,
    getAllSales,
    getSaleById,
    cancelSale

} from "../Controllers/saleController.js";

const router = express.Router();

router.post("/", createSale);

 router.get("/", getAllSales);

router.get("/:id", getSaleById);

router.patch("/:id" ,cancelSale); 


export default router;
