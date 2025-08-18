import { useState } from "react";
import API from "../../api";

export default function MenuItems({ data, categories, fetchData }) {
  const [showItemS, setShowItemS] = useState(true);
  const [addItemS, setAddItemS] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(1);

  const [newItem, setNewItem] = useState({ name: "", price: "", category_id: "", url: "" });

  const menu = data || [];

  const addMenuItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.category_id) return alert("Fill all fields");
    try {
      await API.post("/menu", newItem);
      setNewItem({ name: "", price: "", category_id: "", url: "" });
      fetchData();
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  const deleteMenuItem = async (id) => {
    try {
      await API.delete(`/menu/${id}`);
      fetchData();
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  const updateMenuItem = async () => {
    try {
      await API.put(`/menu/${editingItem.id}`, editingItem);
      setEditingItem(null);
      fetchData();
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  return (
    <>
      <h3>Menu Items Management</h3>
      <button onClick={() => setAddItemS(!addItemS)}>
        {addItemS ? "Hide Add Item Form" : "Add Item"}
      </button>
      {/* <button onClick={() => setShowItemS(!showItemS)}>
        {showItemS ? "Hide Items List" : "Show Items List"}
      </button> */}

      {/* Add/Edit Item Form */}
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
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {editingItem ? (
            <button onClick={updateMenuItem}>Update Item</button>
          ) : (
            <button onClick={addMenuItem}>Add Item</button>
          )}
        </div>
      )}

      {/* Categories as tabs */}
      {showItemS && (
        <>
          <div className="flex flex-wrap gap-4 my-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`p-3 shadow-lg rounded-lg cursor-pointer ${
                  selectedCategory === cat.id ? "bg-blue-200" : "bg-white"
                }`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.url && <img src={cat.url} alt={cat.name} className="w-24 h-24 object-cover mb-2" />}
                <h3>{cat.name}</h3>
              </div>
            ))}
          </div>

          {/* Menu items filtered by selected category */}
          <ul className="flex flex-wrap gap-6">
            {menu
              .filter((item) => item.category_id === selectedCategory)
              .map((item) => (
                <li
                  key={item.id}
                  className="p-4 shadow-lg rounded-lg w-48 flex flex-col items-center bg-white"
                >
                  {item.url && <img src={item.url} alt={item.name} className="w-full h-24 object-cover mb-2" />}
                  <span>{item.name}</span>
                  <span>${item.price.toFixed(2)}</span>

                  <div className="mt-2 flex gap-2">
                    <button onClick={() => deleteMenuItem(item.id)}>Delete</button>
                    <button onClick={() => setEditingItem(item)}>Edit</button>
                  </div>
                </li>
              ))}
          </ul>
        </>
      )}
    </>
  );
}
