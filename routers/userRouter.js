
import express from "express";
import {createUser,loginUser,getUser,updateUserProfile,changePassword} from '../controllers/userController.js';
import authenticate from "../middlewares/authenticate.js";
import { googleLogin ,requestPasswordReset, resetPassword,getAllUsers,
    updateUserRole,
    toggleBlockStatus,
    deleteUser} from "../controllers/userController.js";


const userRouter=express.Router()

userRouter.post("/",createUser)
userRouter.post("/login",loginUser)
// Token එක එවලා user ගේ හැම විස්තරයක්ම ගන්නා Route එක
userRouter.get("/me",authenticate, getUser);


// 🔄 Token එක එවලා තමන්ගේම විස්තර අප්ඩේට් කරන අලුත් Route එක
userRouter.put("/profile", authenticate, updateUserProfile);


userRouter.post("/change-password", authenticate, changePassword);

userRouter.post("/google-login", googleLogin); 

// Password Reset Routes එකතු කිරීම
userRouter.post('/forgot-password', requestPasswordReset);
userRouter.post('/reset-password', resetPassword);


// 📌 ඇඩ්මින්වරයෙකුට පමණක් ක්‍රියාත්මක කළ හැකි මාර්ග (Admin Routes)
// 👉 Token එක චෙක් කිරීමට authenticate middleware එක පමණක් යොදා ඇත. 
// ඇඩ්මින් දැයි පරීක්ෂා කිරීම Controller ශ්‍රිතය (Function) තුළම සිදුවේ.
userRouter.get('/admin/users', authenticate, getAllUsers);
userRouter.patch('/admin/users/:userId/role', authenticate, updateUserRole);
userRouter.patch('/admin/users/:userId/block', authenticate, toggleBlockStatus);
userRouter.delete('/admin/users/:userId', authenticate, deleteUser);



export default userRouter 



