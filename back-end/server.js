const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const SECRET_KEY = process.env.SECRET_KEY || "supersecretkey"; // Use env var in prod

app.use(cors({ origin: "http://localhost:3000" }));
app.use(bodyParser.json());

// Connect to SQLite
const db = new sqlite3.Database("./coffee_shop.db", (err) => {
  if (err) console.error("Error opening database:", err.message);
  else {
    console.log("Connected to SQLite database.");
    db.run("PRAGMA foreign_keys = ON");
  }
});

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_number TEXT NOT NULL,
      status TEXT DEFAULT 'free'
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS menu_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      url TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER,
      price REAL NOT NULL,
      url TEXT,
      FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE SET NULL
    )
  `);
  
db.run(` CREATE TABLE IF NOT EXISTS orders (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id INTEGER, waiter_id INTEGER,
     status TEXT DEFAULT 'pending',
      total REAL DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE,
       FOREIGN KEY (waiter_id) REFERENCES users(id) ON DELETE SET NULL )` 
      );

  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      item_id INTEGER,
      quantity INTEGER,
      note TEXT,
      status TEXT DEFAULT 'pending',
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES menu_items(id) ON DELETE CASCADE
    )
  `);
});

// Middleware: Verify JWT
// function verifyToken(req, res, next) {
//   const authHeader = req.headers["authorization"];
//   if (!authHeader) return res.status(403).json({ error: "No token provided" });

//   const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
//   if (!token) return res.status(403).json({ error: "Malformed token" });

//   jwt.verify(token, SECRET_KEY, (err, decoded) => {
//     if (err) return res.status(401).json({ error: "Invalid token" });
//     req.userId = decoded.id;
//     req.userRole = decoded.role;
//     next();
//   });
// }

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


function requireAdmin(req, res, next) {
  if (req.userRole !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
}

// Create initial admin if none exists
db.get("SELECT COUNT(*) as count FROM users WHERE role='admin'", (err, row) => {
  if (!err && row.count === 0) {
    const hashed = bcrypt.hashSync("admin123", 10);
    db.run("INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)",
      ["Administrator", "admin", hashed, "admin"]);
    console.log("Default admin created: username=admin, password=admin123");
  }
});

// Register
app.post("/register", verifyToken, requireAdmin, (req, res) => {
  const { name, username, password, role } = req.body;
  if (!name || !username || !password || !role)
    return res.status(400).json({ error: "Missing fields" });

  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run(
    "INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)",
    [name, username, hashedPassword, role],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, username, role });
    }
  );
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: "User not found" });

    const validPass = bcrypt.compareSync(password, user.password);
    if (!validPass) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: "1d" });
    res.json({ token, role: user.role, name: user.name });
  });
});

