import User from "../models/User.js"
import bcrypt from "bcrypt"
export const createUser=async(req,res)=>{
    try{
        const user=await User.findOne({email:req.body.email})
        if(user != null){
              res.json({message:"already exists"})
              return
        }
        const saltRounds=10
        const passwordHash = bcrypt.hashSync(req.body.password,saltRounds)
        console.log(passwordHash)

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
            res.json({message:"Email and password are required"})
            return
        }
       const user = await User.findOne({email:email})
       if(user==null){
        res.jason({message:"user not found"})
        return
       }
       
       const isPasswordVaild=bcrypt.compareSync(password,user.password)
       if(isPasswordVaild){
         res.json({message:"Login successfully"})
       }else{
        res.json({message:"Invalid password"})
       }

    }catch(err){
        res,json({message:err.message})
    }
}