import User from "../models/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

export const createUser=async(req,res)=>{
    try{
        const user=await User.findOne({email:req.body.email})
        if(user != null){
              res.json({message:"already exists"})
              return
        }
        const saltRounds=10
        const passwordHash = bcrypt.hashSync(req.body.password,saltRounds)
        

        const newUser = new User({
            email:req.body.email,
            firstName:req.body.firstName,
            lastName:req.body.lastName,
            password:passwordHash
        })
     await newUser.save()
        res.json({message:"user created successfully"})
    }catch(err){
        res.json({message:err.message})
        
    }
}
 
export async function loginUser(req,res){
    try{
        const email=req.body.email
        const password = req.body.password
        if(email==null || password==null){
            res.status(400).json({message:"Email and password are required"})
            return
        }
       const user = await User.findOne({email:email})
       if(user==null){
        res.status(404).jason({message:"user not found"})
        return
       }
       
       const isPasswordVaild=bcrypt.compareSync(password,user.password)
       if(isPasswordVaild){
        const token = jwt.sign(
            {
                email:user.email,
                firstName:user.firstName,
                lastName:user.lastName,
                isAdmin:user.isAdmin,
                isBlocked:user.isBlocked,
                isEmailVerified:user.isEmailVerified,
                image:user.image
            },
          process.env.JWT_SECRET_KEY
        )
         res.json({message:"Login successfully",token:token,role : user.isAdmin?"Admin":"User"})
       }else{
        res.status(401).json({message:"Invalid password"})
       }

    }catch(err){
        res,json({message:err.message})
    }
}


export async function getUser(req, res) {
    // 1. සර්ගේ ස්ක්‍රීන් එකේ විදිහටම req.user එක null ද කියා බැලීම
    if (req.user == null) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const email = req.user.email;

        // 2. Database එකෙන් user ව සොයා ගැනීම
        const user = await User.findOne({ email: email });

        // 3. User කෙනෙක් නැත්නම් (සර් ලියපු විදිහටම 404 Error එක)
        if (user == null) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // 4. User ව block කරලා නම් (සර් ලියපු විදිහටම 403 Error එක)
        if (user.isBlocked) {
            res.status(403).json({ message: "User is blocked" });
            return;
        }

        // 5. සර් වීඩියෝ එකේ ලියපු ආකෘතියටම (Explicit Mapping) Schema එකේ තියෙන හැම විස්තරයක්ම යැවීම
        res.json({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            //password: user.password, 
            isAdmin: user.isAdmin,
            isBlocked: user.isBlocked,
            isEmailVerified: user.isEmailVerified,
            image: user.image
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}