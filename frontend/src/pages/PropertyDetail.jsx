import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProperty } from "../services/api";
import L from "leaflet";
import { useRef, useEffect as useLeafletEffect } from "react";

function formatPrice(price) {
  if (!price) return "Liên hệ";
  if (price >= 1e9) return (price / 1e9).toFixed(1) + " tỷ";
  if (price >= 1e6) return (price / 1e6).toFixed(0) + " triệu";
  return price.toLocaleString("vi-VN") + " đ";
}

function MapComponent({ lat, lng }) {
  const mapRef = useRef(null);
  useLeafletEffect(() => {
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
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    getProperty(id).then(({ data }) => {
      setProperty(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-400">Đang tải...</div>;
  if (!property) return <div className="text-center py-20 text-gray-400">Không tìm thấy</div>;

  const images = property.images || [];

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="text-blue-600 hover:underline text-sm mb-4 inline-block">&larr; Quay lại</Link>

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
          <h1 className="text-2xl font-bold text-gray-800">{property.title}</h1>
          <p className="text-gray-500 mt-1">{property.address}{property.district ? `, ${property.district}` : ""}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
            {property.area && <div><p className="text-xs text-gray-400">Diện tích</p><p className="font-semibold">{property.area} m²</p></div>}
            {property.width && <div><p className="text-xs text-gray-400">Chiều rộng</p><p className="font-semibold">{property.width} m</p></div>}
            {property.structure && <div><p className="text-xs text-gray-400">Kết cấu</p><p className="font-semibold">{property.structure}</p></div>}
            {property.listing_type && <div><p className="text-xs text-gray-400">Loại</p><p className="font-semibold">{property.listing_type === "rent" ? "Cho thuê" : "Bán"}</p></div>}
          </div>

          {property.notes && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Ghi chú</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{property.notes}</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Liên hệ</h3>
            <p className="text-gray-800 font-semibold">Lê Trung Hiếu</p>
            <a href="tel:0797569011" className="text-blue-600 font-semibold text-lg">0797 569 011</a>
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
