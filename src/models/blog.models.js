import mongoose,{Schema} from "mongoose";

const blogSchema = new Schema({
        author:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        thumbnail:{
            type:String,
            required:true,

        },
        title:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        views:{
            type:Number,
            default:0
        },
        likes:[
            {
            type:Schema.Types.ObjectId,
            ref:"Like"
            }
        ],
        comments:[{
            type:Schema.Types.ObjectId,
            ref:"Comment"
        }],
        isPublished:{
            type:Boolean,
            default:false
            
        },
        category:{
            type:String
        }
},{timestamps:true})

export const Blog = mongoose.model("Blog",blogSchema)