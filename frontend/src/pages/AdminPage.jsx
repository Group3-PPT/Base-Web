import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProperties, updateStatus, deleteProperty } from "../services/api";
import * as XLSX from "xlsx";

function formatPrice(price) {
  if (!price) return "Liên hệ";
  if (price >= 1e9) return (price / 1e9).toFixed(1) + " tỷ";
  if (price >= 1e6) return (price / 1e6).toFixed(0) + " triệu";
  return price.toLocaleString("vi-VN") + " đ";
}

export default function AdminPage() {
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, status: "", listing_type: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await getProperties({ ...filters, limit: 20 });
      setProperties(data?.data || data?.properties || []);
      setPagination(data?.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error(err);
      setProperties([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filters.page, filters.status, filters.listing_type]);

  const handleStatus = async (id, status) => {
    await updateStatus(id, status);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa bất động sản này?")) return;
    await deleteProperty(id);
    fetchData();
  };

  const exportExcel = () => {
    const data = properties.map((p) => ({
      ID: p.id,
      "Tiêu đề": p.title,
      "Địa chỉ": p.address,
      "Quận": p.district,
      "Thành phố": p.city,
      "Diện tích (m²)": p.area,
      "Loại": p.listing_type === "rent" ? "Cho thuê" : "Bán",
      "Giá": p.price,
      "Trạng thái": p.status === "available" ? "Còn trống" : p.status === "rented" ? "Đã cho thuê" : "Đã bán",
      "Liên hệ": p.contact_name,
      "SĐT": p.contact_phone,
      "Ngày tạo": p.created_at,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BDS");
    XLSX.writeFile(wb, "bds_export.xlsx");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý bất động sản</h1>
        <button onClick={exportExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
          Xuất Excel
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
          className="border rounded-lg px-3 py-2 text-sm">
          <option value="">Tất cả trạng thái</option>
          <option value="available">Còn trống</option>
          <option value="rented">Đã cho thuê</option>
          <option value="sold">Đã bán</option>
        </select>
        <select value={filters.listing_type} onChange={(e) => setFilters((f) => ({ ...f, listing_type: e.target.value, page: 1 }))}
          className="border rounded-lg px-3 py-2 text-sm">
          <option value="">Tất cả loại</option>
          <option value="sale">Bán</option>
          <option value="rent">Cho thuê</option>
        </select>
      </div>

      <p className="text-sm text-gray-500 mb-3">{pagination.total} kết quả</p>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Đang tải...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Tiêu đề</th>
                  <th className="px-4 py-3 font-medium">Địa chỉ</th>
                  <th className="px-4 py-3 font-medium">Diện tích</th>
                  <th className="px-4 py-3 font-medium">Giá</th>
                  <th className="px-4 py-3 font-medium">Loại</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{p.id}</td>
                    <td className="px-4 py-3 font-medium max-w-[200px] truncate">
                      <Link to={`/property/${p.id}`} className="text-blue-600 hover:underline">{p.title}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{p.address}</td>
                    <td className="px-4 py-3">{p.area ? `${p.area} m²` : "-"}</td>
                    <td className="px-4 py-3 font-semibold text-red-600">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${p.listing_type === "rent" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                        {p.listing_type === "rent" ? "Thuê" : "Bán"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select value={p.status} onChange={(e) => handleStatus(p.id, e.target.value)}
                        className={`border rounded px-2 py-1 text-xs ${p.status === "available" ? "border-yellow-300 bg-yellow-50" : p.status === "rented" ? "border-purple-300 bg-purple-50" : "border-red-300 bg-red-50"}`}>
                        <option value="available">Còn trống</option>
                        <option value="rented">Đã cho thuê</option>
                        <option value="sold">Đã bán</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/edit/${p.id}`} className="text-yellow-600 hover:underline text-xs">Sửa</Link>
                        <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline text-xs">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button key={page} onClick={() => setFilters((f) => ({ ...f, page }))}
              className={`px-3 py-1 rounded-lg text-sm ${page === filters.page ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}>
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
