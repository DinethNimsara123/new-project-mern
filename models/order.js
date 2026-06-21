import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    addressLine1: {
        type: String,
        required: true
    },
    addressLine2: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: "Pending"
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    items: [
        {
            product: {
                productId: {
                    type: String,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                image: {
                    type: [String], // <-- මේක විතරයි වෙනස් කළේ
                    required: true
                },
                price: {
                    type: Number,
                    required: true
                },
                labelPrice: {
                    type: Number,
                    required: false
                }
            },
            qty: {
                type: Number,
                required: true,
                default: 1
            }
        }
    ]
});

const Order = mongoose.model("orders", orderSchema);
export default Order;