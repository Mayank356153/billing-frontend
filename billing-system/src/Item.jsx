
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Package, Trash2, CheckSquare, Square , Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const ItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]); // Track selected IDs
  const [showModal, setShowModal] = useState(false);
  const [newItems, setNewItems] = useState([{ name: '', salesPrice: '', mrp: '' }]);
  const Navigate=useNavigate();
  useEffect(() => {
    fetchItems();
  }, []);


  const addModalRow = () => {
    setNewItems([...newItems, { name: '', salesPrice: '', mrp: '' }]);
  };

  // Remove a row in the modal
  const removeModalRow = (index) => {
    setNewItems(newItems.filter((_, i) => i !== index));
  };

  // Handle input changes in modal
  const handleModalChange = (index, field, value) => {
    const updated = [...newItems];
    updated[index][field] = value;
    setNewItems(updated);
  };

  // Submit multiple items
  const handleBulkCreate = async () => {
    try {
      // Filter out empty rows
      const itemsToSave = newItems.filter(item => item.name.trim() !== '');
      if (itemsToSave.length === 0) return alert("Please add at least one item name.");

      await axios.post('https://billing-backend-c183.onrender.com/1items/bulk-create', { items: itemsToSave });
      
      setShowModal(false);
      setNewItems([{ name: '', salesPrice: '', mrp: '' }]);
      fetchItems(); // Refresh main list
    } catch (err) {
      console.error("Bulk create failed", err);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://billing-backend-c183.onrender.com/1items');
      setItems(response.data);
    } catch (err) {
      console.error("Error fetching inventory items:", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle individual selection
  const toggleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle Select All
  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item._id));
    }
  };

  // Bulk Delete Function
  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      try {
        await axios.post('https://billing-backend-c183.onrender.com/1items/bulk-delete', { ids: selectedItems });
        setSelectedItems([]); // Clear selection
        fetchItems(); // Refresh list
      } catch (err) {
        console.error("Bulk delete failed:", err);
        alert("Failed to delete selected items");
      }
    }
  };


  
//   // 3. Delete Item Logic
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        // Assuming a delete endpoint exists at your base items route
        await axios.delete(`https://billing-backend-c183.onrender.com/1items/${id}`);
        fetchItems(); // Refresh the list
      } catch (err) {
        console.error("Error deleting item:", err);
      }
    }
  };

  const filteredItems = items.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto overflow-hidden bg-white border border-gray-100 shadow-sm rounded-3xl">
        
        {/* Header Section */}
        <div className="flex items-center justify-between p-6 border-b border-gray-50">
          <h1 className="text-3xl font-bold text-[#334155] tracking-tight">Estimate</h1>
          
          {selectedItems.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white transition duration-200 bg-red-500 rounded-lg shadow-md hover:bg-red-600 animate-in fade-in zoom-in"
            >
              <Trash2 size={18} />
              Delete Selected ({selectedItems.length})
            </button>
          )}
          <button 
              onClick={() => setShowModal(true)}
              className="bg-[#334155] text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition text-sm font-bold shadow-md"
            >
              <Plus size={18} /> Add Multiple Items
            </button>
          <button 
              onClick={() => Navigate("/sales/create")}
              className="bg-[#334155] text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition text-sm font-bold shadow-md"
            >
              <Plus size={18} /> Create Invoice
            </button>
        </div>

        <div className="px-8 py-6">
          <div className="flex flex-col justify-between gap-4 mb-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-700">Inventory Items</h2>
              <p className="mt-1 text-xs text-slate-400">Manage your product list and pricing</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute -translate-y-1/2 left-3 top-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search Item Name" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-100 transition text-sm text-slate-600"
              />
            </div>
          </div>

          <div className="overflow-hidden border shadow-sm border-slate-100 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f1f5f9] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="w-10 px-6 py-4 border-b border-slate-200">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600">
                      {selectedItems.length === filteredItems.length && filteredItems.length > 0 
                        ? <CheckSquare size={18} className="text-blue-600" /> 
                        : <Square size={18} />
                      }
                    </button>
                  </th>
                  <th className="px-4 py-4 border-b border-slate-200">#</th>
                  <th className="px-6 py-4 border-b border-slate-200">Item Name</th>
                  <th className="px-6 py-4 border-b border-slate-200">Sales Rate</th>
                  <th className="px-6 py-4 text-blue-700 border-b border-slate-200">MRP (₹)</th>
                  <th className="px-6 py-4 text-blue-700 border-b border-slate-200">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-10 italic text-center text-slate-400">Loading inventory...</td>
                  </tr>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => (
                    <tr 
                      key={item._id} 
                      className={`transition-colors border-b border-slate-50 last:border-0 ${selectedItems.includes(item._id) ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'}`}
                    >
                      <td className="px-6 py-4">
                        <button onClick={() => toggleSelectItem(item._id)} className="text-slate-400">
                          {selectedItems.includes(item._id) 
                            ? <CheckSquare size={18} className="text-blue-600" /> 
                            : <Square size={18} />
                          }
                        </button>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-400">{index + 1}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{item.name}</td>
                      <td className="px-6 py-4">₹{item.salesPrice || 0}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">₹{item.mrp?.toFixed(2)}</td>
                      <td className="px-6 py-4">
                         <div className="flex justify-center gap-3 text-slate-400">
                           {/* <button className="transition hover:text-blue-600"><Edit2 size={16} /></button> */}
                           <button 
                            onClick={() => handleDelete(item._id)}
                            className="transition hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-10 italic text-center text-slate-400">No items found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

         {/* --- BULK CREATE MODAL --- */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold text-slate-700">Create Multiple Items</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-bold uppercase text-slate-400">
                      <th className="pb-4 pr-4">Item Name</th>
                      <th className="w-32 pb-4 pr-4">Sales Rate</th>
                      <th className="w-32 pb-4 pr-4">MRP</th>
                      <th className="w-10 pb-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {newItems.map((item, index) => (
                      <tr key={index}>
                        <td className="py-2 pr-4">
                          <input 
                            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-slate-100"
                            placeholder="e.g. Glossy Paper"
                            value={item.name}
                            onChange={(e) => handleModalChange(index, 'name', e.target.value)}
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <input 
                            type="number"
                            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-slate-100"
                            placeholder="0.00"
                            value={item.salesPrice}
                            onChange={(e) => handleModalChange(index, 'salesPrice', e.target.value)}
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <input 
                            type="number"
                            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-slate-100"
                            placeholder="0.00"
                            value={item.mrp}
                            onChange={(e) => handleModalChange(index, 'mrp', e.target.value)}
                          />
                        </td>
                        <td className="py-2 text-center">
                          {newItems.length > 1 && (
                            <button onClick={() => removeModalRow(index)} className="text-red-400 hover:text-red-600">
                              <Trash2 size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button 
                  onClick={addModalRow}
                  className="flex items-center gap-2 mt-4 text-sm font-bold text-blue-600 hover:text-blue-800"
                >
                  <Plus size={16} /> Add Another Row
                </button>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t bg-slate-50 rounded-b-3xl">
                <button onClick={() => setShowModal(false)} className="px-6 py-2 font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                <button 
                  onClick={handleBulkCreate}
                  className="bg-[#334155] text-white px-8 py-2 rounded-xl font-bold hover:bg-slate-800 shadow-lg"
                >
                  Save All Items
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="bg-[#334155] py-4 text-center">
          <p className="text-xs text-white opacity-90">© 2025 Estimate. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default ItemList;