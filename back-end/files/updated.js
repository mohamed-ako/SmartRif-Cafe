const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Connect to SQLite
const db = new sqlite3.Database("./coffee_shop.db", (err) => {
  if (err) console.error("Error opening database:", err.message);
  else console.log("Connected to SQLite database.");
});

// 1️⃣ Add `url` column if not exists
db.serialize(() => {
  db.run(`ALTER TABLE menu_categories ADD COLUMN url TEXT`, (err) => {
    if (err && !err.message.includes("duplicate column")) console.error(err.message);
  });

  db.run(`ALTER TABLE menu_items ADD COLUMN url TEXT`, (err) => {
    if (err && !err.message.includes("duplicate column")) console.error(err.message);
  });
});

// 2️⃣ Update all existing rows with a default URL if null
db.serialize(() => {
//   db.run(`UPDATE menu_categories SET url = '/img/sr.jpg' WHERE url IS NULL`);
  db.run(`UPDATE menu_categories SET url = '/img/sr.jpg' WHERE url = "https://example.com/default-category.png"`);

//   db.run(`UPDATE menu_items SET url = '/img/sr.jpg' WHERE url IS NULL`);
db.run(`UPDATE menu_items SET url = '/img/sr.jpg' WHERE url = "https://example.com/default-item.png"`);

});

// 3️⃣ Express routes to update URL for a single item or category

// Update category URL
app.put("/categories/:id/url", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL required" });

  db.run(
    "UPDATE menu_categories SET url=? WHERE id=?",
    [url, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

// Update menu item URL
app.put("/menu/:id/url", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL required" });

  db.run(
    "UPDATE menu_items SET url=? WHERE id=?",
    [url, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

app.listen(5000, () => console.log("Server running on port 5000"));
