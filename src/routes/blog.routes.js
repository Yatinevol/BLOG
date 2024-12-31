import { Router } from "express";
import { addBlog, deleteBlog, updateBlog, likesOnBlogId } from "../controllers/blog.controllers.js";
import verifyJWT from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { getAllBlog } from "../controllers/blog.controllers.js";
const router = Router()
router.use(verifyJWT)
router.route("/create").post(upload.single("thumbnail"),addBlog)
router.route("/update-blog/:blogId").patch(upload.single("thumbnail"),updateBlog)

router.route("/").get(getAllBlog).post(upload.single("thumbnail"),addBlog)

router.route("/:blogId").get(likesOnBlogId).delete(deleteBlog).patch(upload.single("thumbnail"),updateBlog)
export {router}