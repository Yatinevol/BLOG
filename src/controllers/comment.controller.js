import { Blog } from "../models/blog.models.js";
import { Comment } from "../models/comment.models.js";
import { User } from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
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

const updateComment = asyncHandler(async(req, res)=>{
    const { commentId } = req.params
    const { content } = req.body
    const userId = req.user._id
    if(!content?.trim()){
        throw new ApiError(400,"Content not found to post")
    }
    // const oldComment = await Comment.findOne({
    //     _id:commentId,
    //     owner:userId,
    //     blog:blogId
    // })
    
    // if(!oldComment) throw new ApiError(400,"Blog not found")
    
    const comment = await Comment.findOneAndUpdate(
        // i did not know that u can pass an object instead of only _id
        {
            _id: commentId,
            owner:userId
        },
        {
            $set:{
                content:content
            }
        },{
            new : true,
            runValidators:true
        }
    ).populate("(owner","username email")

    if(!comment){
        throw new ApiError(404,"Comment not found or you are not authorized to update")
    }
    
    return res.status(200).json(new ApiResponse(200,comment,"Comment updated successfully!"))
})

const deleteComment = asyncHandler(async(req, res)=>{
    const {commentId} = req.params
    const userId = req.user._id

    const deletedComment = await Comment.findOneAndDelete({
        _id:commentId,
        owner:userId
    })

    if(!deletedComment){
        throw new ApiError(400,"Comment not found or you're not authorized to delete this comment")
    }
    
    return res.status(200).json(new ApiResponse(200,null,"Comment deleted Successfully!"))

})

const getAllComments = asyncHandler(async(req, res)=>{
    const {blogId} = req.params
    const {page=1, limit=10}= req.query
    const pageNum = parseInt(page,10)
    const limitNum= parseInt(limit,10)
    const skipAmt = (pageNum - 1) * limitNum;


    const blog = await Blog.findById(blogId)
    if(!blog) {
        throw new ApiError(400,"Blog not found")
    }

    const comments = await Comment.find({blog:blogId})
                                  .populate("owner","username email")
                                  .sort({createdAt: -1})
                                  .skip(skipAmt)
                                  .limit(limitNum)

    const totalComments = await Comment.countDocuments({blog: blogId})
    const pagination = {
        currentPage : pageNum,
        totatPages : Math.ceil(totalComments / limitNum),
        totalComments
    }
    return res.status(200).json(new ApiResponse(200,{comments, pagination},"comments retrieved successfully"))
})

const likeComment = asyncHandler(async(req, res)=>{
    
})
export {createComment, updateComment, deleteComment, getAllComments}