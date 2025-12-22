import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Filter, Eye, FilePlus, Edit2, Trash2, CheckSquare, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PrintableInvoice from './PrintableInvoice';

const SalesList = () => {
  const navigate = useNavigate();
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]); // Track selected rows for bulk delete
  const invoiceRef = useRef();

  // 1. Fetch Sales from API
  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://pos.inspiredgrow.in/vps/1sale/all');
      setSalesData(response.data);
    } catch (err) {
      console.error("Error fetching sales history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // 2. Single Delete Logic
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await axios.delete(`https://pos.inspiredgrow.in/vps/1sale/${id}`);
        setSalesData(prev => prev.filter(sale => sale._id !== id));
        alert("Invoice deleted successfully");
      } catch (err) {
        alert("Error deleting invoice");
      }
    }
  };

  // 3. Bulk Delete Logic
  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} invoices?`)) {
      try {
        await axios.post('https://pos.inspiredgrow.in/vps/1sale/bulk-delete', { ids: selectedIds });
        setSalesData(prev => prev.filter(sale => !selectedIds.includes(sale._id)));
        setSelectedIds([]);
        alert("Selected invoices deleted successfully");
      } catch (err) {
        alert("Error in bulk deletion");
      }
    }
  };

  // 4. Selection Handlers
  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSales.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSales.map(sale => sale._id));
    }
  };

  const filteredSales = salesData.filter(sale =>
    sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto overflow-hidden bg-white border border-gray-100 shadow-sm rounded-3xl">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-50">
          <h1 className="text-3xl font-bold text-[#334155] tracking-tight">Estimate</h1>
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <button 
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white transition bg-red-500 rounded-lg shadow-md hover:bg-red-600 animate-in fade-in zoom-in duration-200"
              >
                <Trash2 size={18} /> Delete Selected ({selectedIds.length})
              </button>
            )}
            <button 
              onClick={() => navigate("/sales/create")}
              className="flex items-center gap-2 font-medium transition text-slate-500 hover:text-slate-800"
            >
              <FilePlus size={18} /> Create Invoice
            </button>
            <button 
              onClick={() => navigate("/items")}
              className="flex items-center gap-2 font-medium transition text-slate-500 hover:text-slate-800"
            >
              <FilePlus size={18} /> Items List
            </button>
          </div>
        </div>

        {selectedSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl">
              <button 
                onClick={() => setSelectedSale(null)} 
                className="absolute font-bold text-red-500 top-2 right-2 no-print"
              >
                Close [X]
              </button>
              <PrintableInvoice data={selectedSale} onClose={() => setSelectedSale(null)} />
            </div>
          </div>
        )}

        <div className="px-8 py-6">
          <div className="mb-6 relative">
             <Search className="absolute -translate-y-1/2 left-3 top-1/2 text-slate-400" size={18} />
             <input 
                type="text" 
                placeholder="Search by Customer Name" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 p-3 transition border rounded-lg outline-none border-slate-300 focus:ring-2 focus:ring-slate-200 text-slate-600"
              />
          </div>

          <div className="overflow-hidden border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f1f5f9] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3 border-b border-slate-200 w-10">
                    <button onClick={toggleSelectAll}>
                      {selectedIds.length === filteredSales.length && filteredSales.length > 0 
                        ? <CheckSquare size={18} className="text-blue-600" /> 
                        : <Square size={18} />}
                    </button>
                  </th>
                  <th className="px-4 py-3 border-b border-slate-200">#</th>
                  <th className="px-4 py-3 border-b border-slate-200">Bill Id</th>
                  <th className="px-4 py-3 border-b border-slate-200">Customer Name</th>
                  <th className="px-4 py-3 border-b border-slate-200">Grand Total (₹)</th>
                  <th className="px-4 py-3 text-center border-b border-slate-200">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-10 italic text-center text-slate-400">Loading sales history...</td>
                  </tr>
                ) : filteredSales.length > 0 ? (
                  filteredSales.map((sale, index) => (
                    <tr key={sale._id} className={`transition-colors border-b hover:bg-slate-50 ${selectedIds.includes(sale._id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-4 py-4">
                        <button onClick={() => toggleSelect(sale._id)}>
                          {selectedIds.includes(sale._id) ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} />}
                        </button>
                      </td>
                      <td className="px-4 py-4 font-medium">{index + 1}</td>
                      <td className="px-4 py-4">{sale.billId}</td>
                      <td className="px-4 py-4">{sale.customer?.name || "N/A"}</td>
                      <td className="px-4 py-4 font-bold text-slate-700">₹{sale.grandTotal?.toFixed(2)}</td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => setSelectedSale(sale)} 
                            className="bg-[#334155] text-white px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-slate-800 transition text-xs font-bold"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button 
                            onClick={() => navigate(`/sales/create?id=${sale._id}`)} 
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-blue-700 transition text-xs font-bold"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(sale._id)} 
                            className="bg-red-100 text-red-600 px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-red-200 transition text-xs font-bold"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-10 italic text-center text-slate-400">No sales found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-[#334155] py-4 text-center mt-auto">
          <p className="text-xs text-white opacity-90">© 2025 Estimate. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default SalesList;