import { User } from "../models/user.models.js";
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import uploadOnCloudinary from "../utils/cloudinary.js";
import { Blog } from "../models/blog.models.js";
import ApiResponse from "../utils/ApiResponse.js";

const addBlog = asyncHandler(async (req,res)=>{
    const {title, description} = req.body;
    if(!title || !description){
        throw new ApiError(400,"All fields are required!")
    }
    const thumPath = req.file?.path
    if(!thumPath){
        throw new ApiError(400,"add thumbnail for the blog");
    }
    const thum = await uploadOnCloudinary(thumPath)
    if(!thum.url){
        throw new ApiError(500,"error while uploading")
    }
    const words = description.trim().split(/\s+/).length;
    let readTime = Math.floor(words/200);
    const user = await User.findById(req.user._id)
    const blog = await Blog.create({
        author:user._id,
        title,
        description,
        thumbnail:thum.url,
        readtime:readTime

    })
    return res.status(200).json(
        new ApiResponse(200,blog,"Your blog is created successfully!")
    )
})
export {addBlog}