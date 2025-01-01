import { Blog } from "../models/blog.models.js";
import { Comment } from "../models/comment.models.js";
import { User } from "../models/user.models.js";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler.js";

const createComment = asyncHandler(async(req,res)=>{
    const {blogId} = req.params
    const {content} = req.body
    if(!content?.trim()) throw new ApiError(400,"Comment something to post");

    const user = await User.findById(req.user._id)
    const blog = await Blog.findById(blogId);

    if(!user) throw new ApiError(400,"Session expired, Login Again")
    if(!blog){
        throw new ApiError(400,"Blog not found")
    }

    // i dont need to verify if the comment with this blogId and userId exist or not because One user can comment multiple times.

    const comment = await Comment.create({
        owner: user._id,
        blog: blog._id,
        content,

    })
    // used POPULATE( VIA MONGOOSE) FOR THE FIRST TIME:
    const populatedComment = await Comment.findById(comment._id).populate("owner","username email");
    if(!populatedComment){
        throw new ApiError(500,"Failed to retreive the created comment");
    }
    console.log("commented : ",populatedComment);
    return res.status(200).json(new ApiResponse(200,populatedComment,"Commented on the blog successfully"))
})