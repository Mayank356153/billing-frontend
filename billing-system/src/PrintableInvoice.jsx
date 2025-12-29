import React from "react";

const PrintableInvoice = ({ data, onClose }) => {
  if (!data) return null;

  // 🔹 Calculations
  const totalMRP = data.items.reduce(
    (sum, item) => sum + (item.itemId?.mrp || 0) * item.qty,
    0
  );

  const totalSalesPrice = data.items.reduce(
    (sum, item) => sum + item.rate * item.qty,
    0
  );

  const hasDiscount = data.items.some(
    (item) => item.itemId?.discountPercentage > 0
  );

  const totalDiscount = totalMRP - totalSalesPrice;

  const handlePrint = () => {
    const content = document.getElementById("invoice-content");
    if (!content) return;

    const printWindow = window.open("", "", "width=900,height=1200");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${data.billId}</title>
          <style>
            @page { size: A4; margin: 12mm; }
            body { font-family: Arial, sans-serif; color: #000; margin: 0; padding: 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            th, td { border: 1px solid #000; padding: 6px; font-size: 11px; }
            th { background: #f2f2f2; font-weight: bold; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .uppercase { text-transform: uppercase; }
            .summary { margin-top: 10px; page-break-inside: avoid; }
            .terms { font-size: 10px; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/70 no-print overflow-y-auto p-4">
      {/* Modal Container */}
      <div className="relative w-full max-w-[900px] bg-white p-6 my-auto shadow-2xl rounded-sm">
        
        {/* Sticky Controls: Yeh buttons hamesha upar rahenge scroll ke waqt */}
        <div className="flex justify-between items-center mb-4 no-print sticky top-0 bg-white py-4 border-b z-20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 font-medium transition-colors"
          >
            ← Back to Dashboard
          </button>

          <button
            onClick={handlePrint}
            className="px-8 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-md transition-all"
          >
            Print A4 Invoice
          </button>
        </div>

        {/* ================= PRINT AREA ================= */}
        <div id="invoice-content" className="bg-white">
          <h2 className="text-center uppercase font-bold text-[18px] mb-1">
            Tax Invoice / Bill of Supply
          </h2>
          <p className="text-center text-[10px] mb-6 border-b pb-2">
            Original for Recipient
          </p>

          {/* Customer + Invoice Info */}
          <table className="w-full mb-4">
            <tbody>
              <tr>
                <td width="60%" className="align-top">
                  <div className="font-bold border-b mb-1">Bill To:</div>
                  <div className="text-[12px]">
                    <span className="font-bold">{data.customer?.name || data.customerName}</span><br />
                    Mobile: {data.customer?.phone || data.phoneNumber || "-"}<br />
                    GSTIN: {data.customer?.gstNumber || data.gstNumber || "-"}
                  </div>
                </td>
                <td width="40%" className="align-top text-[12px]">
                  <strong>Invoice No:</strong> {data.billId}<br />
                  <strong>Date:</strong> {new Date(data.date).toLocaleDateString("en-IN")}<br />
                  <strong>Payment Mode:</strong> {data.paymentMode || "Cash"}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Items Table */}
          <table className="w-full">
            <thead>
              <tr>
                <th width="5%">#</th>
                <th>Item Name</th>
                <th width="8%">Qty</th>
                <th width="12%">MRP</th>
                <th width="12%">Rate</th>
                {hasDiscount && <th width="10%">Disc %</th>}
                <th width="15%">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="text-center">{idx + 1}</td>
                  <td className="uppercase font-medium">{item.name || item.itemId?.name}</td>
                  <td className="text-center">{item.qty}</td>
                  <td className="text-right">{item.itemId?.mrp?.toFixed(2) || "0.00"}</td>
                  <td className="text-right"> {item.itemId?.discountPercentage > 0
                        ? `-`
                        : `${item.rate.toFixed(2)}`}</td>
                  
                    <td className="text-right">
                      {item.itemId?.discountPercentage > 0
                        ? `${item.itemId.discountPercentage}%`
                        : "-"}
                    </td>
                 
                  <td className="text-right font-bold">
                    ₹{(item.qty * item.rate).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Section */}
          <table className="summary">
            <tbody>
              <tr>
                <td width="65%" className="terms align-top">
                  <p className="font-bold mb-1">Terms & Conditions:</p>
                  <ol className="pl-4 m-0">
                    <li>Goods once sold will not be taken back or exchanged.</li>
                    <li>All disputes are subject to local jurisdiction only.</li>
                  </ol>
                </td>
                <td width="35%" className="p-0">
                  <table className="w-full m-0" style={{ border: "none" }}>
                    <tbody>
                      <tr>
                        <td className="border-0">Balance</td>
                        <td className="text-right border-0">₹{data.coinAdjustment.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="border-0">Total MRP</td>
                        <td className="text-right border-0">₹{totalMRP.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="border-0">Total Discount</td>
                        <td className="text-right border-0 text-green-600">- ₹{totalDiscount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="border-0 font-bold border-t">Grand Total</td>
                        <td className="text-right font-bold border-t text-[14px]">
                          ₹{data.grandTotal.toFixed(2)}
                        </td>
                      </tr>
                     
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Signature Space */}
          <div className="mt-8 flex justify-end">
            <div className="text-center border-t border-black pt-1 w-[150px] text-[10px]">
              Authorised Signatory
            </div>
          </div>
        </div>
        {/* ============== END PRINT AREA ============== */}

      </div>
    </div>
  );
};

export default PrintableInvoice;