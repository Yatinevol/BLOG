import { Router } from "express";
import { loginUser, registerUser, updateUserDetails } from "../controllers/user.controllers.js";
const router = Router()

    router.route("/register").post(registerUser)
    router.route("/logIn").post(loginUser)
    router.route("/update-user").post(updateUserDetails)
    export {router}
