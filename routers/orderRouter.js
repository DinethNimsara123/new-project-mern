/*
import express from "express";
import { createOrder,getAllOrders,deleteOrder} from "../controllers/orderController.js";

// 🔐 🔥 සර්ගේ authMiddleware එක (jwt) තියෙන ෆයිල් එක මෙතනින් import කරගන්නවා
// (සටහන: ඔයාගේ jwt middleware ෆයිල් එක තියෙන්නේ 'middlewares/auth.js' වගේ වෙනත් තැනක නම් ඒ path එක දෙන්න)
import authenticate from "../middlewares/authenticate.js";

const orderRouter = express.Router();

// ⚡ POST Request එක මැදට 'jwt' එක ප්ලග් කරා
orderRouter.post("/", authenticate, createOrder); 

//සියලුම ඕඩර්ස් Pagination අනුව ලබාගැනීම (GET Request)
orderRouter.get("/:pageNumber/:pageSize", authenticate, getAllOrders);


// 3️⃣ 🗑️ ඇඩ්මින්ට හෝ අදාළ කස්ටමර්ට ඕඩර් එකක් ඩේටාබේස් එකෙන් මකා දැමීම (DELETE Request)
// මෙතනදී URL එක වෙන්නේ '/orders/:orderId' (frontend එකෙන් එවන id එක ගන්න)
orderRouter.delete("/:orderId", authenticate, deleteOrder);


router.delete("/customer-cancel/:id", orderController.cancelOrderByCustomer);

export default orderRouter;*/

import express from "express";
import { createOrder,getAllOrders,deleteOrder, cancelOrderByCustomer,updateOrderStatus,updateOrderMessage,customerDeleteOrder} from "../controllers/orderController.js";

// 🔐 🔥 සර්ගේ authMiddleware එක (jwt) තියෙන ෆයිල් එක මෙතනින් import කරගන්නවා
// (සටහන: ඔයාගේ jwt middleware ෆයිල් එක තියෙන්නේ 'middlewares/auth.js' වගේ වෙනත් තැනක නම් ඒ path එක දෙන්න)
import authenticate from "../middlewares/authenticate.js";

const orderRouter = express.Router();

// ⚡ POST Request එක මැදට 'jwt' එක ප්ලග් කරා
orderRouter.post("/", authenticate, createOrder); 

//සියලුම ඕඩර්ස් Pagination අනුව ලබාගැනීම (GET Request)
orderRouter.get("/:pageNumber/:pageSize", authenticate, getAllOrders);


// 3️⃣ 🗑️ ඇඩ්මින්ට හෝ අදාළ කස්ටමර්ට ඕඩර් එකක් ඩේටාබේස් එකෙන් මකා දැමීම (DELETE Request)
// මෙතනදී URL එක වෙන්නේ '/orders/:orderId' (frontend එකෙන් එවන id එක ගන්න)
orderRouter.delete("/:orderId", authenticate, deleteOrder);


orderRouter.delete("/customer-cancel/:id", authenticate, cancelOrderByCustomer);

// 🔄 Admin කෙනෙක්ට ඕඩර් ස්ටේටස් එක අප්ඩේට් කරන්න දාපු අලුත්ම රවුට් එක

orderRouter.put("/update-status/:orderId", authenticate, updateOrderStatus);

orderRouter.put("/update-message/:orderId",authenticate, updateOrderMessage);

// කස්ටමර්ට විතරක් ඕඩර් එක කැන්සල් කරලා ස්ටොක් රීස්ටෝර් කරන්න දෙන Route එක
orderRouter.delete("/customer/:id", authenticate, customerDeleteOrder);

export default orderRouter;