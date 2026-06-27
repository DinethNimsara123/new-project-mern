import express from "express";
import {createUser,loginUser,getUser,updateUserProfile,changePassword} from '../controllers/userController.js';
import authenticate from "../middlewares/authenticate.js";
import { googleLogin } from "../controllers/userController.js";


const userRouter=express.Router()

userRouter.post("/",createUser)
userRouter.post("/login",loginUser)
// Token එක එවලා user ගේ හැම විස්තරයක්ම ගන්නා Route එක
userRouter.get("/me",authenticate, getUser);


// 🔄 Token එක එවලා තමන්ගේම විස්තර අප්ඩේට් කරන අලුත් Route එක
userRouter.put("/profile", authenticate, updateUserProfile);


userRouter.post("/change-password", authenticate, changePassword);

userRouter.post("/google-login", googleLogin);


export default userRouter 