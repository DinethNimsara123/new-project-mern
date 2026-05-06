import express from "express"
const app =express()
import mongoose from 'mongoose'
import studentRouter from "./routers/studentRouter.js"
import Student from "./models/student.js"
import userRouter from "./routers/userRouter.js"
import authenticate from "./middlewares/authenticate.js"
import dotenv from "dotenv"
import cors from "cors"

dotenv.config()




import dns from "node:dns";
import productRouter from "./routers/productRouter.js"
dns.setServers(["1.1.1.1","8.8.8.8"]);

const mongoDBURI = process.env.MONGO_URI
mongoose.connect(mongoDBURI).then(

    ()=>{
        console.log("connected to MongoDB successfully")
    }
)

app.use(cors())
app.use(express.json())
app.use("/api/users",userRouter)
app.use("/api/products",productRouter)

app.use(authenticate)

    

app.use("/students",studentRouter)




app.get(
    "/",
    (req,res)=>{
        console.log(req)
        console.log("get request received")
        Student.find().then(
            (students)=>{
                
                    res.json(students)
            }
        )
            
        
            
        
    }
)


app.post(
    "/",
    (req,res)=>{
        console.log(req.body.name)
        console.log("post requst recived")
             const newStudent = new Student(req.body)
            
        
               newStudent.save().then(
                ()=>{
                    res.json(
                        {
                            message:"Student added successfully"
                        }
                    )
                }
               )
        
    }
)

app.put(
    "/",
    ()=> {
        console.log("put request received")
    }
)


app.delete(
    "/",
    ()=>{
        console.log("delete requst recived")
    }
) 


function success(){
    console.log("server start successfuly")
}

app.listen(3000,success)
