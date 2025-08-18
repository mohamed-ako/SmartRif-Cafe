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
  const [choosen, setChoosen] = useState(1);
  const [stats, setStats] = useState([]);
  const [totals, setTotals] = useState({});
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [usersOrders, setUsersOrders] = useState()
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [t, m, u, c, s, userOrders] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/menu"),
        API.get("/users"),
        API.get("/categories"),
        API.get("/admin/profits"),
        API.get("/admin/user-orders")
      ]);

      setTotals(t.data);
      setMenu(Array.isArray(m.data) ? m.data : []);
      setUsers(Array.isArray(u.data) ? u.data : []);
      setCategories(Array.isArray(c.data) ? c.data : []);
      setStats(Array.isArray(s.data) ? s.data : []);
      setUsersOrders(Array.isArray(userOrders.data) ? userOrders.data : []);
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

  return (
    <div className="admin-panel">
          <div 
        className={`burger-menu ${open ? "active" : ""}`} 
        onClick={() => setOpen(!open)}
      >
        <div></div>
        <div></div>
        <div></div>
      </div>

      {/* Sidebar / Nav */}
      <ul className={`menu-drawer ${open ? "open" : ""}`}>
        <li onClick={() => setChoosen(1)}>Dashboard</li>
        <li onClick={() => setChoosen(2)}>User Manager</li>
        <li onClick={() => setChoosen(3)}>User Orders</li>
        <li onClick={() => setChoosen(4)}>Items Manager</li>
        <li onClick={() => setChoosen(5)}>Categories Manager</li>

      </ul>

      {/* Content */}
      {choosen === 1 && (
        <div className="panel ">
          <h2>Admin Dashboard</h2>
          <div className="dashboard-stats">
            <div>Orders Today: {totals.ordersToday}</div>
            <div>Sales Today: ${totals.salesToday}</div>
            <div>Sales Week: ${totals.salesWeek}</div>
            <div>Total Sales: ${totals.totalSales}</div>
            <div>Total Users: {totals.userCount}</div>
          </div>

          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {choosen === 2 && (
        <Users data={users} fetchData={fetchData} />
      )}

      {choosen === 4 && (
        <MenuItems data={menu} categories={categories} fetchData={fetchData} />
      )}

      {choosen === 5 && (
        <Categoris data={categories} fetchData={fetchData} />
      )}
      
        {choosen === 3 && (
          <div className="panel">
            <h2>User Orders by Date</h2>
            {usersOrders.map(user => (
              <div key={user.user_id} className="user-orders">
                <h3>{user.user_name}</h3>
                {Object.values(user.dates).map(d => (
                  <div key={d.date} className="date-block">
                    <strong>{d.date}</strong> - Total: ${d.total}
                    <ul>
                      {d.orders.map(o => (
                        <li key={o.order_id}>Order #{o.order_id}: ${o.total}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        
    </div>
  );
}
