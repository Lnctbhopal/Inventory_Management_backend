import createError from "http-errors";
import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import path from "path";

// import {errorHandler} from "./middleware/errorHandler.js"

import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import productRouter from "./routes/product.js";
import stockRouter from "./routes/stock.js";
import supplierRouter from "./routes/Supplier.js";
import purchaseRouter from "./routes/Purchase.js";
import saleRouter from "./routes/sale.js"
import receiptRouter from "./routes/receipt.js";
import authRouter from "./routes/auth.js";

const app = express();

// ======================================================
// VIEW ENGINE
// ======================================================

app.set("view engine", "ejs");

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));

// ======================================================
// UPLOADS
// ======================================================

const uploadsPath = path.join(process.cwd(), "uploads");

console.log("Uploads folder:", uploadsPath);

app.use("/uploads", express.static('uploads'));

// ======================================================
// ROUTES
// ======================================================

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/suppliers", supplierRouter);  
app.use("/auth", authRouter);
app.use("/products", productRouter);
app.use("/stocks", stockRouter);
app.use("/sale" , saleRouter)
app.use("/purchase" ,purchaseRouter);
app.use("/receipt", receiptRouter);
// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res, next) => {
  next(createError(404, "Route not found"));
});

// ======================================================
// ERROR HANDLER
// ======================================================

// app.use(errorHandler);

export default app;