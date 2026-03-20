import jwt from "jsonwebtoken"
export default function authenticate(req,res,next){
        const header =req.header("Autherization")

         console.log("header")
         if(header==null){
            next()
         }else{
             const taken=header.replace("Bearer ","")
            
             jwt.verify(token,"secretkey3366",
                (err,decoded)=>{
                    if(decoded==null){
                        return res.status(401).json({message:"Invalid token please login again"})
                    }else{
                        req.user=decoded
                        next()
                    }
                    
                }
             )

         }
         next()

    }