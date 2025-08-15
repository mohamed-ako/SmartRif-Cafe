const sqlite3 = require("sqlite3").verbose();

// Connect to database
const db = new sqlite3.Database("./coffee_shop.db", (err) => {
  if (err) return console.error(err.message);
  console.log("Connected to SQLite database.");
});
// Insert default categories and items if not present
db.serialize(() => {
    // Default categories
    const categories = ["Appetizers", "Main Courses", "Desserts"];
    categories.forEach((name) => {
      db.run(
        "INSERT OR IGNORE INTO menu_categories (name) VALUES (?)",
        [name]
      );
    });
  
    // Default items
    const items = [
      { name: "Bruschetta", price: 8.99, category: "Appetizers" },
      { name: "Caprese Salad", price: 10.99, category: "Appetizers" },
      { name: "Fried Calamari", price: 12.5, category: "Appetizers" },
      { name: "Chicken Parmesan", price: 18.5, category: "Main Courses" },
      { name: "Pasta Carbonara", price: 16.75, category: "Main Courses" },
      { name: "Grilled Salmon", price: 22.0, category: "Main Courses" },
      { name: "Tiramisu", price: 7.0, category: "Desserts" },
      { name: "Cheesecake", price: 6.5, category: "Desserts" },
      { name: "Chocolate Lava Cake", price: 8.0, category: "Desserts" },
    ];
  
    items.forEach((item) => {
      // Get category id first
      db.get(
        "SELECT id FROM menu_categories WHERE name = ?",
        [item.category],
        (err, row) => {
          if (!err && row) {
            db.run(
              "INSERT OR IGNORE INTO menu_items (name, price, category_id) VALUES (?, ?, ?)",
              [item.name, item.price, row.id]
            );
          }
        }
      );
    });
  });
  