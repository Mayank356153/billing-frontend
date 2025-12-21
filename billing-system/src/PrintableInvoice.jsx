import React from "react";

const PrintableInvoice = ({ data, onClose }) => {
  if (!data) return null;

  const handlePrint = () => {
    const content = document.getElementById("invoice-content");
    if (!content) return;

    const printWindow = window.open("", "", "width=900,height=1200");

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            @page {
              size: A4;
              margin: 12mm;
            }

            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #000;
              margin: 0;
              padding: 0;
            }

            h1, h2, h3 {
              margin: 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              page-break-inside: auto;
            }

            thead {
              display: table-header-group;
            }

            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }

            th, td {
              border: 1px solid #000;
              padding: 6px;
              font-size: 11px;
            }

            th {
              background: #f2f2f2;
              font-weight: bold;
            }

            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .uppercase { text-transform: uppercase; }

            .summary {
              margin-top: 10px;
              page-break-inside: avoid;
            }

            .terms {
              font-size: 10px;
              margin-top: 10px;
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 no-print">
      <div className="w-full max-w-[900px] bg-white p-6">

        {/* Controls (not printed) */}
        <div className="flex justify-between mb-4 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 hover:cursor-pointer"
          >
            ← Back
          </button>

          <button
            onClick={handlePrint}
            className="px-6 py-2 font-bold text-white bg-black rounded"
          >
            Print A4 Invoice
          </button>
        </div>

        {/* ================= PRINT AREA ================= */}
        <div id="invoice-content">

          <h2 className="text-center uppercase font-bold text-[16px] mb-1">
            Tax Invoice / Bill of Supply
          </h2>
          <p className="text-center text-[10px] mb-6">
            Original for Recipient
          </p>

          {/* Customer + Invoice Info */}
          <table style={{ marginBottom: "10px" }}>
            <tbody>
              <tr>
                <td width="60%">
                  <strong>Bill To:</strong><br />
                  {data.customer?.name || data.customerName}<br />
                  Mobile: {data.customer?.phone || data.phoneNumber || "-"}<br />
                  GSTIN: {data.customer?.gstNumber || data.gstNumber || "-"}
                </td>
                <td width="40%">
                  Invoice No: {data.billId}<br />
                  Date: {new Date(data.date).toLocaleDateString("en-IN")}<br />
                  Payment: Cash
                </td>
              </tr>
            </tbody>
          </table>

          {/* Items Table */}
          <table>
            <thead>
              <tr>
                <th width="5%">#</th>
                <th>Item Name</th>
                <th width="8%">Qty</th>
                <th width="12%">MRP</th>
                <th width="12%">Rate</th>
                <th width="15%">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="text-center">{idx + 1}</td>
                  <td className="uppercase">{item.name}</td>
                  <td className="text-center">{item.qty}</td>
                  <td className="text-right">{item.mrp || item.rate}</td>
                  <td className="text-right">{item.rate}</td>
                  <td className="text-right">
                    ₹{(item.qty * item.rate).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary (won't break across pages) */}
          <table className="summary">
            <tbody>
              <tr>
                <td width="70%" className="terms">
                  <strong>Terms & Conditions:</strong><br />
                  1. Goods once sold will not be taken back.<br />
                  2. All disputes subject to jurisdiction.
                </td>
                <td width="30%">
                  <table>
                    <tbody>
                      <tr>
                        <td>Sub-Total</td>
                        <td className="text-right">
                          ₹{data.subtotal.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Grand Total</strong></td>
                        <td className="text-right">
                          <strong>₹{data.grandTotal.toFixed(2)}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

        </div>
        {/* ============== END PRINT AREA ============== */}

      </div>
    </div>
  );
};

export default PrintableInvoice;
