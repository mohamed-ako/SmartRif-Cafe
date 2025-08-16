import { useState } from "react";
import API from "../../api";

export default function Users({ data, fetchData }) {
  const [showUserS, setShowUserS] = useState(false);
  const [addUserS, setAddUserS] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", username: "", password: "", role: "waiter" });

  const users = data || [];

  const addUser = async () => {
    if (!newUser.name || !newUser.username || !newUser.password) return alert("Fill all fields");
    try {
      await API.post("/register", newUser);
      setNewUser({ name: "", username: "", password: "", role: "waiter" });
      fetchData();
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  const deleteUser = async (id) => {
    try {
      await API.delete(`/users/${id}`);
      fetchData();
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  const updateUser = async () => {
    if (!editingUser.name || !editingUser.username) return alert("Fill all fields");
    try {
      await API.put(`/users/${editingUser.id}`, editingUser);
      setEditingUser(null);
      fetchData();
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  return (
    <>
      <h3>User Management</h3>
      <button onClick={() => setAddUserS(!addUserS)}>
        {addUserS ? "Hide Add User Form" : "Add User"}
      </button>
      <button onClick={() => setShowUserS(!showUserS)}>
        {showUserS ? "Hide Users List" : "Show Users List"}
      </button>

      {(addUserS || editingUser) && (
        <div className="form-group">
          <input
            placeholder="Name"
            value={editingUser ? editingUser.name : newUser.name}
            onChange={(e) =>
              editingUser
                ? setEditingUser({ ...editingUser, name: e.target.value })
                : setNewUser({ ...newUser, name: e.target.value })
            }
          />
          <input
            placeholder="Username"
            value={editingUser ? editingUser.username : newUser.username}
            onChange={(e) =>
              editingUser
                ? setEditingUser({ ...editingUser, username: e.target.value })
                : setNewUser({ ...newUser, username: e.target.value })
            }
          />
          {!editingUser && (
            <input
              placeholder="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
          )}
          <select
            value={editingUser ? editingUser.role : newUser.role}
            onChange={(e) =>
              editingUser
                ? setEditingUser({ ...editingUser, role: e.target.value })
                : setNewUser({ ...newUser, role: e.target.value })
            }
          >
            <option value="waiter">Waiter</option>
            <option value="kitchen">Kitchen</option>
            <option value="cashier">Cashier</option>
            <option value="admin">Admin</option>
          </select>

          {editingUser ? (
            <button onClick={updateUser}>Update User</button>
          ) : (
            <button onClick={addUser}>Add User</button>
          )}
        </div>
      )}

      {showUserS && (
        <ul className="admin-list">
          {users.map((u) => (
            <li key={u.id}>
              {u.name} ({u.username}) - {u.role}{" "}
              <button onClick={() => deleteUser(u.id)}>Delete</button>
              <button onClick={() => setEditingUser(u)}>Edit</button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
