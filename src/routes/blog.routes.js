import { Router } from "express";
import { addBlog } from "../controllers/blog.controllers.js";
import verifyJWT from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
const router = Router()

router.route("/create").post(verifyJWT,upload.single("thumbnail"),addBlog)
export {router}