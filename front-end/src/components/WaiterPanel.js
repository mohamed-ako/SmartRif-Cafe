import React, { useState, useEffect } from "react";
import API from "../api";

export default function WaiterPanel() {
  const [categories, setCategories] = useState([]);
  const [menu, setMenu] = useState([]);
  const [tableId, setTableId] = useState("");
  const [cart, setCart] = useState([]);

  // Fetch categories and products
  useEffect(() => {
    Promise.all([API.get("/categories"), API.get("/menu")]).then(
      ([catRes, menuRes]) => {
        setCategories(catRes.data);
        setMenu(menuRes.data);
      }
    );
  }, []);

  // Add item to cart
  const addToCart = (item) => {
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      setCart(
        cart.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1, note: "" }]);
    }
  };

  // Update quantity
  const updateQuantity = (id, qty) => {
    setCart(cart.map((c) => (c.id === id ? { ...c, quantity: qty } : c)));
  };

  // Send order
  const sendOrder = async () => {
    if (!tableId || cart.length === 0) {
      alert("Select table and items");
      return;
    }
    const items = cart.map((c) => ({
      item_id: c.id,
      quantity: c.quantity,
      note: c.note,
    }));
    await API.post("/orders", { table_id: tableId, items });
    setCart([]);
    alert("Order sent!");
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="panel">
      <h2>Waiter Panel</h2>
      <input
        placeholder="Table ID"
        value={tableId}
        onChange={(e) => setTableId(e.target.value)}
      />

      {categories.map((cat) => (
        <div key={cat.id}>
          <h3>{cat.name}</h3>
          <div className="product-grid">
            {menu
              .filter((item) => item.category_id === cat.id)
              .map((item) => (
                <div className="product-card" key={item.id}>
                  <span>{item.name}</span>
                  <span>${item.price.toFixed(2)}</span>
                  <button onClick={() => addToCart(item)}>Add</button>
                </div>
              ))}
          </div>
        </div>
      ))}

      <h3>Cart</h3>
      <ul>
        {cart.map((item) => (
          <li className="cart-item" key={item.id}>
            {item.name} (${item.price}) x
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) =>
                updateQuantity(item.id, parseInt(e.target.value))
              }
              style={{ width: "50px", margin: "0 5px" }}
            />
            = ${(item.price * item.quantity).toFixed(2)}
          </li>
        ))}
      </ul>
      <h4>Total: ${totalPrice.toFixed(2)}</h4>
      <button onClick={sendOrder}>Send Order</button>
    </div>
  );
}
