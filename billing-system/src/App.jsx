import { Routes, Route, Navigate } from "react-router-dom";
import Sales from "./Sale";
import CreateSale from "./CreateSale";
import Items from "./Item";

export default function App() {
  return (
    <Routes>
      {/* Default route */}
      <Route path="/" element={<Navigate to="/sales/create" />} />

      {/* Sales */}
      <Route path="/sales" element={<Sales />} />

      {/* Create sale */}
      <Route path="/sales/create" element={<CreateSale />} />

      {/* Edit sale */}
      <Route path="/sales/edit" element={<CreateSale />} />

      {/* Items */}
      <Route path="/items" element={<Items />} />

      {/* 404 */}
      <Route
        path="*"
        element={<div className="p-6 text-red-600">Page Not Found</div>}
      />
    </Routes>
  );
}
