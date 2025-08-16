import React, { useEffect, useState } from "react";
import API from "../api";
import Categoris from "./Admin/Categoris";
import Users from "./Admin/Users";
import MenuItems from "./Admin/MenuItems";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminPanel() {
  const [stats, setStats] = useState([]);
  const [totals, setTotals] = useState({});
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [t, m, u, c, s] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/menu"),
        API.get("/users"),
        API.get("/categories"),
        API.get("/admin/profits"),
      ]);

      setTotals(t.data);
      setMenu(Array.isArray(m.data) ? m.data : []);
      setUsers(Array.isArray(u.data) ? u.data : []);
      setCategories(Array.isArray(c.data) ? c.data : []);
      setStats(Array.isArray(s.data) ? s.data : []);
    } catch (err) {
      console.error("Error fetching data:", err.response?.status, err.response?.data);
    }
  };

  const chartData = {
    labels: stats.map((s) => s.date),
    datasets: [
      {
        label: "Daily Profit ($)",
        data: stats.map((s) => s.total),
        fill: true,
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        borderColor: "rgba(76, 175, 80, 1)",
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Profit in Last 30 Days" },
    },
  };

  // Optional: dummy addToCart
  const addToCart = (item) => {
    console.log("Add to cart:", item);
  };

  return (
    <div className="panel admin-panel">
      <h2>Admin Dashboard</h2>

      {/* STAT CARDS */}
      <div className="dashboard-stats">
        <div>Orders Today: {totals.ordersToday}</div>
        <div>Sales Today: ${totals.salesToday}</div>
        <div>Sales Week: ${totals.salesWeek}</div>
        <div>Total Sales: ${totals.totalSales}</div>
        <div>Total Users: {totals.userCount}</div>
      </div>

      {/* CHART */}
      <div className="chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>

      <hr />

      {/* PASS fetchData and categories as props */}
      <Categoris data={categories} fetchData={fetchData} />
      <MenuItems data={menu} categories={categories} fetchData={fetchData} addToCart={addToCart} />
      <Users data={users} fetchData={fetchData} />
    </div>
  );
}
