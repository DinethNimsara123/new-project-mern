
/*import Order from "../models/order.js";
import Product from "../models/product.js"; 
import { v4 as uuidv4 } from "uuid";

export async function createOrder(req, res) {
    try {
        // 🔐 1. යූසර් ලොග් වෙලාද කියලා බලනවා (Token එකක් තිබීම අනිවාර්යයි)
        if (!req.user) {
            return res.status(401).json({
                message: "Please login to place an order! 🔒"
            });
        }

        // 📝 මෙතන තිබ්බ Role/Type Check කරන කෑල්ල අයින් කළා. දැන් Token එක තියෙන ඕනෑම කෙනෙක්ට ඕඩර් කරන්න පුළුවන්.

        const orderData = req.body;

        // 🔍 3. 🛡️ ඕඩර් එක ඩේටාබේස් එකට දාන්න කලින් ප්‍රඩක්ට් සහ ස්ටොක් ඔක්කොම චෙක් කරලා බ්‍රේක් කරන ලොජික් එක
        for (const item of orderData.items) {
            const product = await Product.findOne({ productId: item.product.productId });

            // ❌ ප්‍රඩක්ට් එක ඩේටාබේස් එකේ නැත්නම් ඕඩර් එක මෙතනින්ම බ්‍රේක් (Stop) කරනවා
            if (!product) {
                return res.status(404).json({
                    message: `Product not found: ${item.product.name} ❌`
                });
            }

            // ❌ යූසර් ඉල්ලන ප්‍රමාණය (qty) ඩේටාබේස් එකේ තියෙන ස්ටොක් එකට වඩා වැඩි නම් ඕඩර් එක බ්‍රේක් කරනවා
            if (product.stock < item.qty) {
                return res.status(400).json({
                    message: `Sorry, insufficient stock for ${product.name}. Available stock: ${product.stock} ⚠️`
                });
            }
        }

        // 🆔 4. හැම ප්‍රඩක්ට් එකක්ම හරියටම තිබුණොත් විතරක් Unique Order ID එකක් හදනවා
        const uniqueId = uuidv4();
        const orderId = uniqueId.split("-")[0]; 

        // 📦 5. අලුත් Order Object එක සාදනවා
        const newOrder = new Order({
            orderId: orderId,
            email: req.user.email, 
            firstName: orderData.firstName,
            lastName: orderData.lastName,
            addressLine1: orderData.addressLine1,
            addressLine2: orderData.addressLine2,
            city: orderData.city,
            phone: orderData.phone,
            totalAmount: orderData.totalAmount,
            items: orderData.items,
            status: "Pending"
        });

        // 💾 6. Database එකට Order එක සේဝ် කිරීම
        await newOrder.save();

        // 🔄 7. 📉 දැන් බය නැතුව හැම ප්‍රඩක්ට් එකකම ස්ටොක් එක අඩු කරනවා (මොකද උඩදි අපි චෙක් කරලා ඉවරයි)
        for (const item of orderData.items) {
            const product = await Product.findOne({ productId: item.product.productId });
            
            if (product) {
                product.stock = product.stock - item.qty; // ස්ටොක් එක අඩු කරනවා
                
                if (product.stock <= 0) {
                    product.stock = 0;
                    product.isAvailable = false;
                }
                await product.save(); // අප්ඩේට් වුණු ප්‍රඩක්ට් එක ඩේටාබේස් සේව් කරනවා
            }
        }

        // 🎉 8. සාර්ථක ප්‍රතිචාරය (Response) යැවීම
        res.status(201).json({
            message: "Order placed successfully! ⚡🎉",
            order: newOrder
        });

    } catch (error) {
        console.error("Error in createOrder:", error);
        res.status(500).json({
            message: "Failed to place order. Internal Server Error.",
            error: error.message
        });
    }
} 



export async function getAllOrders(req, res) {
    
    if (req.user == null) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const pageSizeInString = req.params.pageSize || "10";
        const pageNumberInString = req.params.pageNumber || "1";

        const pageSize = parseInt(pageSizeInString);
        const pageNumber = parseInt(pageNumberInString);

        // --- 1. ADMIN පරිශීලකයා සඳහා ---
        if (req.user.isAdmin) {
            
            // සිස්ටම් එකේ ඇති සියලුම ඕඩර්ස් ප්‍රමාණය ගණන් කරයි
            const orderCount = await Order.countDocuments();
            const totalPages = Math.ceil(orderCount / pageSize);

            // සිස්ටම් එකේ ඇති සියලුම ඕඩර්ස් Pagination වලට අනුව ලබා ගනියි
            const orders = await Order.find()
                .sort({ date: -1 })
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize);

            res.json({
                orders: orders,
                totalPages: totalPages,
                currentPage: pageNumber,
                totalOrders: orderCount
            });

        // --- 2. සාමාන්‍ය පරිශීලකයා (CUSTOMER) සඳහා ---
        } else {
            
            // ලොග් වී සිටින පරිශීලකයාගේ ඊමේල් එකට අදාළ ඕඩර්ස් පමණක් ගණන් කරයි
            const orderCount = await Order.countDocuments({ email: req.user.email });
            const totalPages = Math.ceil(orderCount / pageSize);

            // එම පරිශීලකයාගේ ඕඩර්ස් පමණක් පෙරා (Filter කර) Pagination අනුව ලබා ගනියි
            const orders = await Order.find({ email: req.user.email })
                .sort({ date: -1 })
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize);

            res.json({
                orders: orders,
                totalPages: totalPages,
                currentPage: pageNumber,
                totalOrders: orderCount
            });
        }

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
} 


// 🗑️ ඕඩර් එකක් ඩේටාබේස් එකෙන් මැකීමේ Function එක (Admin සහ Customer දෙන්නටම පොදුවේ)
export async function deleteOrder(req, res) {
    try {
        // 🔐 1. යූසර් ලොග් වෙලාද කියලා බලනවා
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized! Please login." });
        }

        const { orderId } = req.params; // Route එකෙන් එන Order ID (_id) එක ගන්නවා

        // 🔎 2. ඩේටාබේස් එකේ මෙහෙම ඕඩර් එකක් ඇත්තටම තියෙනවද බලනවා
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found in database! ❌" });
        }

        // 🛡️ 3. [ROLE CHECK LOGIC] - ඇඩ්මින්ට සහ කස්ටමර්ට වෙන වෙනම බලය පරීක්ෂා කිරීම
        if (req.user.isAdmin) {
            // 👨‍💼 පරිශීලකයා Admin කෙනෙක් නම්, ඕනෑම ඕඩර් එකක් ඩිලීට් කිරීමට ඉඩ දේ.
            await Order.findByIdAndDelete(orderId);
            return res.status(200).json({
                message: "Order permanently deleted by Admin successfully! ⚡🗑️"
            });
        } else {
            // 👤 පරිශීලකයා සාමාන්‍ය කස්ටමර් කෙනෙක් නම්:
            // ඕඩර් එකේ තියෙන email එක සහ ලොග් වෙලා ඉන්න කස්ටමර්ගේ email එක සමානද කියා බලයි.
            if (order.email === req.user.email) {
                await Order.findByIdAndDelete(orderId);
                return res.status(200).json({
                    message: "Your order has been deleted successfully! ⚡🗑️"
                });
            } else {
                // ❌ වෙනත් කෙනෙක්ගේ ඕඩර් එකක් ඩිලීට් කරන්න හැදුවොත් Block කරයි!
                return res.status(403).json({
                    message: "Forbidden! You can only delete your own orders. 🛡️"
                });
            }
        }

    } catch (error) {
        console.error("Error in deleteOrder:", error);
        res.status(500).json({
            message: "Failed to delete order. Internal Server Error.",
            error: error.message
        });
    }
}  





// 📦 CUSTOMER කෙනෙක් ඕඩර් එකක් CANCEL කරද්දී ස්ටොක් එක වැඩි කරන අලුත්ම Logic එක
const Order = require("../models/orderModel"); // ඔයාගේ Order Model එකේ නම දාන්න
const Product = require("../models/productModel"); // ඔයාගේ Product Model එකේ නම දාන්න

exports.cancelOrderByCustomer = async (req, res) => {
  try {
    const { id } = req.params; // Frontend එකෙන් එවන Order ID එක

    // 1. මුලින්ම අදාළ ඕඩර් එක ඩේටාබේස් එකෙන් හොයාගන්නවා
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // 2. ඕඩර් එක ඇතුළේ Items තියෙනවා නම්, ඒවා එකින් එක අරන් ස්ටොක් එක ආපහු වැඩි කරනවා
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        // item.product එක ඇතුළේ තියෙන Product ID එකෙන් Product එක හොයාගෙන stock එක $inc (increment) කරනවා
        const productId = item.product._id || item.product;
        
        await Product.findByIdAndUpdate(productId, {
          $inc: { stock: item.qty } // අඩු වුණු ප්‍රමාණය (Quantity) ආපහු එකතු කරනවා 📈
        });
      }
    }

    // 3. ස්ටොක් එක අප්ඩේට් කරලා ඉවර වුණාට පස්සේ ඕඩර් එක ඩේටාබේස් එකෙන් සම්පූර්ණයෙන්ම මකනවා
    await Order.findByIdAndDelete(id);

    res.status(200).json({ 
      success: true, 
      message: "Order cancelled by customer and stock restored successfully!" 
    });

  } catch (error) {
    console.error("Error in customer cancel:", error);
    res.status(500).json({ success: false, message: "Server error while cancelling order" });
  }
};

*/ 
  



