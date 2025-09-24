// copy of API server 

const host = "http://192.168.255.194:5000";

import express from "express";
import fetch from "node-fetch";

import dotenv from 'dotenv'
dotenv.config();

import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());



const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET; // your Paystack secret key
// Initialize transaction
app.post("/api/pay", async (req, res) => {
  try {
    const { email, amount } = req.body;

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // kobo / pesewas
        channels: ["card", "mobile_money", "bank"],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Paystack init error:", data);
      return res.status(response.status).json({ error: data });
    }

    res.json(data);
  } catch (err) {
    console.error("Paystack init error:", err);
    res.status(500).json({ error: "Payment init failed" });
  }
});

// Verify transaction
app.get("/api/verify/:ref", async (req, res) => {
  try {
    const ref = req.params.ref;

    const response = await fetch(`https://api.paystack.co/transaction/verify/${ref}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Paystack verify error:", data);
      return res.status(response.status).json({ error: data });
    }

    // send back to frontend
    res.json(data);
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});


app.listen(5000, () => console.log(`Server running on ${host}`));
