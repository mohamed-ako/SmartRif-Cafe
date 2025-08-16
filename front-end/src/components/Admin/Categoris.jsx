import { useState } from "react";
import API from "../../api"; // make sure your API is imported

export default function Categories({ data, fetchData }) {
  const [showCategoryS, setShowCategoryS] = useState(false);
  const [addCategoryS, setAddCategoryS] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState("");

  const categories = data || [];

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
    <>
      <h3>Category Management</h3>
      <button onClick={() => setAddCategoryS(!addCategoryS)}>
        {addCategoryS ? "Hide Add Category Form" : "Add Category"}
      </button>

      <button onClick={() => setShowCategoryS(!showCategoryS)}>
        {showCategoryS ? "Hide Categories List" : "Show Categories List"}
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
            <button
              onClick={async () => {
                await API.put(`/categories/${editingCategory.id}`, editingCategory);
                setEditingCategory(null);
                fetchData();
              }}
            >
              Update Category
            </button>
          ) : (
            <button onClick={addCategory}>Add Category</button>
          )}
        </div>
      )}

      {showCategoryS && (
        <ul className="admin-list flex flex-wrap">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="p-5 shadow-lg rounded-lg w-40 m-2 flex flex-col items-center bg-white"
            >
              {cat.url && <img src={cat.url} alt={cat.name} className="w-full h-20 object-cover mb-2" />}
              <h3>{cat.name}</h3>
              <div className="mt-2 flex gap-2">
                <button onClick={() => deleteCategory(cat.id)}>Delete</button>
                <button onClick={() => setEditingCategory(cat)}>Edit</button>
              </div>

            </li>
          ))}
        </ul>
      )}
    </>
  );
}
