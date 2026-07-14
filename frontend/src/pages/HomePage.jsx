import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProperties } from "../services/api";

function formatPrice(price) {
  if (!price) return "Liên hệ";
  if (price >= 1e9) return (price / 1e9).toFixed(1) + " tỷ";
  if (price >= 1e6) return (price / 1e6).toFixed(0) + " triệu";
  return price.toLocaleString("vi-VN") + " đ";
}

function PropertyCard({ property }) {
  return (
    <Link to={`/property/${property.id}`} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group">
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {property.thumbnail ? (
          <img src={property.thumbnail} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Không có ảnh</div>
        )}
        <span className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold text-white ${property.listing_type === "rent" ? "bg-green-500" : "bg-blue-500"}`}>
          {property.listing_type === "rent" ? "Cho thuê" : "Bán"}
        </span>
        <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${property.status === "available" ? "bg-yellow-400 text-yellow-900" : property.status === "rented" ? "bg-purple-500 text-white" : "bg-red-500 text-white"}`}>
          {property.status === "available" ? "Còn trống" : property.status === "rented" ? "Đã cho thuê" : "Đã bán"}
        </span>
        {property.image_count > 1 && (
          <span className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-0.5 rounded text-xs">
            {property.image_count} ảnh
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-blue-600">{property.title}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{property.address}</p>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
          {property.area && <span>{property.area} m²</span>}
          {property.district && <span>{property.district}</span>}
        </div>
        <p className="text-sm text-gray-500 mt-2">Liên hệ: <span className="font-semibold text-gray-700">0797 569 011</span></p>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ district: "", search: "", page: 1 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await getProperties(filters);
      setProperties(data?.data || data?.properties || []);
      setPagination(data?.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error(err);
      setProperties([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filters.page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, page: 1 }));
    fetchData();
  };

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">Tìm kiếm</label>
            <input type="text" placeholder="Tiêu đề, địa chỉ..." value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="min-w-[160px]">
            <label className="block text-xs text-gray-500 mb-1">Quận/Huyện</label>
            <select value={filters.district} onChange={(e) => setFilters((f) => ({ ...f, district: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Tất cả</option>
              <option value="Quận 1">Quận 1</option>
              <option value="Quận 2">Quận 2</option>
              <option value="Quận 3">Quận 3</option>
              <option value="Quận 7">Quận 7</option>
              <option value="Bình Thạnh">Bình Thạnh</option>
              <option value="Gò Vấp">Gò Vấp</option>
              <option value="Phú Nhuận">Phú Nhuận</option>
              <option value="Tân Bình">Tân Bình</option>
              <option value="Thủ Đức">Thủ Đức</option>
            </select>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
            Tìm kiếm
          </button>
        </form>
      </div>

      <p className="text-sm text-gray-500 mb-4">{pagination.total} kết quả</p>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Đang tải...</div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 text-gray-400">Không tìm thấy bất động sản nào</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
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
