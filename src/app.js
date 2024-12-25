import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors"
const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"30kb"}))
app.use(express.urlencoded({limit:"10kb",extended:true}))
app.use(express.static("public"))
app.use(cookieParser())


// import routers:
import { router as userRouter} from "./routes/user.routes.js";

app.use("/api/v1/user",userRouter)



export default app