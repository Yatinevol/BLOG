import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { User } from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

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

const generateAccessandRefreshToken = async(userId)=>{
    const user = await User.findById(userId)
    // console.log(user);
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()
    user.refreshToken = refreshToken
    
    await user.save({validateBeforeSave: false})
    return {accessToken, refreshToken}
}
const options = {
    httpOnly: true,
    secure:process.env.NODE_ENV ==='production',
    sameSite:"strict"
}
const loginUser = asyncHandler(async (req,res)=>{
    const {email, password} = req.body
    
    if(!email || !password){
        throw new ApiError(400,"email or password field is empty")
    }

    const user = await User.findOne({email})

    const passwordValid = await user.isPasswordCorrect(password)
    if(!passwordValid){
        throw new ApiError(400,"Invalid email or password")
    }

    const {accessToken, refreshToken} = await generateAccessandRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
        new ApiResponse(200,
            {
                user: loggedInUser,accessToken,refreshToken
            },
            "Logged In Successfully!!!"
        )
    )


})

const updateUserDetails = asyncHandler(async(req,res)=>{
    const {username, email} = req.body

    if([username, email].some((fields)=>{
        fields?.trim()==""
    })){
        throw new ApiError(400,"Fields are empty")
    }
    const user = await User.findByIdAndUpdate(req.user._id,{
        $set:{
            username:username,
            email:email
            }
        },
        {
            new:true
        }
        ).select("-password ")
    
    return res.status(200).json(
        new ApiResponse(200,user,"Account details updated successfully!!")
    )
})

const updateUserPfp = asyncHandler(async (req,res)=>{
        const userPfpPath = req.file?.path
        if(!userPfpPath){
            throw new ApiError(400,"Add profile picture")
        }
        const pfp = await uploadOnCloudinary(userPfpPath)

        if(!pfp.url){
            throw new ApiError(500,"Error while uploading your file")
        }
// you can handle both scenarios (pfp exists or not) in a single findByIdAndUpdate.
        const user = await User.findByIdAndUpdate(req.user._id,{
            $set:{
                pfp:pfp.url
            }
        },{
            new:true
        }).select("-password")
    
        return res.status(200).json(
            new ApiResponse(200,user,"Profile picture successfully updated!!")
        )

})

const changeCurrentPassword = asyncHandler(async (req,res)=>{
    const {oldPassword, newPassword, confirmPassword} = req.body;

    if(!oldPassword && !newPassword && !confirmPassword){
        throw new ApiError(400,"All fields are required!")
    }
    const user = await User.findById(req.user._id);
    const passCorrect = await user.isPasswordCorrect(oldPassword)
    if(!passCorrect){
        throw new ApiError(400,"invalid old password")
    }

    if(newPassword !== confirmPassword){
        throw new ApiError(400,"Passwords do not match!")
    }

    user.password = newPassword;
    await user.save({validateBeforeSave:false})
    // const updatedUser = await User.findByIdAndUpdate(user._id,
    //     {
    //         $set:{
    //             password:newPassword
    //         }
    //     },
    //     {new:true}
    // ).select("-password")
    return res.status(200).json(new ApiResponse(200,null,"Password updated sucessfully!!!"))
})
export {registerUser, loginUser, updateUserDetails,updateUserPfp,changeCurrentPassword}