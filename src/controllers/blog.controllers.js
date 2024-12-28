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

const updateBlog = asyncHandler(async(req,res)=>{
    const {blogId} = req.params
    if(!blogId){
        throw new ApiError(400,"Blog id is required!!")
    }
    const {title, description} = req.body
    // ensure atleast one field is provided for update
    if(!title && !description && !req.file?.path){
        throw new ApiError(400,"No fields edited, update a field")
    }
    let thumPath;
    if(req.file?.path){
        thumPath = req.file?.path
    }
    const thumb = await uploadOnCloudinary(thumPath)
    if(!thumb){
        throw new ApiError(500,"Failed to upload your file!")
    }

    const newBlog = await Blog.findByIdAndUpdate(blogId,
        {
            $set:{
                title:title,
                description:description,
                thumbnail:thumb.url
            }
        },
        {
            new :true,
            // to ensure mongoose schema is entaged
            runValidators:true
        }
    )
    return res.status(200).json(
        new ApiResponse(200,newBlog,"Your Blog updated successfully:)")
    )

})
export {addBlog,updateBlog}