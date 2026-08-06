import React, { useState, useEffect } from "react";
import axios from "axios";

// Change this to match your backend URL
const API_BASE = "http://localhost:5000/api/stocks";

interface StockItem {
  _id: string;
  restaurantId: string;
  stockName: string;
  quantity: number;
  perPiecePrice: number;
  totalPrice: number;
  createdAt?: string;
  updatedAt?: string;
}

interface StockManagementProps {
  restaurantId: string;
}

const StockManagement: React.FC<StockManagementProps> = ({ restaurantId }) => {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [stockName, setStockName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [perPiecePrice, setPerPiecePrice] = useState("");

  // edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStockName, setEditStockName] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editPerPiecePrice, setEditPerPiecePrice] = useState("");

  // Fetch all stocks for this restaurant
  const fetchStocks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}?restaurantId=${restaurantId}`);
      setStocks(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch stocks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  // Create new stock
  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockName || !quantity || !perPiecePrice) {
      alert("Please fill all fields");
      return;
    }

    try {
      await axios.post(API_BASE, {
        restaurantId,
        stockName,
        quantity: Number(quantity),
        perPiecePrice: Number(perPiecePrice),
      });

      // reset form
      setStockName("");
      setQuantity("");
      setPerPiecePrice("");

      fetchStocks();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add stock");
    }
  };

  // Delete stock
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this stock item?")) return;

    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchStocks();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete stock");
    }
  };

  // Start editing a row
  const startEdit = (stock: StockItem) => {
    setEditingId(stock._id);
    setEditStockName(stock.stockName);
    setEditQuantity(String(stock.quantity));
    setEditPerPiecePrice(String(stock.perPiecePrice));
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditStockName("");
    setEditQuantity("");
    setEditPerPiecePrice("");
  };

  // Save edited stock (e.g. reduce quantity after selling some bottles)
  const handleUpdate = async (id: string) => {
    if (!editStockName || editQuantity === "" || editPerPiecePrice === "") {
      alert("Please fill all fields");
      return;
    }

    try {
      await axios.put(`${API_BASE}/${id}`, {
        stockName: editStockName,
        quantity: Number(editQuantity),
        perPiecePrice: Number(editPerPiecePrice),
      });

      cancelEdit();
      fetchStocks();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update stock");
    }
  };

  // Calculate grand total of all stock value
  const grandTotal = stocks.reduce((sum, s) => sum + s.totalPrice, 0);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <h2>Stock Management</h2>

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          {error}
        </div>
      )}

      {/* Add new stock form */}
      <form
        onSubmit={handleAddStock}
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Stock name (e.g. Water Bottle)"
          value={stockName}
          onChange={(e) => setStockName(e.target.value)}
          style={{ padding: "8px", flex: "1", minWidth: "180px" }}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          style={{ padding: "8px", width: "120px" }}
          min="0"
        />
        <input
          type="number"
          placeholder="Per piece price"
          value={perPiecePrice}
          onChange={(e) => setPerPiecePrice(e.target.value)}
          style={{ padding: "8px", width: "140px" }}
          min="0"
          step="0.01"
        />
        <button type="submit" style={{ padding: "8px 16px" }}>
          Add Stock
        </button>
      </form>

      {loading ? (
        <p>Loading stocks...</p>
      ) : (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "10px",
            }}
          >
            <thead>
              <tr style={{ background: "#f2f2f2", textAlign: "left" }}>
                <th style={thStyle}>Stock Name</th>
                <th style={thStyle}>Quantity</th>
                <th style={thStyle}>Per Piece Price</th>
                <th style={thStyle}>Total Price</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stocks.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "10px", textAlign: "center" }}>
                    No stock items yet.
                  </td>
                </tr>
              )}

              {stocks.map((stock) => {
                const isEditing = editingId === stock._id;

                return (
                  <tr key={stock._id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={tdStyle}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editStockName}
                          onChange={(e) => setEditStockName(e.target.value)}
                          style={{ padding: "6px", width: "100%" }}
                        />
                      ) : (
                        stock.stockName
                      )}
                    </td>

                    <td style={tdStyle}>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          style={{ padding: "6px", width: "80px" }}
                          min="0"
                        />
                      ) : (
                        stock.quantity
                      )}
                    </td>

                    <td style={tdStyle}>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editPerPiecePrice}
                          onChange={(e) => setEditPerPiecePrice(e.target.value)}
                          style={{ padding: "6px", width: "100px" }}
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        `Rs. ${stock.perPiecePrice}`
                      )}
                    </td>

                    <td style={tdStyle}>
                      {isEditing
                        ? `Rs. ${(
                            Number(editQuantity || 0) * Number(editPerPiecePrice || 0)
                          ).toFixed(2)}`
                        : `Rs. ${stock.totalPrice}`}
                    </td>

                    <td style={tdStyle}>
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleUpdate(stock._id)}
                            style={{ marginRight: "6px" }}
                          >
                            Save
                          </button>
                          <button onClick={cancelEdit}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(stock)}
                            style={{ marginRight: "6px" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(stock._id)}
                            style={{ color: "red" }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ textAlign: "right", fontWeight: "bold" }}>
            Grand Total: Rs. {grandTotal.toFixed(2)}
          </div>
        </>
      )}
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: "10px",
  borderBottom: "2px solid #ccc",
};

const tdStyle: React.CSSProperties = {
  padding: "10px",
};

export default StockManagement;