import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const allowedExtensions = ['.jpg', '.png', '.gif', '.jpeg', '.webp'];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        const fileHash = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${fileHash}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if(allowedExtensions.includes(ext)) {
        cb(null,true);
    }else{
        cb(new Error('Ekstensi gambar tidak valid'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {fileSize: 5 * 1024 * 1024},
});

export {upload};
