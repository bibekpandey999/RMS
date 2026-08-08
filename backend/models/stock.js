const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
    {
        restaurantId: {
            type: String,
            required: true,
        },
        stockName: {
            type: String,
            required: [true, "Stock name is required"],
            trim: true,
        },
        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [0, "Quantity cannot be negative"],
        },
        closingStock: {
            type: Number,
            min: [0, "Quantity cannot be negative"],
        },
        perPiecePrice: {
            type: Number,
            required: [true, "Per piece price is required"],
            min: [0, "Price cannot be negative"],
        },
        totalPrice: {
            type: Number,
            required: [true, "Total price is required"],
            min: [0, "Price cannot be negative"],
        },
    },
    {
        timestamps: true, 
    }
);

const Stock = mongoose.model("Stock", stockSchema);
module.exports = Stock;