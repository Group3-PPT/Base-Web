import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getProperty } from "../services/api";
import L from "leaflet";

function MapComponent({ lat, lng }) {
  const mapRef = useRef(null);
  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;
    const map = L.map(mapRef.current).setView([lat, lng], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(map);
    L.marker([lat, lng]).addTo(map);
    return () => map.remove();
  }, [lat, lng]);
  return <div ref={mapRef} className="h-72 rounded-lg" />;
}

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    getProperty(id).then(({ data }) => {
      setProperty(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto animate-pulse space-y-5">
        <div className="h-5 bg-gray-200 rounded w-28" />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div className="h-96 bg-gray-100" />
          <div className="p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-20 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) return <div className="text-center py-20 text-gray-400">Không tìm thấy</div>;

  const images = property.images || [];

  return (
    <div className="max-w-5xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium mb-5 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Quay lại
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
        {images.length > 0 ? (
          <div>
            <div className="relative h-[26rem] bg-gray-900">
              <img src={images[currentImage]?.image_url} alt="" className="w-full h-full object-contain" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setCurrentImage((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white w-10 h-10 rounded-full hover:bg-black/70 transition-colors flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button onClick={() => setCurrentImage((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white w-10 h-10 rounded-full hover:bg-black/70 transition-colors flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </>
              )}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-medium">
                {currentImage + 1} / {images.length}
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50 border-t border-gray-100">
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setCurrentImage(i)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === currentImage ? "border-blue-500 ring-1 ring-blue-200" : "border-transparent hover:border-gray-300"}`}>
                    <img src={img.image_url} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center bg-gray-50">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
          </div>
        )}

        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${property.listing_type === "rent" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
              {property.listing_type === "rent" ? "CHO THUÊ" : "BÁN"}
            </span>
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${property.status === "available" ? "bg-amber-100 text-amber-700" : property.status === "rented" ? "bg-violet-100 text-violet-700" : "bg-red-100 text-red-700"}`}>
              {property.status === "available" ? "CÒN TRỐNG" : property.status === "rented" ? "ĐÃ CHO THUÊ" : "ĐÃ BÁN"}
            </span>
          </div>

          <h1 className="text-xl font-bold text-gray-900">{property.title}</h1>
          <div className="flex items-center gap-1.5 mt-2 text-gray-500">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="text-sm">{property.address}{property.district ? `, ${property.district}` : ""}{property.city ? `, ${property.city}` : ""}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {property.area && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-xs text-blue-500 font-medium">Diện tích</p>
                <p className="text-lg font-bold text-blue-800">{property.area} m²</p>
              </div>
            )}
            {property.width && (
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <p className="text-xs text-emerald-500 font-medium">Chiều rộng</p>
                <p className="text-lg font-bold text-emerald-800">{property.width} m</p>
              </div>
            )}
            {property.structure && (
              <div className="bg-violet-50 rounded-lg p-3 border border-violet-100">
                <p className="text-xs text-violet-500 font-medium">Kết cấu</p>
                <p className="text-sm font-bold text-violet-800">{property.structure}</p>
              </div>
            )}
            {property.listing_type && (
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <p className="text-xs text-amber-500 font-medium">Loại hình</p>
                <p className="text-sm font-bold text-amber-800">{property.listing_type === "rent" ? "Cho thuê" : "Bán"}</p>
              </div>
            )}
          </div>

          {property.notes && (
            <div className="mt-5 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2 text-sm">Ghi chú</h3>
              <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">{property.notes}</p>
            </div>
          )}

          <div className="mt-5 bg-blue-600 rounded-xl p-5 text-white">
            <p className="text-xs text-blue-200 uppercase tracking-wider font-medium mb-2">Liên hệ</p>
            <p className="font-bold text-lg">Lê Trung Hiếu</p>
            <a href="tel:0797569011" className="text-blue-100 hover:text-white font-semibold flex items-center gap-2 mt-1 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              0797 569 011
            </a>
          </div>

          {property.latitude && property.longitude && (
            <div className="mt-5">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm">Vị trí trên bản đồ</h3>
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <MapComponent lat={property.latitude} lng={property.longitude} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