import Order from "../models/order.js";
import Product from "../models/Product.js"; 
import { v4 as uuidv4 } from "uuid";

export async function createOrder(req, res) {
    try {
        // 🔐 1. යූසර් ලොග් වෙලාද කියලා බලනවා (Token එකක් තිබීම අනිවාර්යයි)
        if (!req.user) {
            return res.status(401).json({
                message: "Please login to place an order! 🔒"
            });
        }

        // 📝 මෙතන තිබ්බ Role/Type Check කරන කෑල්ල අයින් කළා. දැන් Token එක තියෙන ඕනෑම කෙනෙක්ට ඕඩර් කරන්න පුළුවන්.

        const orderData = req.body;

        // 🔍 3. 🛡️ ඕඩර් එක ඩේටාබේස් එකට දාන්න කලින් ප්‍රඩක්ට් සහ ස්ටොක් ඔක්කොම චෙක් කරලා බ්‍රේක් කරන ලොජික් එක
        for (const item of orderData.items) {
            const product = await Product.findOne({ productId: item.product.productId });

            // ❌ ප්‍රඩක්ට් එක ඩේටාබේස් එකේ නැත්නම් ඕඩර් එක මෙතනින්ම බ්‍රේක් (Stop) කරනවා
            if (!product) {
                return res.status(404).json({
                    message: `Product not found: ${item.product.name} ❌`
                });
            }

            // ❌ යූසර් ඉල්ලන ප්‍රමාණය (qty) ඩේටාබේස් එකේ තියෙන ස්ටොක් එකට වඩා වැඩි නම් ඕඩර් එක බ්‍රේක් කරනවා
            if (product.stock < item.qty) {
                return res.status(400).json({
                    message: `Sorry, insufficient stock for ${product.name}. Available stock: ${product.stock} ⚠️`
                });
            }
        }

        // 🆔 4. හැම ප්‍රඩක්ට් එකක්ම හරියටම තිබුණොත් විතරක් Unique Order ID එකක් හදනවා
        const uniqueId = uuidv4();
        const orderId = uniqueId.split("-")[0]; 

        // 📦 5. අලුත් Order Object එක සාදනවා
        const newOrder = new Order({
            orderId: orderId,
            email: req.user.email, 
            firstName: orderData.firstName,
            lastName: orderData.lastName,
            addressLine1: orderData.addressLine1,
            addressLine2: orderData.addressLine2,
            city: orderData.city,
            phone: orderData.phone,
            totalAmount: orderData.totalAmount,
            items: orderData.items,
            status: "Pending"
        });

        // 💾 6. Database එකට Order එක සේව් කිරීම
        await newOrder.save();

        // 🔄 7. 📉 දැන් බය නැතුව හැම ප්‍රඩක්ට් එකකම ස්ටොක් එක අඩු කරනවා (මොකද උඩදි අපි චෙක් කරලා ඉවරයි)
        for (const item of orderData.items) {
            const product = await Product.findOne({ productId: item.product.productId });
            
            if (product) {
                product.stock = product.stock - item.qty; // ස්ටොක් එක අඩු කරනවා
                
                if (product.stock <= 0) {
                    product.stock = 0;
                    product.isAvailable = false;
                }
                await product.save(); // අප්ඩේට් වුණු ප්‍රඩක්ට් එක ඩේටාබේස් සේව් කරනවා
            }
        }

        // 🎉 8. සාර්ථක ප්‍රතිචාරය (Response) යැවීම
        res.status(201).json({
            message: "Order placed successfully! ⚡🎉",
            order: newOrder
        });

    } catch (error) {
        console.error("Error in createOrder:", error);
        res.status(500).json({
            message: "Failed to place order. Internal Server Error.",
            error: error.message
        });
    }
} 



