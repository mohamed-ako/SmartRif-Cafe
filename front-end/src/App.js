import React, { useState } from "react";
import Login from "./components/Login";
import WaiterPanel from "./components/WaiterPanel";
import KitchenPanel from "./components/KitchenPanel";
import CashierPanel from "./components/CashierPanel";
import AdminPanel from "./components/AdminPanel";
import NavBar from "./components/NavBar";
import './styles.css';


export default function App() {
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  if (!role) {
    return (<>
    <Login onLogin={(r) => setRole(r)} />
    </>);
  }

  if (role === "waiter") return (<><NavBar/><WaiterPanel /></>);
  if (role === "kitchen") return (<><NavBar/><KitchenPanel /></>);
  if (role === "cashier") return (<><NavBar/><CashierPanel /></>);
  if (role === "admin") return (<><NavBar/><AdminPanel /></>);

  return <div>Role not recognized</div>;
}
