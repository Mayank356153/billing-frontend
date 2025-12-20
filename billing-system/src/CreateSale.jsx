
import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { Trash2, Search, Plus } from 'lucide-react';
import { useParams,useNavigate,useSearchParams } from 'react-router-dom';




const App = () => {
  // --- State Management ---
  const [partyDetails, setPartyDetails] = useState({
    customerName: ''
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Extract 'id' from http://localhost:3000/tax-list?id=69456...
  const id = searchParams.get('id');
  const [editId, setEditId] = useState(null);
  const [items, setItems] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [itemResults, setItemResults] = useState([]);
  const [customerResults, setCustomerResults] = useState([]);
  const [coinAdjustment, setCoinAdjustment] = useState(0);

  // --- Search Customers ---
  const handleCustomerSearch = async (query) => {
    setPartyDetails(prev => ({ ...prev, customerName: query }));
    if (!query) return setCustomerResults([]);
    try {
      const { data } = await axios.get(`https://billing-backend-c183.onrender.com/1customer/search?query=${query}`);
      const exactMatch = data.find(c => c.name.toLowerCase() === query.toLowerCase());
      setCustomerResults(!exactMatch ? [...data, { _id: 'new', name: query, isNew: true }] : data);
    } catch (err) { console.error(err); }
  };

  // --- Global Item Search ---
  const handleGlobalItemSearch = async (query) => {
    setGlobalSearch(query);
    if (!query) return setItemResults([]);
    try {
      const { data } = await axios.get(`https://billing-backend-c183.onrender.com/1items/search?query=${query}`);
      const exactMatch = data.find(i => i.name.toLowerCase() === query.toLowerCase());
      setItemResults(!exactMatch ? [...data, { _id: 'new', name: query, isNew: true }] : data);
    } catch (err) { console.error(err); }
  };

  // --- Add/Update Item Logic ---
  const addOrUpdateItem = (product) => {
    const existingIndex = items.findIndex(item => item.name.toLowerCase() === product.name.toLowerCase());
  
    if (existingIndex > -1) {
      const updatedItems = [...items];
      updatedItems[existingIndex].qty += 1;
      updatedItems[existingIndex].total = updatedItems[existingIndex].qty * updatedItems[existingIndex].rate;
      setItems(updatedItems);
    } else {
      // Initial calculation: rate is mrp minus any default discount if applicable
      const initialMrp = product.mrp || 0;
      const initialDiscount = 0;
      const initialRate = initialMrp - (initialMrp * initialDiscount / 100);
  
      const newItem = {
        id: Date.now(),
        name: product.name,
        qty: 1,
        mrp: initialMrp,
        discount: initialDiscount, // New Field
        rate: product.salesPrice || initialRate,
        total: product.salesPrice || initialRate
      };
      setItems([...items, newItem]);
    }
    setGlobalSearch('');
    setItemResults([]);
  };

  // --- Manual Row Edits ---
  const handleRowChange = (index, field, value) => {
    const updatedItems = [...items];
    const val = field === 'name' ? value : Number(value);
    updatedItems[index][field] = val;
  
    // Logic: If Discount changes, update Rate
    if (field === 'discount') {
      const mrp = updatedItems[index].mrp;
      const disPercent = val;
      updatedItems[index].rate = mrp - (mrp * disPercent / 100);
    }
  
    // Logic: If MRP changes, update Rate based on existing Discount
    if (field === 'mrp') {
      const mrp = val;
      const disPercent = updatedItems[index].discount;
      updatedItems[index].rate = mrp - (mrp * disPercent / 100);
    }
  
    // Recalculate row total
    updatedItems[index].total = updatedItems[index].qty * updatedItems[index].rate;
    setItems(updatedItems);
  };
  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // --- Totals ---
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const grandTotal = subtotal  + Number(coinAdjustment);
  const [billId, setBillId] = useState('');

  // Generate ID on Page Load
 // --- Fetch Sale Data if ID exists in URL ---
 useEffect(() => {
  if (id) {
    const fetchSaleForEdit = async () => {
      try {
        const { data } = await axios.get(`https://billing-backend-c183.onrender.com/1sale/${id}`);
        if (data.success) {
          const sale = data.data;
          setEditId(sale._id);
          setBillId(sale.billId);
          setPartyDetails({ customerName: sale.customer?.name || '' });
          setCoinAdjustment(sale.coinAdjustment || 0);
          console.log(sale)
          setItems(sale.items.map(item => ({
            id: item.itemId._id,
            name: item.name,
            qty: item.qty,
            rate: item.rate,
            mrp: item.itemId.mrp || 0,
            total: item.total
          })));
        }
      } catch (err) {
        console.error("Error loading sale:", err);
        alert("Could not load sale data");
      }
    };
    fetchSaleForEdit();
  } else {
    // Normal behavior: Generate new ID for fresh invoice
    setBillId(`SA${Date.now().toString().slice(-6)}`);
  }
}, [id]);

const handleSave = async () => {
  try {
    const payload = { 
      billId, 
      partyDetails, 
      billingItems: items, 
      summary: { 
        subtotal: items.reduce((sum, i) => sum + i.total, 0), 
        grandTotal: items.reduce((sum, i) => sum + i.total, 0) + Number(coinAdjustment), 
        coinAdjustment 
      } 
    };

    let response;
    if (editId) {
      response = await axios.put(`https://billing-backend-c183.onrender.com/1sale/update/${editId}`, payload);
    } else {
      response = await axios.post('https://billing-backend-c183.onrender.com/1sale/create', payload);
    }

    if (response.data.success) {
      alert(editId ? "Sale Updated!" : "Sale Saved!");
       
    }
  } catch (err) {
    alert("Error saving sale");
  }
  finally{
    if(!editId){
      setItems([])
      setCoinAdjustment(0)
      setGlobalSearch("")
      setPartyDetails({
         customerName: ''
      })
      const newId = `SA${Date.now().toString().slice(-6)}`; // Longer for better uniqueness
    setBillId(newId);
  }
}
};
  // const handleSave = async () => {
  //   try {
  //     const payload = { billId,partyDetails, billingItems: items, summary: { subtotal, grandTotal, coinAdjustment } };
  //     const { data } = await axios.post('http://localhost:5000/1sale/create', payload);
  //     if (data.success) {
  //       alert("Sale saved successfully!");
        
  //     }
  //   } catch (err) { alert("Error saving sale"); }
  //   finally{
  //     setItems([])
  //     setCoinAdjustment(0)
  //     setGlobalSearch("")
  //     setPartyDetails({
  //        customerName: ''
  //     })
  //     const newId = `SA${Date.now().toString().slice(-6)}`; // Longer for better uniqueness
  //   setBillId(newId);
  //   }
  // };

  return (
    <div className="min-h-screen p-4 font-sans bg-slate-100 md:p-8">
      <div className="max-w-5xl mx-auto overflow-hidden bg-white shadow-lg rounded-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Estimate</h1>
          <button className="flex items-center gap-2 px-4 py-2 transition rounded bg-slate-100 text-slate-600 hover:bg-slate-200" onClick={() => navigate('/sales')}>
              <span>📋</span> Sales List
          </button>
        </div>

        <div className="p-8">
          <h2 className="mb-6 text-xl font-semibold text-slate-700">Invoice</h2>

          {/* Party Details Section */}
          <section className="mb-8">
            <h3 className="mb-4 text-sm font-bold tracking-wider uppercase text-slate-500">Party Details</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Customer Name" 
                  value={partyDetails.customerName}
                  onChange={(e) => handleCustomerSearch(e.target.value)}
                  className="w-full p-3 transition border rounded-md outline-none focus:ring-2 focus:ring-blue-400" 
                />
                {customerResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                    {customerResults.map(c => (
                      <div key={c._id} onClick={() => { setPartyDetails({...partyDetails, ...c, customerName: c.name}); setCustomerResults([]); }} className="flex justify-between p-2 cursor-pointer hover:bg-slate-100">
                        <span>{c.name}</span>
                        {c.isNew && <span className="text-xs font-bold text-blue-500">(new)</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* New Global Item Search Bar */}
          <section className="mb-8">
            <h3 className="mb-4 text-sm font-bold tracking-wider uppercase text-slate-500">Add Item to Bill</h3>
            <div className="relative">
              <div className="flex items-center p-1 border rounded-md bg-slate-50">
                <Search className="ml-2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search and Select Item to Add..." 
                  className="w-full p-2 bg-transparent outline-none"
                  value={globalSearch}
                  onChange={(e) => handleGlobalItemSearch(e.target.value)}
                />
              </div>
              {itemResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                  {itemResults.map(p => (
                    <div key={p._id} onClick={() => addOrUpdateItem(p)} className="flex justify-between p-2 cursor-pointer hover:bg-slate-100">
                      <span>{p.name}</span>
                      {p.isNew ? <span className="text-xs font-bold text-blue-500">(new)</span> : <span className="text-xs text-slate-400">MRP: ₹{p.mrp}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Billing Table */}
         {/* Billing Table */}
<section className="mb-8">
  <div className="overflow-x-auto border rounded-lg">
    <table className="w-full text-sm text-left border-collapse">
      <thead className="border-b bg-slate-50 text-slate-600">
        <tr>
          <th className="w-12 p-3 border-r">#</th>
          <th className="w-20 p-3 text-center border-r">DISC %</th> {/* New Column */}
          <th className="p-3 border-r">ITEM NAME</th>
          <th className="w-20 p-3 text-center border-r">QTY</th>
          <th className="w-24 p-3 text-center border-r">MRP</th>
          <th className="w-24 p-3 text-center border-r">RATE</th>
          <th className="p-3 text-right w-28">TOTAL</th>
          <th className="w-10 p-3"></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={item.id} className="border-b">
            <td className="p-3 text-center border-r">{index + 1}</td>
            <td className="p-3 border-r">
               <input 
                 type="number" 
                 className="w-full font-medium text-center text-red-500 outline-none" 
                 placeholder="0"
                 value={item.discount} 
                 onChange={(e) => handleRowChange(index, 'discount', e.target.value)} 
               />
            </td>
            <td className="p-3 border-r">
              <input type="text" className="w-full bg-transparent outline-none" value={item.name} onChange={(e) => handleRowChange(index, 'name', e.target.value)} />
            </td>
            <td className="p-3 border-r">
              <input type="number" className="w-full text-center outline-none" value={item.qty} onChange={(e) => handleRowChange(index, 'qty', e.target.value)} />
            </td>
            <td className="p-3 border-r">
               <input type="number" className="w-full text-center outline-none" value={item.mrp} onChange={(e) => handleRowChange(index, 'mrp', e.target.value)} />
            </td>
            {/* Discount Input */}
           
            <td className="p-3 border-r">
               <input type="number" className="w-full font-bold text-center text-blue-600 outline-none" value={item.rate} onChange={(e) => handleRowChange(index, 'rate', e.target.value)} />
            </td>
            <td className="p-3 font-medium text-right text-slate-700">₹{item.total.toFixed(2)}</td>
            <td className="p-3 text-center">
              <button onClick={() => removeItem(index)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</section>

          {/* Invoice Summary Card */}
          <section className="p-6 border bg-slate-50/50 rounded-xl border-slate-100">
            <h3 className="mb-4 text-sm font-bold tracking-wider uppercase text-slate-500">Invoice Summary</h3>
            <div className="pb-4 space-y-3 text-sm border-b text-slate-600">
              <div className="flex justify-between"><span>Total Items:</span><span>{items.length}</span></div>
              <div className="flex justify-between"><span>Total Quantity:</span><span>{items.reduce((s, i) => s + i.qty, 0)}</span></div>
            </div>
            <div className="py-4 space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold">Coin Adjustment:</span>
                <input 
                  type="number" 
                  value={coinAdjustment} 
                  onChange={(e) => setCoinAdjustment(e.target.value)}
                  className="w-24 p-2 text-right border rounded" 
                />
              </div>
              <div className="flex justify-between pt-4 text-xl font-extrabold text-blue-700 border-t">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </section>

          <div className="flex justify-center mt-8">
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-10 py-3 font-bold text-white transition rounded-lg shadow-lg bg-slate-700 hover:bg-slate-800"
            >
              <span>💾</span> Save 
            </button>
          </div>
        </div>

        <div className="py-4 text-sm text-center bg-slate-800 text-slate-300">
          © 2025 Estimate. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default App;

