import Product from "../models/Product.js"


export async function creatProduct(req,res){
     if(req.user==null ){
        res.status(401).json({message:"unauthorized"})
        return
     }
     if(!req.user.isAdmin){
        res.status(403).json({message:"Only admin can creat product"})
        return
     }
   
         try{
              const existingProduct=await Product.findOne({productId: req.body.productId})
              if(existingProduct != null)
              {
                res.status(400).json({mesxsage:"Product with this productId alread exist"})
                return
              }

             const product=new Product(req.body)
            await product.save()
            res.json({message:"product created successfully"})





             } catch(err){
        res.status(500).json({message:err.message})
     }

}

export async function getAllproduct(req,res){

    try{
        if(req.user!=null && req.user.isAdmin){
                const products = await Product.find ()
                res.json(products)
        }else{
                const products = await Product.find ( {isAvailable : true})
            res.json(products)
        }
            

    }catch(err){
        res.status(500).json ({message:err.message})

    }
}

export async function deletProduct(req,res){
    
    if(req.user!=null && req.user.isAdmin){
        try{ 
            const product =await Product.findOne({productId:req.params.productId})
              if(product==null){
                res.status(404).json({message:"product not found"})
                return
              }
            await Product.deleteOne({productId:req.body.productId})
            res.json ({message:" product deleted successfully"})
                 
        }catch(err){
           res.status(500).json({message:err.message})
        }
    }else{
        res.status(403).json({message:"Only admin can delete products"})
        return
    }


}


export async function updateProduct(req,res){


        if(req.user!=null && req.user.isAdmin){
                   try{
                     if(req.body.productId!=null){
                         res.status(400).json({message:"productId cannot be update"})
                        return
                   }
                       await Product.updateOne({productId:req.params.productId},req.body)
                        res.json ({message:" product update successfully"})
                     
                   }catch(err){
                       res.status(500).json({message:err.message})
                   }


        }else{
            res.status(403).json({message:"Only admin can update products"})
            return
        }
                
 

    
}

export async function getProductById(req,res){
    try{
               const product= await Product.findOne({productId: req.params.productId})
               if(product==null){
                res.status(404).json({message:"product not found"})
                return
               }
               if(product.isAvailable){
                res.json(product)
               }else{
                  if(req.user!=null && req.user.isAdmin){
                    res.json(product)
                  }else{
                    res.status(403).json({message:"Only admuin can view unavilable product"})
                    return
                  }
               }

    }catch(err){
           res.status(500).json({message:err.message})
    }
}
