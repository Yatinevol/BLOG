import { Router } from "express";
import { addBlog, updateBlog } from "../controllers/blog.controllers.js";
import verifyJWT from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
const router = Router()

router.route("/create").post(verifyJWT,upload.single("thumbnail"),addBlog)
router.route("/update-blog/:blogId").patch(verifyJWT,upload.single("thumbnail"),updateBlog)
export {router}