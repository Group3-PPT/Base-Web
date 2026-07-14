import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { importPreview, importConfirm } from "../services/api";

const SAMPLE_TEXT = `Tiêu đề: Nhà phố mới xây
Địa chỉ: 123 Nguyễn Huệ, Phường Bến Nghé
Quận: Quận 1
Giá: 5000000000
Diện tích: 80
Loại: Bán
Liên hệ: Nguyễn Văn A
Điện thoại: 0901234567
Mô tả: Nhà mới xây 3 tầng, hẻm xe hơi
---
Tiêu đề: Căn hộ cho thuê
Địa chỉ: 456 Lê Lợi, Phường Bến Thành
Quận: Quận 1
Giá: 15000000
Diện tích: 60
Loại: Thuê
Liên hệ: Trần Thị B
Điện thoại: 0912345678
Mô tả: Căn hộ 2PN, full nội thất, gầnmetro`;

export default function ImportPage() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const handlePreview = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { data } = await importPreview(text);
      setPreview(data);
    } catch (err) {
      console.error(err);
      alert("Lỗi parse dữ liệu");
    }
    setLoading(false);
  };

  const handleImport = async () => {
    if (!preview || !preview.properties.length) return;
    setImporting(true);
    try {
      await importConfirm(preview.properties);
      alert(`Đã import ${preview.properties.length} bất động sản`);
      navigate("/admin");
    } catch (err) {
      console.error(err);
      alert("Lỗi import");
    }
    setImporting(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Import hàng loạt</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Dán dữ liệu bất động sản</label>
            <button onClick={() => setText(SAMPLE_TEXT)} className="text-xs text-blue-600 hover:underline">Load mẫu</button>
          </div>
          <p className="text-xs text-gray-400 mb-2">
            Mỗi BĐS cách nhau bằng dòng "---". Các trường: Tiêu đề, Địa chỉ, Quận, Giá, Diện tích, Loại, Liên hệ, Điện thoại, Mô tả
          </p>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={15}
            className="w-full border rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Dán dữ liệu vào đây..." />
        </div>

        <div className="flex gap-3">
          <button onClick={handlePreview} disabled={loading || !text.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Đang parse..." : "Xem trước"}
          </button>
          {preview && (
            <button onClick={handleImport} disabled={importing}
              className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50">
              {importing ? "Đang import..." : `Import ${preview.count} BĐS`}
            </button>
          )}
        </div>
      </div>

      {preview && (
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Xem trước ({preview.count} bất động sản)</h2>
          <div className="space-y-3">
            {preview.properties.map((p, i) => (
              <div key={i} className="border rounded-lg p-3 text-sm">
                <p className="font-semibold">{p.title || "Không có tiêu đề"}</p>
                <p className="text-gray-500">{p.address}</p>
                <div className="flex gap-4 mt-1 text-xs text-gray-400">
                  {p.district && <span>{p.district}</span>}
                  {p.area && <span>{p.area} m²</span>}
                  {p.price && <span className="text-red-600 font-semibold">{p.price.toLocaleString("vi-VN")} đ</span>}
                  {p.listing_type && <span>{p.listing_type === "rent" ? "Thuê" : "Bán"}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
