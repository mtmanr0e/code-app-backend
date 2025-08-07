const express = require("express");
const cors = require('cors');
const dotenv = require("dotenv");
const db = require('./db');
const bcrypt = require("bcrypt");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CODE App Backend is live!");
});
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error('Database test failed:', err);
    res.status(500).json({ success: false, error: 'Database connection failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
      [username, hashedPassword]
    );
    res.json({ success: true, userId: result.rows[0].id });
  } catch (err) {
    console.error("Registration failed:", err);
    res.status(500).json({ success: false, error: "Registration error" });
  }
});
