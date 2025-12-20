


import React, { useState, useEffect,useRef } from 'react';
import axios from 'axios';
import { Search, Filter, Eye, FilePlus,Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PrintableInvoice from './PrintableInvoice'; // The component above

const SalesList = () => {
    const navigate = useNavigate();
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const invoiceRef = useRef();

  // Handle Print Action
 

  const handleView = (sale) => {
    // Option 1: Set selected sale and show the PrintableInvoice component
    setSelectedSale(sale);
  };
  // 1. Fetch Sales from API
  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        // Using your specified port and endpoint
        const response = await axios.get('http://localhost:5000/1sale/all');
        console.log(response)
        setSalesData(response.data);
      } catch (err) {
        console.error("Error fetching sales history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  // 2. Filter Logic for Search Bar
  const filteredSales = salesData.filter(sale =>
     sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto overflow-hidden bg-white border border-gray-100 shadow-sm rounded-3xl">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-50">
          <h1 className="text-3xl font-bold text-[#334155] tracking-tight">S.A. OFFSET</h1>
          <button 
            onClick={() => navigate("/sales/create")} // Navigate to Invoice Page
            className="flex items-center gap-2 font-medium transition text-slate-500 hover:text-slate-800"
          >
            <FilePlus size={18} />
            Create Invoice
          </button>
          <button 
            onClick={() => navigate("/items")} // Navigate to Invoice Page
            className="flex items-center gap-2 font-medium transition text-slate-500 hover:text-slate-800"
          >
            <FilePlus size={18} />
            Items
          </button>
        </div>
    
{selectedSale && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/50">
    <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl">
      <button 
        onClick={() => setSelectedSale(null)} 
        className="absolute font-bold text-red-500 top-2 right-2 no-print"
      >
        Close [X]
      </button>
      <PrintableInvoice data={selectedSale}  onClose={() => setSelectedSale(null)} />
    </div>
  </div>
)}
        {/* Sales List Sub-Header */}
        <div className="flex items-center justify-between px-8 py-6">
          <h2 className="text-xl font-bold text-slate-700">Sales List</h2>
         
        </div>

        <div className="px-8 pb-12">
          {/* Search Box */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-bold text-slate-700">Sales History</h3>
            <p className="mb-2 text-xs text-slate-400">Search Sales</p>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search by Customer Name" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 transition border rounded-lg outline-none border-slate-300 focus:ring-2 focus:ring-slate-200 text-slate-600 placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-hidden border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f1f5f9] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3 border-b border-slate-200">#</th>
                  <th className="px-4 py-3 border-b border-slate-200">Bill Id</th>
                  <th className="px-4 py-3 border-b border-slate-200">Date</th>
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
                    <tr key={index} className="transition-colors border-b hover:bg-slate-50 border-slate-100 last:border-0">
                      <td className="px-4 py-4 font-medium">{index+1}</td>
                      <td className="px-4 py-4 font-medium">{sale.billId}</td>
                      <td className="px-4 py-4">{new Date(sale.date).toLocaleString()}</td>
                      <td className="px-4 py-4">{sale.customer?.name || "N/A"}</td>
                      <td className="px-4 py-4 font-bold text-slate-700">₹{sale.grandTotal?.toFixed(2)}</td>
                      <td className="px-4 py-4 text-center">
  <div className="flex justify-center gap-2">
    <button 
      onClick={() => handleView(sale)} 
      className="bg-[#334155] text-white px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-slate-800 transition text-xs font-bold"
    >
      <Eye size={14} /> View
    </button>
    
    <button 
      onClick={() => {
        navigate(`/sales/create?id=${sale._id}`);
      }} 
      className="bg-blue-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-blue-700 transition text-xs font-bold"
    >
      <Edit2 size={14} /> Edit
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
        {/* Hidden container for printing */}
      <div style={{ display: 'none' }}>
        <PrintableInvoice ref={invoiceRef} data={selectedSale} />
      </div>

        {/* Footer */}
        <div className="bg-[#334155] py-4 text-center mt-auto">
          <p className="text-xs text-white opacity-90">
            © 2025 S.A. OFFSET. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalesList;


