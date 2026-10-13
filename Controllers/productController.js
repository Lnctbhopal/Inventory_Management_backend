import productModel from "../models/product.js";
import { ApiResponse } from "../utils/respatterns.js";
import bwip from "bwip-js";

export async function getAllProducts(req, res, next) {
    try {

        let page = req.query.page > 0 ? parseInt(req.query.page) : 1;
        let limit = req.query.limit > 0 ? parseInt(req.query.limit) : 10;
        let skip = page === 1 ? 0 : (page - 1) * limit;

        const products = await productModel.find({ isDeleted: false })
            .skip(skip)
            .limit(limit);

        return res.status(200).json(new ApiResponse(200, products, "Products fetched successfully"));

    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, "Internal server error"));
    }

}

export async function createProduct(req, res, next) {
    try {

        console.log("🔥 CREATE PRODUCT CONTROLLER CALLED");
        console.log("CREATE PRODUCT REQUEST BODY:", req.body);

        const {
            name,
            sku,
            description,
            category,
            brand,
            price,
            purchasePrice,
            stock,
            minimumStock,
            unit,
            supplier
        } = req.body;

        // Required fields validation
        if (
            !name ||
            !sku ||
            !category ||
            !price ||
            !purchasePrice ||
            !stock ||
            !unit ||
            !supplier ||
            !minimumStock ||
            !brand ||
            !description
        ) {
            return res.status(400).json(
                new ApiResponse(
                    400,
                    null,
                    "Required fields are missing"
                )
            );
        }

        // Generate unique barcode automatically
        const barcode = `INV-${Date.now()}`;

        console.log("Generated Barcode:", barcode);

        // Product URL
        const productUrl =
            `http://10.32.241.19:5000/products/view/${barcode}`;

        console.log("Product URL:", productUrl);

        // Import required packages
        const bwip = (await import("bwip-js")).default;
        const fs = await import("fs/promises");
        const path = await import("path");

        // Barcode folder
        const barcodeFolder = path.join(
            process.cwd(),
            "uploads",
            "barcodes"
        );

        // Create barcode folder automatically
        await fs.mkdir(barcodeFolder, {
            recursive: true
        });

        // Generate QR Code
        const barcodeBuffer = await bwip.toBuffer({
            bcid: "qrcode",
            text: productUrl,
            scale: 5,
            includetext: true
        });

        console.log("QR code generated successfully");

        // Barcode image filename
        const barcodeFileName = `${barcode}.png`;

        // Full barcode image path
        const barcodeFilePath = path.join(
            barcodeFolder,
            barcodeFileName
        );

        // Save barcode image
        await fs.writeFile(
            barcodeFilePath,
            barcodeBuffer
        );

        console.log(
            "Barcode image saved at:",
            barcodeFilePath
        );

        // Barcode image URL
        const barcodeImage =
            `/uploads/barcodes/${barcodeFileName}`;

        console.log(
            "Barcode image URL:",
            barcodeImage
        );

        // Check model field
        console.log(
            "BarcodeImage Model Field:",
            productModel.schema.path("barcodeImage")
        );

        // Create product
        const product = await productModel.create({
            name,
            sku,
            barcode,
            barcodeImage,
            description,
            category,
            brand,
            price,
            purchasePrice,
            stock,
            minimumStock,
            unit,
            supplier
        });

        console.log(
            "Product Created:",
            product
        );

        console.log(
            "Saved Barcode Image:",
            product.barcodeImage
        );

        return res.status(201).json(
            new ApiResponse(
                201,
                product,
                "Product created successfully"
            )
        );

    } catch (error) {

        console.log(
            "CREATE PRODUCT ERROR:",
            error
        );

        return res.status(500).json(
            new ApiResponse(
                500,
                null,
                error.message
            )
        );
    }
}

export async function updateProduct(req, res, next) {
    try {

        const {
            id,
            name,
            sku,
            description,
            category,
            brand,
            price,
            purchasePrice,
            stock,
            minimumStock,
            unit,
            supplier
        } = req.body;

        if (!id) {
            return res
                .status(400)
                .json(new ApiResponse(400, null, "Product ID is required"));
        }

        const product = await productModel.findById(id);

        if (!product) {
            return res
                .status(404)
                .json(new ApiResponse(404, null, "Product not found"));
        }

        const updatedProduct = await productModel.findByIdAndUpdate(
            id,
            {
                name,
                sku,
                description,
                category,
                brand,
                price,
                purchasePrice,
                stock,
                minimumStock,
                unit,
                supplier
            },
            { returnDocument: "after" }
        );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedProduct,
                    "Product updated successfully"
                )
            );

    } catch (error) {
        console.log(error);

        res
            .status(500)
            .json(new ApiResponse(500, null, "Internal server error"));
    }
}