export async function getAllOrders(req, res) {
    
    if (req.user == null) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const pageSizeInString = req.params.pageSize || "10";
        const pageNumberInString = req.params.pageNumber || "1";

        const pageSize = parseInt(pageSizeInString);
        const pageNumber = parseInt(pageNumberInString);

        // --- 1. ADMIN පරිශීලකයා සඳහා ---
        if (req.user.isAdmin) {
            
            // සිස්ටම් එකේ ඇති සියලුම ඕඩර්ස් ප්‍රමාණය ගණන් කරයි
            const orderCount = await Order.countDocuments();
            const totalPages = Math.ceil(orderCount / pageSize);

            // සිස්ටම් එකේ ඇති සියලුම ඕඩර්ස් Pagination වලට අනුව ලබා ගනියි
            const orders = await Order.find()
                .sort({ date: -1 })
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize);

            res.json({
                orders: orders,
                totalPages: totalPages,
                currentPage: pageNumber,
                totalOrders: orderCount
            });

        // --- 2. සාමාන්‍ය පරිශීලකයා (CUSTOMER) සඳහා ---
        } else {
            
            // ලොග් වී සිටින පරිශීලකයාගේ ඊමේල් එකට අදාළ ඕඩර්ස් පමණක් ගණන් කරයි
            const orderCount = await Order.countDocuments({ email: req.user.email });
            const totalPages = Math.ceil(orderCount / pageSize);

            // එම පරිශීලකයාගේ ඕඩර්ස් පමණක් පෙරා (Filter කර) Pagination අනුව ලබා ගනියි
            const orders = await Order.find({ email: req.user.email })
                .sort({ date: -1 })
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize);

            res.json({
                orders: orders,
                totalPages: totalPages,
                currentPage: pageNumber,
                totalOrders: orderCount
            });
        }

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
} 


