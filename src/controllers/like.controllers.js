import { Blog } from "../models/blog.models.js";
import { Like } from "../models/like.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const toggleLike = asyncHandler(async(req,res)=>{
    const {blogId} = req.params
    const blog = await Blog.findById(blogId)
    if(!blog) throw new ApiError(400,"Blog not found")
    const userId = req.user._id
    const foundLike = await Like.findOne({
        blog:blogId,
        likedby:userId
    })
   if(foundLike){
        await Like.findByIdAndDelete(foundLike._id)
        return res.status(200).json(new ApiResponse(200,null,"Unliked blog successfully"))
   }

   const liked = await Like.create({
        blog:blogId,
        likedby:userId,

   })
   return res.status(200).json(new ApiResponse(200,liked,"Blog liked successfully"))
})

export {toggleLike}