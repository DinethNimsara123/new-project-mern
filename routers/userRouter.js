import express from "express";
import {createUser,loginUser,getUser} from '../controllers/userController.js';
import authenticate from "../middlewares/authenticate.js";

const userRouter=express.Router()

userRouter.post("/",createUser)
userRouter.post("/login",loginUser)
// Token එක එවලා user ගේ හැම විස්තරයක්ම ගන්නා Route එක
userRouter.get("/me",authenticate, getUser);

export default userRouter 