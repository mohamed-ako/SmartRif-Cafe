import React, { useState, useEffect } from "react";
import API from "../api";

export default function WaiterPanel() {
  const [categories, setCategories] = useState([]);
  const [menu, setMenu] = useState([]);
  const [tableId, setTableId] = useState("");
  const [cart, setCart] = useState([]);
  const [variable, setVariable] = useState(1);


  // Fetch categories and products

  useEffect(() => {
    Promise.all([API.get("/categories"), API.get("/menu")]).then(
      ([catRes, menuRes]) => {
        setCategories(catRes.data);
        setMenu(menuRes.data);
      }
    );
  }, []);

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
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  //filter Cat 
  
  return (
    <>
    

    <div class="px-10 py-10 flex justify-between">

    <div className="" style={{ width: "60%" }}>
      <h2>Waiter Panel</h2>
      <div class="p-5 flex flex-wrap ">
      {categories.map((cat) => (
        
        
        <div key={cat.id} class="p-5 shadow-lg rounded-lg w-30 ml-5 flex flex-col justify-center justify-items-center bg-white" onClick={()=>setVariable(cat.id)}>
                  <img src={cat.url}></img>
                  <h3>{cat.name}</h3>
          
        </div>
        
      ))}
    </div>
      
      

      {/* {categories.map((cat) => (
        <div key={cat.id}>
          <h3>{cat.name}</h3>
          <div className="product-grid" class=" flex flex-wrap justify-around">
            {menu
              .filter((item) => item.category_id === cat.id)
              .map((item) => (
                <div className="product-card " key={item.id} class=" mt-10 mr-10 w-50 flex flex-col items-center justify-center shadow-lg p-10 rounded-lg bg-white">
                  <img src="https://static.vecteezy.com/system/resources/thumbnails/023/742/327/small_2x/latte-coffee-isolated-illustration-ai-generative-free-png.png"></img>
                  <span>{item.name}</span>
                  <span>${item.price.toFixed(2)}</span>
                  <button onClick={() => addToCart(item)}>Add</button>
                </div>
              ))}
          </div>
        </div>
      ))} */}
       <div className="product-grid" class=" flex flex-wrap justify-around">
       {menu.filter((item) => item.category_id === variable).map((item) => (
                  <div className="product-card " key={item.id} class=" mt-10 mr-10 w-50 flex flex-col items-center justify-center shadow-lg p-10 rounded-lg bg-white">
                  <img src={item.url}></img>
                  <span>{item.name}</span>
                  <span>${item.price.toFixed(2)}</span>
                  <button onClick={() => addToCart(item)}>Add</button>
                </div>
       ))}
        </div>
      
    </div>
    <div style={{ width: "30%" }} class="">
      <h3>Cart</h3>
      <ul>
        <input
        placeholder="Table ID"
        value={tableId}
        onChange={(e) => setTableId(e.target.value)}
      />
        {cart.map((item) => (
         
          <li className="cart-item " key={item.id} class="bg-white">
             <img src="https://static.vecteezy.com/system/resources/thumbnails/023/742/327/small_2x/latte-coffee-isolated-illustration-ai-generative-free-png.png" class="w-15"></img>
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
    </div>
    </>
  );
}
