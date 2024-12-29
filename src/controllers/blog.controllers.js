import { User } from "../models/user.models.js";
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import uploadOnCloudinary from "../utils/cloudinary.js";
import { Blog } from "../models/blog.models.js";
import ApiResponse from "../utils/ApiResponse.js";
import extractFileNameFromUrl from "../utils/extractFileName.js";

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
    let thumb ;
    let thumbnail ;
    if(req.file?.path){
        try {
            thumPath = req.file?.path
            thumb = await uploadOnCloudinary(thumPath)
            if(!thumb.url){
                throw new ApiError(500,"Failed to upload your file!")
            }
            thumbnail = thumb.url
        } catch (error) {
            throw new ApiError(440,error||"kya galat ho gya hai")
        }
    }
    
    const newBlog = await Blog.findByIdAndUpdate(blogId,
        {
            $set:{
                title:title,
                description:description,
                thumbnail
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

const deleteBlog = asyncHandler(async(req, res)=>{
    const blogId = req.params
    if(!blogId) throw new ApiError(400,"Blog not found");
    const blog = await Blog.findById(blogId)

    if(!blog) throw new ApiError(400,"Blog not found");
    if(blog.thumbnail){
    try {
        const fileName = extractFileNameFromUrl(blog.thumbnail);
        await uploadOnCloudinary.destroy(fileName)
    } catch (error) {
        throw new ApiError(500,error || "bhai delete nhi ho pa rha hai blog")
    }
    }

    await Blog.findByIdAndDelete(blogId)
    return res.status(200).json(200,"Your blog has been deleted!")
})
export {addBlog,updateBlog}