// 🗑️ ඕඩර් එකක් ඩේටාබේස් එකෙන් මැකීමේ Function එක (Admin සහ Customer දෙන්නටම පොදුවේ)
export async function deleteOrder(req, res) {
    try {
        // 🔐 1. යූසර් ලොග් වෙලාද කියලා බලනවා
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized! Please login." });
        }

        const { orderId } = req.params; // Route එකෙන් එන Order ID (_id) එක ගන්නවා

        // 🔎 2. ඩේටාබේස් එකේ මෙහෙම ඕඩර් එකක් ඇත්තටම තියෙනවද බලනවා
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found in database! ❌" });
        }

        // 🛡️ 3. [ROLE CHECK LOGIC] - ඇඩ්මින්ට සහ කස්ටමර්ට වෙන වෙනම බලය පරීක්ෂා කිරීම
        if (req.user.isAdmin) {
            // 👨‍💼 පරිශීලකයා Admin කෙනෙක් නම්, ඕනෑම ඕඩර් එකක් ඩිලීට් කිරීමට ඉඩ දේ.
            await Order.findByIdAndDelete(orderId);
            return res.status(200).json({
                message: "Order permanently deleted by Admin successfully! ⚡🗑️"
            });
        } else {
            // 👤 පරිශීලකයා සාමාන්‍ය කස්ටමර් කෙනෙක් නම්:
            // ඕඩර් එකේ තියෙන email එක සහ ලොග් වෙලා ඉන්න කස්ටමර්ගේ email එක සමානද කියා බලයි.
            if (order.email === req.user.email) {
                await Order.findByIdAndDelete(orderId);
                return res.status(200).json({
                    message: "Your order has been deleted successfully! ⚡🗑️"
                });
            } else {
                // ❌ වෙනත් කෙනෙක්ගේ ඕඩර් එකක් ඩිලීට් කරන්න හැදුවොත් Block කරයි!
                return res.status(403).json({
                    message: "Forbidden! You can only delete your own orders. 🛡️"
                });
            }
        }

    } catch (error) {
        console.error("Error in deleteOrder:", error);
        res.status(500).json({
            message: "Failed to delete order. Internal Server Error.",
            error: error.message
        });
    }
}  


