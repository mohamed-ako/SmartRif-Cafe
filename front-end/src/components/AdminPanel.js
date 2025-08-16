import React, { useEffect, useState } from "react";
import API from "../api";
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
  const [addItemS, setAddItemS] = useState(false);
  const [showItemS, setShowItemS] = useState(false);
  const [addUserS, setAddUserS] = useState(false);
  const [showUserS, setShowUserS] = useState(false);
  const [showCategoryS, setShowCategoryS] = useState(false);
  const [addCategoryS, setAddCategoryS] = useState(false);


  const [newCategory, setNewCategory] = useState("");

  const [stats, setStats] = useState([]);
  const [totals, setTotals] = useState({});
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  const [newItem, setNewItem] = useState({ name: "", price: "", category_id: "" });
  const [newUser, setNewUser] = useState({ name: "", username: "", password: "", role: "waiter" });

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
        API.get("/admin/profits")
      ]);
  
      console.log("Menu:", m.data);
      console.log("Users:", u.data);
      console.log("Categories:", c.data);
  
      setTotals(t.data);
      setMenu(Array.isArray(m.data) ? m.data : []);
      setUsers(Array.isArray(u.data) ? u.data : []);
      setCategories(Array.isArray(c.data) ? c.data : []);
      setStats(Array.isArray(s.data) ? s.data : []);
    } catch (err) {
      console.error("Error fetching data:", err.response?.status, err.response?.data);
    }
  };

  const addMenuItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.category_id) return alert("Fill all fields");
    await API.post("/menu", newItem);
    setNewItem({ name: "", price: "", category_id: "" });
    fetchData();
  };

  const deleteMenuItem = async (id) => {
    await API.delete(`/menu/${id}`);
    fetchData();
  };

  const addUser = async () => {
    if (!newUser.name || !newUser.username || !newUser.password) return alert("Fill all fields");
    await API.post("/register", newUser);
    setNewUser({ name: "", username: "", password: "", role: "waiter" });
    fetchData();
  };

  const deleteUser = async (id) => {
    await API.delete(`/users/${id}`);
    fetchData();
  };

  const chartData = {
    labels: stats.map(s => s.date),
    datasets: [
      {
        label: "Daily Profit ($)",
        data: stats.map(s => s.total),
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

  const addCategory = async () => {
    if (!newCategory) return alert("Category name required");
    try {
      await API.post("/categories", { name: newCategory });
      setNewCategory("");
      fetchData(); // refresh categories list
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };
  
  const deleteCategory = async (id) => {
    try {
      await API.delete(`/categories/${id}`);
      fetchData(); // refresh categories list
    } catch (err) {
      console.error(err.response?.data || err);
    }
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

      {/* MENU MANAGEMENT */}
      <h3>Menu Management</h3>
      <button onClick={() => setAddItemS(!addItemS)}>
        {addItemS ? "Hide Add Item Form" : "Add Item"}
      </button>
      <button onClick={() => setShowItemS(!showItemS)}>
        {showItemS ? "Hide Items List" : "Show Items List"}
      </button>



{/* ADD OR EDIT ITEM FORM */}
{(addItemS || editingItem) && (
  <div className="form-group">
    <input
      placeholder="Item name"
      value={editingItem ? editingItem.name : newItem.name}
      onChange={(e) =>
        editingItem
          ? setEditingItem({ ...editingItem, name: e.target.value })
          : setNewItem({ ...newItem, name: e.target.value })
      }
    />
    <input
      placeholder="Price"
      type="number"
      value={editingItem ? editingItem.price : newItem.price}
      onChange={(e) =>
        editingItem
          ? setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })
          : setNewItem({ ...newItem, price: parseFloat(e.target.value) })
      }
    />
    <input
      placeholder="Image URL"
      value={editingItem ? editingItem.url : newItem.url}
      onChange={(e) =>
        editingItem
          ? setEditingItem({ ...editingItem, url: e.target.value })
          : setNewItem({ ...newItem, url: e.target.value })
      }
    />
    <select
      value={editingItem ? editingItem.category_id : newItem.category_id || ""}
      onChange={(e) =>
        editingItem
          ? setEditingItem({ ...editingItem, category_id: Number(e.target.value) })
          : setNewItem({ ...newItem, category_id: Number(e.target.value) })
      }
    >
      <option value="" disabled>Select category</option>
      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
    </select>

    {editingItem ? (
      <button onClick={async () => {
        await API.put(`/menu/${editingItem.id}`, editingItem);
        setEditingItem(null);
        fetchData();
      }}>Update Item</button>
    ) : (
      <button onClick={addMenuItem}>Add Item</button>
    )}
  </div>
)}


{showItemS && (
  <ul className="admin-list">
    {menu.map(item => (
      <li key={item.id}>
        {item.name} - ${item.price} ({item.category || "No Category"})
        <button onClick={() => deleteMenuItem(item.id)}>Delete</button>
        <button onClick={() => setEditingItem(item)}>Edit</button>
      </li>
    ))}
  </ul>
)}

      <hr />

      {/* USER MANAGEMENT */}
      <h3>User Management</h3>
      <button onClick={() => setAddUserS(!addUserS)}>
        {addUserS ? "Hide Add User Form" : "Add User"}
      </button>
      <button onClick={() => setShowUserS(!showUserS)}>
        {showUserS ? "Hide Users List" : "Show Users List"}
      </button>


      {addUserS && (
        <div className="form-group">
          <input
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <input
            placeholder="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          />
          <input
            placeholder="Password"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option value="waiter">Waiter</option>
            <option value="kitchen">Kitchen</option>
            <option value="cashier">Cashier</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={addUser}>Add User</button>
        </div>
      )}

      {showUserS && (
        <ul className="admin-list">
          {users.map((u) => (
            <li key={u.id}>
              {u.name} ({u.username}) - {u.role}{" "}
              <button onClick={() => deleteUser(u.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
      <hr />
<h3>Category Management</h3>
<button onClick={() => setAddCategoryS(!addCategoryS)}>
        {addCategoryS ? "Hide Add Category Form" : "Add Category"}
      </button>

<button onClick={() => setShowCategoryS(!showCategoryS)}>
        {showCategoryS ? "Hide Categoris List" : "Show Categoris List"}
      </button>
{/* ADD OR EDIT CATEGORY FORM */}
{(addCategoryS || editingCategory) && (
  <div className="form-group">
    <input
      placeholder="Category name"
      value={editingCategory ? editingCategory.name : newCategory}
      onChange={(e) =>
        editingCategory
          ? setEditingCategory({ ...editingCategory, name: e.target.value })
          : setNewCategory(e.target.value)
      }
    />
    {editingCategory ? (
      <button onClick={async () => {
        await API.put(`/categories/${editingCategory.id}`, editingCategory);
        setEditingCategory(null);
        fetchData();
      }}>Update Category</button>
    ) : (
      <button onClick={addCategory}>Add Category</button>
    )}
  </div>
)}

{showCategoryS && (
  <ul className="admin-list">
    {categories.map(cat => (
      <li key={cat.id}>
        {cat.name} 
        <button onClick={() => deleteCategory(cat.id)}>Delete</button>
        <button onClick={() => setEditingCategory(cat)}>Edit</button>
      </li>
    ))}
  </ul>
)}
    </div>
    
  );
}
