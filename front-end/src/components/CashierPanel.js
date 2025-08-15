import React, { useEffect, useState } from "react";
import API from "../api";

export default function CashierPanel() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = () => {
    API.get("/orders").then((res) => setOrders(res.data));
  };

  const closeOrder = async (id) => {
    await API.put(`/orders/${id}/close`);
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
<div className="panel">
<h2>Cashier Panel</h2>
<ul>
      {orders.map((o) => (
        <li className="cart-item" key={o.id}>
          Order #{o.id} - ${o.total} - {o.status}
          {o.status !== "closed" && <button onClick={() => closeOrder(o.id)}>Close</button>}
          </li>
      ))}
        </ul>
    </div>
  );
}
