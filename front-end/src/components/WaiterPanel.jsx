import React, { useState, useEffect } from "react";
import API from "../api";
import Orders from "./Waiter/Orders";

export default function WaiterPanel() {
  const [categories, setCategories] = useState([]);
  const [menu, setMenu] = useState([]);
  const [tableId, setTableId] = useState("");
  const [cart, setCart] = useState([]);
  const [variable, setVariable] = useState(1);
  const [waiterOrders, setWaiterOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null); // 🔹 currently editing order

  // Fetch categories and products
  useEffect(() => {
    fetchWaiterOrders();
    Promise.all([API.get("/categories"), API.get("/menu"), API.get("/waiter/orders") ])
      .then(([catRes, menuRes, ordersRes]) => {
        setCategories(catRes.data);
        setMenu(menuRes.data);
        setWaiterOrders(ordersRes.data);
      })
      .catch(err => {
        console.error("Fetch failed:", err.response?.data || err.message);
      });
  }, []);

  const fetchWaiterOrders = async () => {
    try {
      const res = await API.get("/waiter/orders");
      setWaiterOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err.response?.data || err.message);
    }
  };

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
  fetchWaiterOrders();
};


  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="px-10 py-10 flex justify-between">
      {/* Menu & Cart */}
      <div style={{ width: "60%" }}>
        <h2>Waiter Panel</h2>
        <div className="p-5 flex flex-wrap">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 shadow-lg rounded-lg w-30 ml-5 flex flex-col justify-center bg-white cursor-pointer"
              onClick={() => setVariable(cat.id)}
            >
              <img src={cat.url} alt={cat.name} />
              <h3>{cat.name}</h3>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-around">
          {menu
            .filter((item) => item.category_id === variable)
            .map((item) => (
              <div
                key={item.id}
                className="mt-10 mr-10 w-50 flex flex-col items-center justify-center shadow-lg p-10 rounded-lg bg-white"
              >
                <img src={item.url} alt={item.name} />
                <span>{item.name}</span>
                <span>${item.price.toFixed(2)}</span>
                <button onClick={() => addToCart(item)}>Add</button>
              </div>
            ))}
        </div>
      </div>

      {/* Cart */}
      <div style={{ width: "30%" }}>
        <h3>Cart</h3>
        <input
          placeholder="Table Number"
          value={tableId}
          onChange={(e) => setTableId(e.target.value)}
        />
        <ul>
          {cart.map((item) => (
            <li key={item.id} className="bg-white">
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

      <Orders waiterOrders={waiterOrders} fetchWaiterOrders={fetchWaiterOrders} />   
      
       </div>
  );
}
