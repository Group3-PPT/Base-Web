import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PropertyDetail from "./pages/PropertyDetail";
import PropertyForm from "./pages/PropertyForm";
import AdminPage from "./pages/AdminPage";
import ImportPage from "./pages/ImportPage";

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight hover:text-blue-200">
          BDS App
        </Link>
        <div className="flex gap-4 text-sm">
          <Link to="/" className="hover:text-blue-200">Trang chủ</Link>
          <Link to="/admin" className="hover:text-blue-200">Quản lý</Link>
          <Link to="/import" className="hover:text-blue-200">Import</Link>
          <Link to="/create" className="bg-white text-blue-600 px-3 py-1 rounded-lg font-semibold hover:bg-blue-50">
            + Đăng tin
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/create" element={<PropertyForm />} />
          <Route path="/edit/:id" element={<PropertyForm />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/import" element={<ImportPage />} />
        </Routes>
      </main>
    </div>
  );
}
