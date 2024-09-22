import express from "express";
import Payment from "../models/Payments.js"; // Include the '.js' extension
import Cart from "../models/Carts.js"; // Include the '.js' extension
import mongoose from "mongoose";
import verifyToken from "../middlewares/verifyToken.js"; // Include the '.js' extension

const router = express.Router();
const ObjectId = mongoose.Types.ObjectId;

// POST route for creating a payment and deleting cart items
router.post("/", async (req, res) => {
  const payment = req.body;

  try {
    // Create a new payment using Mongoose model
    const paymentResult = await Payment.create(payment);

    // Delete items from the cart
    const cartIds = payment.cartItems.map((id) => new ObjectId(id));
    const deleteResult = await Cart.deleteMany({ _id: { $in: cartIds } });

    res.status(200).json({ paymentResult, deleteResult });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET route for retrieving payments by email
router.get("/", verifyToken, async (req, res) => {
  const email = req.query.email;
  const query = { email: email };

  try {
    const decodedEmail = req.decoded.email;

    if (email !== decodedEmail) {
      return res.status(403).json({ message: "Forbidden access!" });
    }

    const result = await Payment.find(query).sort({ createdAt: -1 }).exec();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET route for retrieving all payment information
router.get("/all", async (req, res) => {
  try {
    const menus = await Payment.find({}).sort({ createdAt: -1 });
    res.status(200).json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH route for confirming payment status
router.patch("/:id", verifyToken, async (req, res) => {
  const payId = req.params.id;
  const { status } = req.body;

  try {
    const updatedStatus = await Payment.findByIdAndUpdate(
      payId,
      { status: "confirmed" },
      { new: true, runValidators: true }
    );

    if (!updatedStatus) {
      return res.status(404).json({ message: "Pay Id not found" });
    }

    res.status(200).json(updatedStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; // Use 'export default' instead of 'module.exports'
