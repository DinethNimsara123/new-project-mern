import express from "express";
import { createOrder } from "../controllers/orderController.js";

// 🔐 🔥 සර්ගේ authMiddleware එක (jwt) තියෙන ෆයිල් එක මෙතනින් import කරගන්නවා
// (සටහන: ඔයාගේ jwt middleware ෆයිල් එක තියෙන්නේ 'middlewares/auth.js' වගේ වෙනත් තැනක නම් ඒ path එක දෙන්න)
import authenticate from "../middlewares/authenticate.js";

const orderRouter = express.Router();

// ⚡ POST Request එක මැදට 'jwt' එක ප්ලග් කරා
orderRouter.post("/", authenticate, createOrder); 

export default orderRouter;