
const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const app = express();

const jwt = require("jsonwebtoken");




function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(403).json({ error: "No token provided" });
  
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) return res.status(403).json({ error: "Malformed token" });
  
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) return res.status(401).json({ error: "Invalid token" });
      req.userId = decoded.id;
      req.userRole = decoded.role;
      req.user = decoded; // attach user object if needed
      next();
    });
  }
  
const db = new sqlite3.Database("../coffee_shop.db", (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
    return;
  }
  console.log("Connected to SQLite database.");
});


// Server-side code
app.delete("/admin/drop-tables", verifyToken, (req, res) => {
    const { tableName } = req.body;

    if (!tableName) {
        return res.status(400).json({ error: "Table name required." });
    }

    // A whitelist to prevent dropping arbitrary tables
    const allowedTables = ["tables", "orders", "order_items", "menu_items", "menu_categories", "users"];
    if (!allowedTables.includes(tableName)) {
        return res.status(403).json({ error: "Unauthorized table name." });
    }

    // Execute the DROP TABLE statement
    db.run(`DROP TABLE IF EXISTS ${tableName}`, function (err) {
        if (err) {
            console.error("Error dropping table:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: `Table '${tableName}' dropped successfully.` });
    });
});


