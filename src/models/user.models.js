import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
        username:{
            type:String,
            required:true,
            lowercase:true,
            unique:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            trim:true,
            unique:true,
            lowercase:true,

        },
        password:{
            type:String,
            required:true,
            trim:true,
        },
        bio:{
            type:String,
            trim:true,
        },
        pfp:{
            type:String
        },
        bookemarked:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Blog"
            }
        ],
        slinks:{
            type:Map,
            of:String
        },
        role:{
            type:String,
            default:"user"

        },
        refreshToken:{
            type:String,
        }

},{timestamps:true})

export const User = mongoose.model("User",userSchema)