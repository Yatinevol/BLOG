import mongoose,{Schema} from "mongoose";

const likeSchema = new Schema({
    blog:{
        required:true,
        type:Schema.Types.ObjectId,
        ref:"Blog"
    },
    likedby:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    comment:{
        required:true,
        type:Schema.Types.ObjectId,
        ref:"Comment"
    }
},{timestamps:true})

export const Like = mongoose.model("Like",likeSchema)