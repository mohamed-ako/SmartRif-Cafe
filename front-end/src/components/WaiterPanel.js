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
    ).catch(err => {
      console.error("Fetch failed:", err.response?.data || err.message);
    });
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

  //clear Cat 
  function clearcart() {
    setCart([])
  }




  
  return (
    <>
    

    <div class="px-10 py-10 flex justify-between ">
    <div className="" style={{ width: "20%", backgroundColor : "#f4f6f8" }} class="flex justify-center  hidden xl:flex">
      <div class="bg-white w-80 h-max pb-20 pt-5 pl-5">
          <h1 class="font-bold mb-10">Menu</h1>
          {categories.map((cat) => (
        
        
        <div key={cat.id} class="flex items-center hover:bg-red-600  group cursor-pointer border-b-1 border-gray-100" onClick={()=>setVariable(cat.id)}>
                  <img src="https://static.vecteezy.com/system/resources/thumbnails/023/742/327/small_2x/latte-coffee-isolated-illustration-ai-generative-free-png.png" class="w-10 mr-5"></img>
                  <h3 class="group-hover:text-white e">{cat.name}</h3>
          
        </div>
        
      ))}
      </div>
      
    </div>
    <div className="xl:w-5/10  full " >
      
      
      
    
       <div className="product-grid" class=" flex flex-wrap justify-around items-around w-full mb-20 ">
       {menu.filter((item) => item.category_id === variable).map((item) => (
                  <div className="product-card " key={item.id} class=" mt-5 mr-2 w-40 md:w-60 flex flex-col items-center justify-center  shadow-lg p-10 rounded-lg bg-white">
                  <img src={item.url}></img>
                  <span>{item.name}</span>
                  <span>${item.price.toFixed(2)}</span>
                  <div class="w-full flex justify-between mt-10 items-center ">
                    <span>${item.price.toFixed(2)}</span>
                    <span class="p-2  cursor-pointer text-2xl font-extrabold bg-[#f4f6f8] hover:text-white hover:bg-red-600 rounded-md ml-2" onClick={() => addToCart(item)}>+</span>
                  </div>
                  {/* <button onClick={() => addToCart(item)} style={{  backgroundColor: "#4785f2"}} class="mt-5">Add</button> */}
                </div>
       ))}
        </div>
      
    </div>
    <div style={{ width: "20%" }} class="hidden xl:block">
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
             ${(item.price * item.quantity).toFixed(2)}
          </li>
        ))}
      </ul>
      <h4 class="mb-5">Total: ${totalPrice.toFixed(2)}</h4>
      <button onClick={sendOrder} style={{  backgroundColor: "#4785f2"}} >Send Order</button>
      <button onClick={clearcart} class="ml-5 gb-red-500 mt-3" style={{  backgroundColor: "red"}}>Clear order</button>
    </div>
    </div>
    <div class="fixed bottom-0 left-0 w-full bg-gray-800 text-white p-4 flex justify-between xl:hidden" id="divbuttom1" onClick= {() =>{document.getElementById("divbuttom1").classList.add("hidden");document.getElementById("divbuttom2").classList.remove("hidden")}}>
        <div><h3>Number of items : {cart.length} Total to Pay: {totalPrice.toFixed(2)}$ <spam class="px-4 py-2 bg-blue-500 rounded-lg cursor-pointer ml-5 ">Send</spam></h3></div> <h3><spam class="text-lg text-white font-extrabold cursor-pointer">X</spam></h3>
    </div>
    <div class=" hidden fixed bottom-0 left-0 w-full bg-gray-800 text-white p-4  xl:hidden" id="divbuttom2">
        <spam class="w-full flex justify-between"><h3>Cart</h3> <h3 class="text-lg text-white font-extrabold cursor-pointer" onClick= {() =>{document.getElementById("divbuttom2").classList.add("hidden");document.getElementById("divbuttom1").classList.remove("hidden")}}>X</h3></spam>
      <ul>
        <input
        placeholder="Table ID"
        value={tableId}
        onChange={(e) => setTableId(e.target.value)}
      />
        {cart.map((item) => (
         
          <li className="cart-item " key={item.id} class="bg-white text-black">
             <img src="https://static.vecteezy.com/system/resources/thumbnails/023/742/327/small_2x/latte-coffee-isolated-illustration-ai-generative-free-png.png" class="w-15"></img>
            {item.name} (${item.price}) x
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) =>
                updateQuantity(item.id, parseInt(e.target.value))
              }
              style={{ width: "50px", margin: "0 5px", color:"black" }}
            />
             ${(item.price * item.quantity).toFixed(2)}
          </li>
        ))}
      </ul>
      <h4 class="mb-5 ">Total: ${totalPrice.toFixed(2)}</h4>
      <button onClick={sendOrder} style={{  backgroundColor: "#4785f2"}}>Send Order</button>
      <button onClick={clearcart} class="ml-5 gb-red-500" style={{  backgroundColor: "red"}}>Clear order</button>
    
    </div>
    </>
  );
}
