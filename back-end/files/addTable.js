
// addAdmin.js

const sqlite3 = require("sqlite3").verbose();
const express = require("express");

const table_number = 205;
const  statu = "free";


const db = new sqlite3.Database("../coffee_shop.db", (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
    return;
  }
  console.log("Connected to SQLite database.");
});


// 4️⃣ Insert admin user
const query = `INSERT INTO tables (table_number, status) 
                VALUES (?, ?);`;

db.run(query, [table_number, statu], function(err) {
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

