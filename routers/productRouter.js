import express from "express";
import { creatProduct,getAllproduct ,deletProduct,updateProduct,getProductById} from "../controllers/productContrfoller.js";
import  authenticate  from  "../middlewares/authenticate.js";

const productRouter = express.Router();

productRouter.post("/", authenticate, creatProduct);
productRouter.get("/",authenticate,getAllproduct);
productRouter.get("/:productId",authenticate,getProductById)
productRouter.delete("/:productId",authenticate,deletProduct)
productRouter.put("/:productId",authenticate,updateProduct)





export default productRouter;