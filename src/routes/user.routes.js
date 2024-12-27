import { Router } from "express";
import { changeCurrentPassword, loginUser, registerUser, updateUserDetails, updateUserPfp } from "../controllers/user.controllers.js";
import verifyJWT from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
const router = Router()

    router.route("/register").post(registerUser)
    router.route("/logIn").post(loginUser)
    router.route("/update-user").patch(verifyJWT,updateUserDetails)
    router.route("/update-pfp").patch(verifyJWT,upload.single("pfp"),updateUserPfp)
    router.route("/change-password").post(verifyJWT,changeCurrentPassword)
    export {router}
