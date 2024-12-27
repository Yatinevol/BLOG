import { Router } from "express";
import { loginUser, registerUser, updateUserDetails } from "../controllers/user.controllers.js";
import verifyJWT from "../middlewares/auth.middlewares.js";
const router = Router()

    router.route("/register").post(registerUser)
    router.route("/logIn").post(loginUser)
    router.route("/update-user").patch(verifyJWT,updateUserDetails)
    export {router}