export async function deleteProduct(req, res, next) {
    try {
        const { id } = req.body;

        if (!id) {
            return res
                .status(400)
                .json(new ApiResponse(400, null, "Product ID is required"));
        }

        const product = await productModel.findById(id);

        if (!product) {
            return res
                .status(404)
                .json(new ApiResponse(404, null, "Product not found"));
        }

        await productModel.findByIdAndDelete(id);

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Product deleted successfully"));
    } catch (error) {
        console.log(error);

        res
            .status(500)
            .json(new ApiResponse(500, null, "Internal server error"));
    }
}

export async function searchProduct(req, res, next) {
    try {
        const { search } = req.body;

        if (!search) {
            return res
                .status(400)
                .json(new ApiResponse(400, null, "Search value is required"));
        }

        const products = await productModel.find({
            $or: [
                { name: { $regex: search, $options: "i" } },
                { sku: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
                { brand: { $regex: search, $options: "i" } }
            ],
            isDeleted: false
        });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    products,
                    "Products found successfully"
                )
            );

    } catch (error) {
        console.log(error);

        return res
            .status(500)
            .json(
                new ApiResponse(
                    500,
                    null,
                    "Internal server error"
                )
            );
    }
}

export async function scanProduct(req, res, next) {
    try {

        const { barcode } = req.body;

        // Check barcode
        if (!barcode) {
            return res
                .status(400)
                .json(
                    new ApiResponse(
                        400,
                        null,
                        "Barcode is required"
                    )
                );
        }

        // Find product using barcode
        const product = await productModel.findOne({
            barcode: barcode,
            isDeleted: false
        });

        // Product not found
        if (!product) {
            return res
                .status(404)
                .json(
                    new ApiResponse(
                        404,
                        null,
                        "Product not found"
                    )
                );
        }

        // Product found
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    product,
                    "Product found successfully"
                )
            );

    } catch (error) {

        console.log("SCAN PRODUCT ERROR:", error);

        return res
            .status(500)
            .json(
                new ApiResponse(
                    500,
                    null,
                    error.message
                )
            );
    }
}

export async function viewProduct(req, res, next) {
    try {

        const { barcode } = req.params;

        console.log("VIEW PRODUCT BARCODE:", barcode);

        // Find product by barcode
        const product = await productModel.findOne({
            barcode: barcode,
            isDeleted: false
        });

        // Product not found
        if (!product) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Product Not Found</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                </head>

                <body>
                    <h1>Product Not Found</h1>
                    <p>Barcode: ${barcode}</p>
                </body>
                </html>
            `);
        }

        // Product found
        return res.status(200).send(`
            <!DOCTYPE html>
            <html>

            <head>
                <title>${product.name}</title>

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                >

                <style>

                    body {
                        font-family: Arial, sans-serif;
                        background: #f5f5f5;
                        margin: 0;
                        padding: 20px;
                    }

                    .product {
                        max-width: 500px;
                        margin: auto;
                        background: white;
                        padding: 25px;
                        border-radius: 12px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }

                    h1 {
                        margin-top: 0;
                    }

                    .detail {
                        margin: 12px 0;
                        font-size: 17px;
                    }

                    .price {
                        font-size: 24px;
                        font-weight: bold;
                    }

                </style>
            </head>

            <body>

                <div class="product">

                    <h1>${product.name}</h1>

                    <div class="detail">
                        <b>SKU:</b> ${product.sku}
                    </div>

                    <div class="detail">
                        <b>Barcode:</b> ${product.barcode}
                    </div>

                    <div class="detail">
                        <b>Category:</b> ${product.category}
                    </div>

                    <div class="detail">
                        <b>Brand:</b> ${product.brand}
                    </div>

                    <div class="detail price">
                        Price: ₹${product.price}
                    </div>

                    <div class="detail">
                        <b>Purchase Price:</b>
                        ₹${product.purchasePrice}
                    </div>

                    <div class="detail">
                        <b>Stock:</b> ${product.stock}
                    </div>

                    <div class="detail">
                        <b>Minimum Stock:</b> ${product.minimumStock}
                    </div>

                    <div class="detail">
                        <b>Unit:</b> ${product.unit}
                    </div>

                    <div class="detail">
                        <b>Description:</b> ${product.description || "N/A"}
                    </div>

                </div>

            </body>

            </html>
        `);

    } catch (error) {

        console.log("VIEW PRODUCT ERROR:", error);

        return res.status(500).send(`
            <h1>Server Error</h1>
            <p>${error.message}</p>
        `);
    }
}