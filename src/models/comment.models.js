import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User" 
    },
    blog:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Blog"
    },
    content:{
        type:String,
        trim:true
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Like"
    }],

},{timestamps:true})

export const Comment = mongoose.model("Comment",commentSchema) 