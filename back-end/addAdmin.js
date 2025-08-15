// addAdmin.js
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

// 1️⃣ Define admin credentials
const username = "admin";
const name = "Administrator";
const password = "mypassword"; // change to your desired password
const role = "admin";

// 2️⃣ Hash the password
const hashed = bcrypt.hashSync(password, 8);

// 3️⃣ Connect to your SQLite database
const db = new sqlite3.Database("./coffee_shop.db", (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
    return;
  }
  console.log("Connected to SQLite database.");
});

// 4️⃣ Insert admin user
const query = `INSERT INTO users (name, username, password, role)
               VALUES (?, ?, ?, ?)`;

db.run(query, [name, username, hashed, role], function(err) {
  if (err) {
    console.error("Error inserting admin user:", err.message);
  } else {
    console.log(`Admin user added with ID ${this.lastID}`);
  }

  // 5️⃣ Close the database
  db.close((err) => {
    if (err) console.error(err.message);
    else console.log("Database connection closed.");
  });
});
