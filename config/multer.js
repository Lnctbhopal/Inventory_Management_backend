import multer from 'multer';
import fs from 'fs';


// Product image storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './uploads/';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },

    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});


// Barcode storage
const barcodeStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './uploads/barcodes/';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },

    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});


const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});


const barcodeUpload = multer({
    storage: barcodeStorage,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});


export { barcodeUpload };

export default upload;