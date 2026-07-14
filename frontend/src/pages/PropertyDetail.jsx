import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProperty, deleteProperty, updateStatus } from "../services/api";
import L from "leaflet";
import { useRef, useEffect } from "react";

function formatPrice(price) {
  if (!price) return "Liên hệ";
  if (price >= 1e9) return (price / 1e9).toFixed(1) + " tỷ";
  if (price >= 1e6) return (price / 1e6).toFixed(0) + " triệu";
  return price.toLocaleString("vi-VN") + " đ";
}

function MapComponent({ lat, lng }) {
  const mapRef = useRef(null);
  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;
    const map = L.map(mapRef.current).setView([lat, lng], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(map);
    L.marker([lat, lng]).addTo(map);
    return () => map.remove();
  }, [lat, lng]);
  return <div ref={mapRef} className="h-64 rounded-lg" />;
}

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    getProperty(id).then(({ data }) => {
      setProperty(data);
      setLoading(false);
    });
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Xóa bất động sản này?")) return;
    await deleteProperty(id);
    navigate("/");
  };

  const handleStatus = async (status) => {
    const { data } = await updateStatus(id, status);
    setProperty(data);
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Đang tải...</div>;
  if (!property) return <div className="text-center py-20 text-gray-400">Không tìm thấy</div>;

  const images = property.images || [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="text-blue-600 hover:underline text-sm">&larr; Quay lại</Link>
        <div className="flex gap-2">
          <Link to={`/edit/${id}`} className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600">Sửa</Link>
          <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">Xóa</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {images.length > 0 ? (
          <div>
            <div className="relative h-96 bg-gray-900">
              <img src={images[currentImage]?.image_url} alt="" className="w-full h-full object-contain" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setCurrentImage((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full hover:bg-black/70">&lsaquo;</button>
                  <button onClick={() => setCurrentImage((i) => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full hover:bg-black/70">&rsaquo;</button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-2 overflow-x-auto">
                {images.map((img, i) => (
                  <img key={img.id} src={img.image_url} onClick={() => setCurrentImage(i)}
                    className={`w-20 h-16 object-cover rounded cursor-pointer border-2 ${i === currentImage ? "border-blue-500" : "border-transparent"}`} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">Không có ảnh</div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{property.title}</h1>
              <p className="text-gray-500 mt-1">{property.address}</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{formatPrice(property.price)}</p>
          </div>

          <div className="flex gap-2 mt-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${property.listing_type === "rent" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
              {property.listing_type === "rent" ? "Cho thuê" : "Bán"}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${property.status === "available" ? "bg-yellow-100 text-yellow-700" : property.status === "rented" ? "bg-purple-100 text-purple-700" : "bg-red-100 text-red-700"}`}>
              {property.status === "available" ? "Còn trống" : property.status === "rented" ? "Đã cho thuê" : "Đã bán"}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
            {property.area && <div><p className="text-xs text-gray-400">Diện tích</p><p className="font-semibold">{property.area} m²</p></div>}
            {property.width && <div><p className="text-xs text-gray-400">Chiều rộng</p><p className="font-semibold">{property.width} m</p></div>}
            {property.length && <div><p className="text-xs text-gray-400">Chiều dài</p><p className="font-semibold">{property.length} m</p></div>}
            {property.structure && <div><p className="text-xs text-gray-400">Kết cấu</p><p className="font-semibold">{property.structure}</p></div>}
          </div>

          {property.description && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-700 mb-2">Mô tả</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{property.description}</p>
            </div>
          )}

          {property.notes && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Ghi chú</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{property.notes}</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Liên hệ</h3>
            <p className="text-gray-600">{property.contact_name || "Chưa có thông tin"}</p>
            <p className="text-gray-600">{property.contact_phone || ""}</p>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-2">Đổi trạng thái</h3>
            <div className="flex gap-2">
              {["available", "rented", "sold"].map((s) => (
                <button key={s} onClick={() => handleStatus(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold ${property.status === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {s === "available" ? "Còn trống" : s === "rented" ? "Đã cho thuê" : "Đã bán"}
                </button>
              ))}
            </div>
          </div>

          {property.latitude && property.longitude && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-700 mb-2">Bản đồ</h3>
              <MapComponent lat={property.latitude} lng={property.longitude} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