// 📦 CUSTOMER කෙනෙක් ඕඩර් එකක් CANCEL කරද්දී ස්ටොක් එක වැඩි කරන අලුත්ම Logic එක
export async function cancelOrderByCustomer(req, res) {
  try {
    const { id } = req.params; // Frontend එකෙන් එවන Order ID එක

    // 1. මුලින්ම අදාළ ඕඩර් එක ඩේටාබේස් එකෙන් හොයාගන්නවා
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // 2. ඕඩර් එක ඇතුළේ Items තියෙනවා නම්, ඒවා එකින් එක අරන් ස්ටොක් එක ආපහු වැඩි කරනවා
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        // item.product එක ඇතුළේ තියෙන Product ID එකෙන් Product එක හොයාගෙන stock එක $inc (increment) කරනවා
        const productId = item.product._id || item.product;
        
        await Product.findByIdAndUpdate(productId, {
          $inc: { stock: item.qty } // අඩු වුණු ප්‍රමාණය (Quantity) ආපහු එකතු කරනවා 📈
        });
      }
    }

    // 3. ස්ටොක් එක අප්ඩේට් කරලා ඉවර වුණාට පස්සේ ඕඩර් එක ඩේටාබේස් එකෙන් සම්පූර්ණයෙන්ම මකනවා
    await Order.findByIdAndDelete(id);

    res.status(200).json({ 
      success: true, 
      message: "Order cancelled by customer and stock restored successfully!" 
    });

  } catch (error) {
    console.error("Error in customer cancel:", error);
    res.status(500).json({ success: false, message: "Server error while cancelling order" });
  }
}
   


