import { User } from "../models/user.models.js";
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import uploadOnCloudinary from "../utils/cloudinary.js";
import { Blog } from "../models/blog.models.js";
import ApiResponse from "../utils/ApiResponse.js";
import extractFileNameFromUrl from "../utils/extractFileName.js";
import mongoose from "mongoose";
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

const getAllBlog = asyncHandler(async(req,res)=>{
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    // Convert pagination parameters to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skipAmt = (pageNum - 1) * limitNum;

    // Build filter object
    const filter = {};
    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { content: { $regex: query, $options: "i" } }
            
        ];
    }
    if (userId) {
        filter.userId = userId;
    }

    // Build sort criteria
    const sort = {};
    if (sortBy) {
        sort[sortBy] = sortType === 'desc' ? -1 : 1;
    } else {
        // Default sort by createdAt in descending order if no sort specified
        sort.createdAt = -1;
    }

    try {
        // Find all blogs with filter, sort and pagination
        const blogs = await Blog.find(filter)
            .sort(sort)
            .skip(skipAmt)
            .limit(limitNum);

        if (!blogs || blogs.length === 0) {
            throw new ApiError(400, "No blogs found");
        }

        // Get total count of blogs for pagination
        const totalBlogs = await Blog.countDocuments(filter);

        // Prepare pagination info
        const pagination = {
            currentPage: pageNum,
            totalPages: Math.ceil(totalBlogs / limitNum),
            totalBlogs
        };

        return res.status(200).json(
            new ApiResponse(
                200, 
                { blogs, pagination }, 
                "Blogs retrieved successfully"
            )
        );

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error);
        }
        return res.status(500).json(
            new ApiError(500, "Internal server error")
        );
    }
})

const likesOnBlogId = asyncHandler(async (req,res)=>{
    const {blogId} = req.params
    const blog = await Blog.findById(blogId)
    if(!blog ) throw new ApiError(400,"Blog not found")
    
    const [liked] = await Blog.aggregate([{
        $match:{
            // if blogId is string casting it into actual id
            // _id: new mongoose.Types.ObjectId({blogId})
            _id:blog._id
        }
    },
    {
        $lookup:{
            from:"likes",
            localField:"_id",
            foreignField:"blog",
            as:"likes"
        }
    },{
        $addFields:{
            likesCount:{
                $size:"$likes"
            },
            likedStatus:{
                $in: [new mongoose.Types.ObjectId(req.user._id),"$likes.likedby"]
            }
        }
    }])
    if(!liked || liked.likesCount===0){
        return res.status(200).json( new ApiResponse(200,{blog,likedStatus:false},"Blog found successfully"))
    }
    
    
    return res.status(200).json(
        new ApiResponse(200,liked,"Blog found with number of likes  sucessfully")
    )
})
export {addBlog,updateBlog,deleteBlog,getAllBlog,likesOnBlogId}




