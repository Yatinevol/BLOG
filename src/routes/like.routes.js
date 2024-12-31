import { Router } from "express";
import { toggleBlogLike } from "../controllers/like.controllers.js";
import verifyJWT from "../middlewares/auth.middlewares.js";

const router = Router()
router.use(verifyJWT)
router.route("/:blogId").post(toggleBlogLike)
export {router}