// 🔄 5. Update Order Status (Admin සඳහා පමණි)
export async function updateOrderStatus(req, res) {
    
    // 🛡️ පියවර 1: රික්වෙස්ට් එකත් එක්ක Token එකක් ඇවිත් නැත්නම් (req.user හිස් නම්) කෙලින්ම බ්ලොක් කරනවා
    if (!req.user) {
        return res.status(401).json({ 
            message: "Access Denied! No token provided. Please login first. 🔑" 
        });
    }

    // 🛡️ පියවර 2: ටෝකන් එකක් තිබ්බත්, ඒකේ ඇතුලේ තියෙන Role එක "Admin" නෙවෙයි නම් බ්ලොක් කරනවා
    if (!req.user.isAdmin) {
        return res.status(403).json({ 
            message: "Unauthorized! Only users with 'Admin' role can change order status. 🔒" 
        });
    }

    try {
        const { orderId } = req.params; // URL එකෙන් එන Order ID එක ගන්නවා (e.g., /orders/update-status/12345)
        const { status } = req.body;    // Frontend එකෙන් එවන අලුත් Status එක ගන්නවා ("delivered", "shipping" වගේ)

        // 1. මුලින්ම මෙහෙම ඕඩර් එකක් ඩේටාබේස් එකේ තියෙනවද බලනවා
        const order = await Order.findOne({ orderId: orderId });
        if (order == null) {
            return res.status(404).json({ message: "Order not found ❌" });
        }

        // 2. සියලුම ආරක්ෂිත පියවරවල් හරි නිසා ඩේටාබේස් එකේ Order Status එක අප්ඩේට් කරනවා
        await Order.updateOne(
            { orderId: orderId },
            { status: status }
        );

        res.status(200).json({ message: "Order status updated successfully! ⚡📦" });

    } catch (err) {
        console.error("Error in updateOrderStatus:", err);
        res.status(500).json({ message: err.message });
    }
}




// Order එකට අදාළ Admin Message එක Update කරන්න හෝ Delete කරන්න වෙනම Function එකක්
export async function updateOrderMessage(req, res) {
    // Admin කෙනෙක්ද කියලා Check කිරීම
    if (req.user == null || req.user.isAdmin == false) {
        res.status(401).json({ message: "Unauthorized! Admin access required." });
        return;
    }

    try {
        const { orderId } = req.params;
        const { adminMessage } = req.body; // Frontend එකෙන් එවන මැසේජ් එක

        // URL එකෙන් එන orderId එකට අදාළ Order එක හොයනවා
        const order = await Order.findOne({ orderId: orderId });

        if (order == null) {
            res.status(404).json({ message: "Order not found" });
            return;
        }

        // Database එකේ adminMessage එක විතරක් update කරනවා
        // Frontend එකෙන් හිස් string එකක් ("") එව්වොත් මැසේජ් එක auto මකලා යනවා
        await Order.updateOne(
            { orderId: orderId },
            { adminMessage: adminMessage }
        );

        res.json({ message: "Order message updated successfully!" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
} 





export async function customerDeleteOrder(req, res) {
    try {
        const orderId = req.params.id;

        // 1. ආරක්ෂක පියවර: ඇඩ්මින් කෙනෙක් මේ රික්වෙස්ට් එක එව්වොත් බ්ලොක් කරනවා
        if (req.user.isAdmin === true) {
            return res.status(403).json({ 
                message: "Action denied! Admins cannot use this endpoint to delete orders." 
            });
        }

        // 2. Database එකෙන් ඕඩර් එක සොයා ගැනීම
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // 3. ආරක්ෂක පියවර: මේ ඕඩර් එක අයිති අදාළ ලොග් වී සිටින කස්ටමර්ටමද කියා බැලීම
        if (order.email !== req.user.email) {
            return res.status(403).json({ message: "Unauthorized! This is not your order." });
        }

        // 4. කස්ටමර් කැන්සල් කරන නිසා බඩු ටික ආපහු Product Stock එකට එකතු කිරීම
        for (const item of order.orderedItems) {
            await Product.findByIdAndUpdate(
                item.productId, 
                { $inc: { stock: item.quantity } } // Stock එක ආපහු වැඩි කරනවා
            );
        }

        // 5. ඕඩර් එක database එකෙන් මකා දැමීම
        await Order.findByIdAndDelete(orderId);

        res.json({ message: "Your order has been cancelled and stock restored successfully!" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}