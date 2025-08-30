import { useState } from "react";
import API from "../../api";


export default function Orders({ waiterOrders, fetchWaiterOrders }) {
  const [editingOrder, setEditingOrder] = useState(null); // 🔹 currently editing order

    // Delete order
    const deleteOrder = async (orderId) => {
      if (window.confirm(`Are you sure you want to delete order #${orderId}?`)) {
        try {
          await API.delete(`/waiter/orders/${orderId}`);
          alert("Order deleted successfully!");
          fetchWaiterOrders();
        } catch (err) {
          console.error("Failed to delete order:", err.response?.data || err.message);
          alert("Failed to delete order.");
        }
      }
    };
  
    // Update order status
    // const updateOrderStatus = async (orderId, newStatus) => {
    //   try {
    //     await API.put(`/waiter/orders/${orderId}/status`, { status: newStatus });
    //     alert(`Order #${orderId} marked as '${newStatus}'!`);
    //     fetchWaiterOrders();
    //   } catch (err) {
    //     console.error("Failed to update status:", err.response?.data || err.message);
    //     alert("Failed to update order status.");
    //   }
    // };
  
   
    // Save edited order
// Orders.jsx
const saveEditedOrder = async () => {
  if (!editingOrder) return;

  try {
      await API.put(`/waiter/orders/${editingOrder.order_id}`, {
          // Change table_id to table_number to match the backend
          table_number: editingOrder.table_number,
          items: editingOrder.items.map((i) => ({
              item_id: i.item_id,
              quantity: i.quantity,
              note: i.note,
          })),
      });
      alert("Order updated successfully!");
      setEditingOrder(null);
      fetchWaiterOrders();
  } catch (err) {
      console.error("Failed to update order:", err.response?.data || err.message);
      alert("Failed to update order.");
  }
};
  return(
          <div className="p-10" style={{ width: "40%" }}>
          <h3>My Orders</h3>
          <div className="orders-list mt-5">
            {waiterOrders.length > 0 ? (
              waiterOrders.map((order) => (
                <div
                  key={order.order_id}
                  className="bg-gray-100 p-4 rounded-lg shadow-md mb-4"
                >
                  {editingOrder?.order_id === order.order_id ? (
                    // 🔹 Edit Mode
                    <div>
                      <h4>Edit Order #{order.order_id}</h4>
                      <input
                        type="text"
                        value={editingOrder.table_number}
                        onChange={(e) =>
                          setEditingOrder({
                            ...editingOrder,
                            table_number: e.target.value,
                          })
                        }
                      />
                      <ul>
                        {editingOrder.items.map((item, idx) => (
                          <li key={idx}>
                            {item.item_name} x
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const newItems = [...editingOrder.items];
                                newItems[idx].quantity = parseInt(e.target.value);
                                setEditingOrder({
                                  ...editingOrder,
                                  items: newItems,
                                });
                              }}
                            />
                            <button
                              onClick={() => {
                                setEditingOrder({
                                  ...editingOrder,
                                  items: editingOrder.items.filter(
                                    (_, i) => i !== idx
                                  ),
                                });
                              }}
                            >
                              ❌
                            </button>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={saveEditedOrder}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingOrder(null)}
                        className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    // 🔹 View Mode
                    <div>
                      <p className="font-bold">Order #{order.order_id}</p>
                      <p>Table: {order.table_number}</p>
                      <p>Status: {order.status}</p>
                      <p>Total: ${order.total.toFixed(2)}</p>
                      <h4 className="mt-2 font-semibold">Items:</h4>
                      <ul>
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            {item.item_name} x {item.quantity}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => setEditingOrder(order)}
                          className="bg-yellow-500 text-white px-4 py-2 rounded"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteOrder(order.order_id)}
                          className="bg-red-500 text-white px-4 py-2 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>You have no orders yet.</p>
            )}
          </div>
        </div>
  )
}