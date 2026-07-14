import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProperties } from "../services/api";

function PropertyCard({ property }) {
  return (
    <Link to={`/property/${property.id}`} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-200/60 hover:-translate-y-0.5">
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {property.thumbnail ? (
          <img src={property.thumbnail} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>
          </div>
        )}
        <div className="absolute top-2.5 left-2.5 flex gap-2">
          <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${property.listing_type === "rent" ? "bg-emerald-500 text-white" : "bg-blue-600 text-white"}`}>
            {property.listing_type === "rent" ? "Thuê" : "Bán"}
          </span>
        </div>
        <div className="absolute top-2.5 right-2.5">
          <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${property.status === "available" ? "bg-amber-400 text-amber-900" : property.status === "rented" ? "bg-violet-500 text-white" : "bg-red-500 text-white"}`}>
            {property.status === "available" ? "Còn trống" : property.status === "rented" ? "Đã thuê" : "Đã bán"}
          </span>
        </div>
        {property.image_count > 1 && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-xs flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {property.image_count}
          </div>
        )}
      </div>
      <div className="p-3.5">
        <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors text-sm">{property.title}</h3>
        <div className="flex items-center gap-1 mt-1.5 text-gray-500">
          <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <p className="text-xs line-clamp-1">{property.address}</p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {property.area && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{property.area} m²</span>}
          {property.district && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{property.district}</span>}
        </div>
        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">Liên hệ: <span className="text-gray-600 font-medium">0797 569 011</span></span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search.trim()) params.search = search.trim();
      const { data } = await getProperties(params);
      setProperties(data?.data || data?.properties || []);
      setPagination(data?.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error(err);
      setProperties([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-4 mb-5">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Tìm kiếm bất động sản theo tên, địa chỉ..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-gray-50 focus:bg-white" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
            Tìm kiếm
          </button>
        </form>
      </div>

      <p className="text-sm text-gray-500 mb-4">{pagination.total} kết quả</p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse border border-gray-200/60">
              <div className="h-48 bg-gray-100" />
              <div className="p-3.5 space-y-2.5">
                <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200/60">
          <svg className="w-14 h-14 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>
          <p className="text-gray-400 text-sm">Không tìm thấy bất động sản nào</p>
          <p className="text-gray-300 text-xs mt-1">Thử thay đổi từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-8">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
            className="w-9 h-9 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            &lsaquo;
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-blue-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {p}
            </button>
          ))}
          <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}
            className="w-9 h-9 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            &rsaquo;
          </button>
        </div>
      )}
    </div>
  );
}
