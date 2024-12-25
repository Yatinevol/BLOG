import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { User } from "../models/user.models.js";

const registerUser = asyncHandler(async (req,res)=>{
    // to handle user-controlled inputs we use req.body; this needs to be validated properly.
    const {username, password, confirmPassword, email }= req.body;

    if([username,password,confirmPassword,email].some((field)=>{
        field?.trim()===""
    })){
        // use throw new Error(""); when u know if this will not work out then you might want to interrupt the normal flow of the program.
        throw new ApiError(400,"all fields are required")
    }

    if(password!=confirmPassword){
        throw new ApiError(400,"Password and confirm password does not match.")
    }

    const registeredUser = await User.findOne({
        $or:[{username} , {email}]
    })

    if(registeredUser){
        throw new ApiError(400,"User already registered try log in!")
    }

    const user = await User.create({
        username,
        email,
        password
    })

    // validation if the user was created in the database:
    const createdUser = await User.findOne(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"Something went wrong internally")
    }
    return res.status(200).json(
        new ApiResponse(200,createdUser,"User registered Successfully!")
    )
})

export {registerUser}