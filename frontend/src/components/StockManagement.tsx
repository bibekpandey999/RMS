import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Plus, Pencil, Trash2, X, Check, Package, AlertTriangle,
  Loader2, Search, TrendingUp, Boxes, Wallet, ShoppingBasket
} from "lucide-react";

const API_BASE = "https://rms-0wk0.onrender.com/api/stocks";

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

const StockManagement: React.FC = () => {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // add-form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [stockName, setStockName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [perPiecePrice, setPerPiecePrice] = useState("");

  // edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStockName, setEditStockName] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editPerPiecePrice, setEditPerPiecePrice] = useState("");
  const [savingEditId, setSavingEditId] = useState<string | null>(null);

  // delete confirm state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Resolve the restaurant name from localStorage (pharmacyUser)
  const getStoredPharmacyName = (): string | null => {
    try {
      const raw = localStorage.getItem("pharmacyUser");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.pharmacyName || null;
    } catch {
      return null;
    }
  };

  const fetchStocks = async (pharmacyName: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}?restaurantId=${encodeURIComponent(pharmacyName)}`);
      const allData: StockItem[] = res.data.data || [];
      // Extra client-side safety: only show rows whose restaurantId matches
      // the pharmacyName currently stored in localStorage.
      const filtered = allData.filter((s) => s.restaurantId === pharmacyName);
      setStocks(filtered);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch stocks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const name = getStoredPharmacyName();
    setRestaurantName(name);
    if (name) {
      fetchStocks(name);
    } else {
      setLoading(false);
      setError("No restaurant found in local storage. Please log in again.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantName) return;
    if (!stockName.trim() || quantity === "" || perPiecePrice === "") {
      setError("Please fill all fields");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await axios.post(API_BASE, {
        restaurantId: restaurantName,
        stockName: stockName.trim(),
        quantity: Number(quantity),
        perPiecePrice: Number(perPiecePrice),
      });

      setStockName("");
      setQuantity("");
      setPerPiecePrice("");
      setShowAddForm(false);
      await fetchStocks(restaurantName);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add stock");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!restaurantName) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API_BASE}/${id}`);
      setDeleteTargetId(null);
      await fetchStocks(restaurantName);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete stock");
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (stock: StockItem) => {
    setEditingId(stock._id);
    setEditStockName(stock.stockName);
    setEditQuantity(String(stock.quantity));
    setEditPerPiecePrice(String(stock.perPiecePrice));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditStockName("");
    setEditQuantity("");
    setEditPerPiecePrice("");
  };

  const handleUpdate = async (id: string) => {
    if (!restaurantName) return;
    if (!editStockName.trim() || editQuantity === "" || editPerPiecePrice === "") {
      setError("Please fill all fields");
      return;
    }

    setSavingEditId(id);
    try {
      await axios.put(`${API_BASE}/${id}`, {
        stockName: editStockName.trim(),
        quantity: Number(editQuantity),
        perPiecePrice: Number(editPerPiecePrice),
      });

      cancelEdit();
      await fetchStocks(restaurantName);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update stock");
    } finally {
      setSavingEditId(null);
    }
  };

  const filteredStocks = useMemo(() => {
    if (!searchQuery.trim()) return stocks;
    const q = searchQuery.toLowerCase();
    return stocks.filter((s) => s.stockName.toLowerCase().includes(q));
  }, [stocks, searchQuery]);

  const grandTotal = stocks.reduce((sum, s) => sum + s.totalPrice, 0);
  const totalItems = stocks.length;
  const totalUnits = stocks.reduce((sum, s) => sum + s.quantity, 0);
  const lowStockCount = stocks.filter((s) => s.quantity <= 5).length;

  return (
    <div className="min-h-full bg-[#f8fafc] font-sans">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                <Boxes className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-gray-900 leading-tight">Stock Management</h1>
                <p className="text-xs text-gray-500">
                  {restaurantName ? restaurantName : "No restaurant selected"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm((v) => !v)}
            disabled={!restaurantName}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2.5 shadow-sm transition-colors cursor-pointer"
          >
            {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showAddForm ? "Close" : "Add Stock"}
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1.5">
              <ShoppingBasket className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Items</span>
            </div>
            <p className="text-xl font-extrabold text-gray-900">{totalItems}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1.5">
              <Package className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Units</span>
            </div>
            <p className="text-xl font-extrabold text-gray-900">{totalUnits}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1.5">
              <TrendingUp className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Low Stock</span>
            </div>
            <p className={`text-xl font-extrabold ${lowStockCount > 0 ? "text-amber-600" : "text-gray-900"}`}>
              {lowStockCount}
            </p>
          </div>
          
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-fade-in">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Add New Stock Item</h3>
            <form onSubmit={handleAddStock} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stock Name</label>
                <input
                  type="text"
                  placeholder="e.g. Water Bottle"
                  value={stockName}
                  onChange={(e) => setStockName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Quantity</label>
                <input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Per Piece Price</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={perPiecePrice}
                  onChange={(e) => setPerPiecePrice(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
                />
              </div>

              <div className="sm:col-span-4 flex items-center justify-between pt-1">
                <p className="text-xs text-gray-400">
                  Total:{" "}
                  <span className="font-bold text-gray-700">
                    Rs. {(Number(quantity || 0) * Number(perPiecePrice || 0)).toFixed(2)}
                  </span>
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-bold px-5 py-2.5 shadow-sm transition-colors cursor-pointer"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? "Saving..." : "Save Stock"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        {stocks.length > 0 && (
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search stock..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white transition-colors"
            />
          </div>
        )}

        {/* Table / states */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-6 w-6 text-teal-600 animate-spin" />
              <p className="text-sm text-gray-400">Loading stock...</p>
            </div>
          ) : !restaurantName ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-center px-6">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <p className="text-sm font-semibold text-gray-700">No restaurant session found</p>
              <p className="text-xs text-gray-400">Please log in again to manage stock.</p>
            </div>
          ) : filteredStocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-center px-6">
              <Package className="h-8 w-8 text-gray-300" />
              <p className="text-sm font-semibold text-gray-600">
                {stocks.length === 0 ? "No stock items yet" : "No matching items"}
              </p>
              <p className="text-xs text-gray-400">
                {stocks.length === 0
                  ? "Add your first stock item to start tracking purchases."
                  : "Try a different search term."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left border-b border-gray-100">
                    <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Stock Name</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Per Piece</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Price</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredStocks.map((stock) => {
                    const isEditing = editingId === stock._id;
                    const isLow = stock.quantity <= 5;
                    const isSaving = savingEditId === stock._id;
                    const isDeleting = deletingId === stock._id;
                    const isConfirmingDelete = deleteTargetId === stock._id;

                    return (
                      <tr key={stock._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editStockName}
                              onChange={(e) => setEditStockName(e.target.value)}
                              className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                              autoFocus
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800">{stock.stockName}</span>
                              {isLow && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 border border-amber-200/60">
                                  Low
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-3.5">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(e.target.value)}
                              min="0"
                              className="w-24 rounded-md border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                            />
                          ) : (
                            <span className="font-mono text-gray-700">{stock.quantity}</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editPerPiecePrice}
                              onChange={(e) => setEditPerPiecePrice(e.target.value)}
                              min="0"
                              step="0.01"
                              className="w-28 rounded-md border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                            />
                          ) : (
                            <span className="font-mono text-gray-700">Rs. {stock.perPiecePrice}</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="font-mono font-bold text-gray-900">
                            Rs.{" "}
                            {isEditing
                              ? (Number(editQuantity || 0) * Number(editPerPiecePrice || 0)).toFixed(2)
                              : stock.totalPrice.toFixed(2)}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleUpdate(stock._id)}
                                  disabled={isSaving}
                                  className="inline-flex items-center gap-1 rounded-md bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-xs font-bold px-3 py-1.5 transition-colors cursor-pointer"
                                >
                                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                  Save
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  disabled={isSaving}
                                  className="inline-flex items-center gap-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1.5 transition-colors cursor-pointer"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  Cancel
                                </button>
                              </>
                            ) : isConfirmingDelete ? (
                              <>
                                <span className="text-xs text-gray-500 mr-1">Delete?</span>
                                <button
                                  onClick={() => handleDelete(stock._id)}
                                  disabled={isDeleting}
                                  className="inline-flex items-center gap-1 rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-bold px-3 py-1.5 transition-colors cursor-pointer"
                                >
                                  {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeleteTargetId(null)}
                                  disabled={isDeleting}
                                  className="inline-flex items-center gap-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1.5 transition-colors cursor-pointer"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  No
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEdit(stock)}
                                  className="inline-flex items-center gap-1 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 border border-gray-150 transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteTargetId(stock._id)}
                                  className="inline-flex items-center gap-1 rounded-md bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 border border-red-150 transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50/70 border-t border-gray-100">
                    <td colSpan={3} className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Grand Total
                    </td>
                    <td colSpan={2} className="px-5 py-3 text-sm font-extrabold text-teal-700 font-mono">
                      Rs. {grandTotal.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.18s ease-out;
        }
      `}</style>
    </div>
  );
};

export default StockManagement;