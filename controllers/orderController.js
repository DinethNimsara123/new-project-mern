import Order from "../models/order.js";
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