// List users (Admin only)
app.get("/users", verifyToken, requireAdmin, (req, res) => {
  db.all("SELECT id, name, username, role FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Delete user (Admin only)
app.delete("/users/:id", verifyToken, requireAdmin, (req, res) => {
  db.run("DELETE FROM users WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, deleted: this.changes });
  });
});

// User orders summary (Admin only)
app.get("/admin/user-orders", verifyToken, requireAdmin, (req, res) => {
  const sql = `
    SELECT 
      u.id AS user_id,
      u.name AS user_name,
      o.id AS order_id,
      DATE(o.created_at) AS date,
      o.total AS order_total
    FROM users u
    LEFT JOIN orders o ON u.id = o.waiter_id
    ORDER BY date DESC, u.name
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Group by user & date
    const result = {};
    rows.forEach(row => {
      if (!result[row.user_id]) {
        result[row.user_id] = {
          user_id: row.user_id,
          user_name: row.user_name,
          dates: {}
        };
      }

      if (row.date) {
        if (!result[row.user_id].dates[row.date]) {
          result[row.user_id].dates[row.date] = {
            date: row.date,
            orders: [],
            total: 0
          };
        }

        result[row.user_id].dates[row.date].orders.push({
          order_id: row.order_id,
          total: row.order_total
        });

        result[row.user_id].dates[row.date].total += row.order_total;
      }
    });

    res.json(Object.values(result));
  });
});


// Categories CRUD
app.post("/categories", verifyToken, requireAdmin, (req, res) => {
  const { name, url } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });

  db.run("INSERT INTO menu_categories (name, url) VALUES (?, ?)", [name, url || null], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, url });
  });
});


app.put("/categories/:id", verifyToken, requireAdmin, (req, res) => {
  const { name, url } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });

  db.run(
    "UPDATE menu_categories SET name=?, url=? WHERE id=?",
    [name, url || null, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Category not found" });
      res.json({ updated: this.changes });
    }
  );
});

app.delete("/categories/:id", verifyToken, requireAdmin, (req, res) => {
  db.run("DELETE FROM menu_categories WHERE id=?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

app.get("/categories", verifyToken, (req, res) => {
  db.all("SELECT id, name, url FROM menu_categories ORDER BY name", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


// Menu list
// app.get("/menu", verifyToken, (req, res) => {
//   db.all(`
//     SELECT mi.id, mi.name, mi.price, mi.category_id, mc.name AS category
//     FROM menu_items mi
//     LEFT JOIN menu_categories mc ON mi.category_id = mc.id
//     ORDER BY mi.name
//   `, [], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(rows);
//   });
// });

// CREATE menu item
app.post("/menu", verifyToken, requireAdmin, (req, res) => {
  const { name, price, category_id, url } = req.body;
  if (!name || !price) return res.status(400).json({ error: "Name and price required" });

  db.run(
    "INSERT INTO menu_items (name, price, category_id, url) VALUES (?, ?, ?, ?)",
    [name, price, category_id || null, url || null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, price, category_id, url });
    }
  );
});

// READ all menu items
app.get("/menu", verifyToken, (req, res) => {
  db.all(`
    SELECT mi.id, mi.name, mi.price, mi.category_id, mi.url, mc.name AS category
    FROM menu_items mi
    LEFT JOIN menu_categories mc ON mi.category_id = mc.id
    ORDER BY mi.name
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// UPDATE menu item
app.put("/menu/:id", verifyToken, requireAdmin, (req, res) => {
  const { name, price, category_id, url } = req.body;
  if (!name || !price) return res.status(400).json({ error: "Name and price required" });

  db.run(
    "UPDATE menu_items SET name=?, price=?, category_id=?, url=? WHERE id=?",
    [name, price, category_id || null, url || null, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Menu item not found" });
      res.json({ updated: this.changes });
    }
  );
});
// DELETE menu item
app.delete("/menu/:id", verifyToken, requireAdmin, (req, res) => {
  db.run("DELETE FROM menu_items WHERE id=?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});


// Orders
app.post("/orders", verifyToken, (req, res) => {
  const { table_id, items } = req.body;

  if (!table_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Invalid order format" });
  }

  const waiterId = req.userId; // from verifyToken middleware
  if (!waiterId) {
    return res.status(403).json({ error: "Unauthorized waiter" });
  }

  const createdAt = new Date().toISOString();

  // Insert order first
  db.run(
    `INSERT INTO orders (table_id, created_at, total, waiter_id) VALUES (?, ?, ?, ?)`,
    [table_id, createdAt, 0, waiterId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const orderId = this.lastID;
      let total = 0;

      // Use a promise-based approach to handle all item insertions
      const itemPromises = items.map((it) => {
        return new Promise((resolve, reject) => {
          db.get(`SELECT price FROM menu_items WHERE id = ?`, [it.item_id], (err, row) => {
            if (err) return reject(err);

            const price = row?.price || 0;
            total += price * it.quantity;

            // Prepare and run the insert for each item
            db.run(
              `INSERT INTO order_items (order_id, item_id, quantity, note, price) VALUES (?, ?, ?, ?, ?)`,
              [orderId, it.item_id, it.quantity, it.note || "", price],
              function (err) {
                if (err) return reject(err);
                resolve();
              }
            );
          });
        });
      });

      Promise.all(itemPromises)
        .then(() => {
          // After all items are inserted and total is calculated, update the order
          db.run(`UPDATE orders SET total = ? WHERE id = ?`, [total, orderId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, order_id: orderId, total });
          });
        })
        .catch((err) => {
          // If any promise fails, return a 500 error
          console.error("Error processing order items:", err.message);
          res.status(500).json({ error: "Error processing order items: " + err.message });
        });
    }
  );
});

// Admin Stats
app.get("/admin/stats", verifyToken, requireAdmin, (req, res) => {
  const todaySql = `
    SELECT COUNT(*) AS ordersToday, IFNULL(SUM(total), 0) AS salesToday
    FROM orders WHERE DATE(created_at) = DATE('now', 'localtime')
  `;
  const totalSql = `SELECT IFNULL(SUM(total), 0) AS totalSales FROM orders`;
  const weekSql = `
    SELECT IFNULL(SUM(total), 0) AS salesWeek
    FROM orders WHERE DATE(created_at) >= DATE('now', '-6 days', 'localtime')
  `;
  const usersSql = `SELECT COUNT(*) AS userCount FROM users`;

  db.get(todaySql, (err, today) => {
    if (err) return res.status(500).json({ error: err.message });
    db.get(totalSql, (err, total) => {
      if (err) return res.status(500).json({ error: err.message });
      db.get(weekSql, (err, week) => {
        if (err) return res.status(500).json({ error: err.message });
        db.get(usersSql, (err, users) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({
            ordersToday: today.ordersToday,
            salesToday: today.salesToday,
            salesWeek: week.salesWeek,
            totalSales: total.totalSales,
            userCount: users.userCount
          });
        });
      });
    });
  });
});

app.get("/admin/profits", verifyToken, (req, res) => {
  // Optionally check if admin: if (req.userRole !== 'admin') return res.status(403).json({error:'Forbidden'});

  const sql = `
    SELECT DATE(created_at) AS date, IFNULL(SUM(total), 0) AS total
    FROM orders
    WHERE DATE(created_at) >= DATE('now', '-30 days', 'localtime')
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at)
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));
