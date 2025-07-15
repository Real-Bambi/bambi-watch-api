import multer from "multer";

// Use memory storage — no temp disk files
const storage = multer.memoryStorage();

export const upload = multer({ storage });
