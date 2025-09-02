import { useState } from "react";
import API from "../../api";

export default function Users({ data, fetchData }) {
  const [showUserS, setShowUserS] = useState(true);
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
      <div class="w-full flex justify-between px-10 mt-10 mb-5">
        
      <h3 className="flex"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>User Management</h3>
      <button onClick={() => setAddUserS(!addUserS)}>
        {addUserS ? "Hide Add User Form" : "Add User"}
      </button>
      {/* <button onClick={() => setShowUserS(!showUserS)}>
        {showUserS ? "Hide Users List" : "Show Users List"}
      </button> */}
      </div>
      <div class="hidden" id="popedituser">
       <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
       
        <div class="fixed inset-0 flex flex-col items-center justify-center">
        <div class="bg-white text-black p-6 rounded-2xl shadow-2xl">
          <span className="w-full flex justify-between"><h1>update user</h1><h1 className="font-bold cursor-pointer" onClick={()=> document.getElementById("popedituser").classList.toggle("hidden")}>X</h1></span>
          {(addUserS || editingUser) && (
        <div className="">
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
        </div>
        </div>
        </div>
      </div>
      <div className="flex">
          {showUserS && (
            <div className="w-full flex flex-wrap gap-10 pl-10">
             {users.map((u) => (  
        <div key={u.id} className="flex w-150 gap-2 p-5 items-center bg-white w-100 rounded-2xl">
          
          <div className="w-1/4">
            <img className="w-20 h-20 rounded-full object-cover" src="https://media.istockphoto.com/id/1389348844/photo/studio-shot-of-a-beautiful-young-woman-smiling-while-standing-against-a-grey-background.jpg?s=612x612&w=0&k=20&c=anRTfD_CkOxRdyFtvsiPopOluzKbhBNEQdh4okZImQc=" alt="" />
          </div>
          <div className="w-3/4">
            <h1>{u.name}</h1>
            <h2>{u.username}</h2>
            <h3>{u.role}</h3>
            <div className="w-full flex justify-end  gap-5"><span className="font-black cursor-pointer text-white p-3 bg-red-600 rounded-md" onClick={() => deleteUser(u.id)}>Delete</span> <span className="font-black cursor-pointer text-white p-3 bg-blue-600 rounded-md" onClick={() => {setEditingUser(u);
              document.getElementById("popedituser").classList.toggle("hidden");}
              }>Edit</span></div>
          </div>
          
        </div>
          ))}
        </div>
        )}
      </div>






      {/* <div className="">
      {showUserS && (
        <ul className="flex flex-col ">
          {users.map((u) => (
            <li key={u.id} className="w-max flex p-10 gap-2"> 
              {u.name} ({u.username}) - {u.role}{" "}
              <button onClick={() => deleteUser(u.id)}>Delete</button>
              <button onClick={() => {setEditingUser(u);
              document.getElementById("popedituser").classList.toggle("hidden");}
              }>Edit</button>
            </li>
          ))}
        </ul>
      )}
      </div> */}
    </>
  );
}
