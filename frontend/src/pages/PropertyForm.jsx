import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createProperty, updateProperty, getProperty, uploadFile, uploadImages, deleteImage } from "../services/api";
import { compressImage } from "../utils/compressImage";

const DISTRICTS = ["Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8", "Quận 9", "Quận 10", "Quận 11", "Quận 12", "Bình Thạnh", "Gò Vấp", "Phú Nhuận", "Tân Bình", "Tân Phú", "Bình Tân", "Thủ Đức", "Hóc Môn", "Củ Chi", "Bình Chánh", "Nhà Bè", "Cần Giờ"];

const emptyForm = {
  title: "", address: "", district: "", city: "TP.HCM",
  width: "", length: "", area: "", structure: "",
  listing_type: "sale", price: "", currency: "VND",
  description: "", contact_name: "", contact_phone: "",
  latitude: "", longitude: "", notes: "",
};

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      getProperty(id).then(({ data }) => {
        setForm({
          title: data.title || "", address: data.address || "", district: data.district || "",
          city: data.city || "TP.HCM", width: data.width || "", length: data.length || "",
          area: data.area || "", structure: data.structure || "", listing_type: data.listing_type || "sale",
          price: data.price || "", currency: data.currency || "VND", description: data.description || "",
          contact_name: data.contact_name || "", contact_phone: data.contact_phone || "",
          latitude: data.latitude || "", longitude: data.longitude || "", notes: data.notes || "",
        });
        setExistingImages(data.images || []);
      });
    }
  }, [id]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    const uploaded = [];

    for (const file of files) {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("image", compressed);
      try {
        const { data } = await uploadFile(formData);
        uploaded.push(data.url);
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }

    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
    e.target.value = "";
  };

  const handleRemoveNewImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveExistingImage = async (imgId) => {
    await deleteImage(imgId);
    setExistingImages((prev) => prev.filter((i) => i.id !== imgId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      width: form.width ? Number(form.width) : null,
      length: form.length ? Number(form.length) : null,
      area: form.area ? Number(form.area) : null,
      price: Number(form.price) || 0,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
    };

    try {
      let propertyId = id;
      if (isEdit) {
        await updateProperty(id, payload);
      } else {
        const { data } = await createProperty(payload);
        propertyId = data.id;
      }

      if (images.length > 0) {
        await uploadImages({ property_id: propertyId, images });
      }

      navigate(`/property/${propertyId}`);
    } catch (err) {
      console.error(err);
      alert("Lỗi lưu dữ liệu");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? "Sửa bất động sản" : "Đăng tin mới"}</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
          <input name="title" value={form.title} onChange={handleChange} required
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ *</label>
          <input name="address" value={form.address} onChange={handleChange} required
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
            <select name="district" value={form.district} onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Chọn quận</option>
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
            <input name="city" value={form.city} onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chiều rộng (m)</label>
            <input name="width" type="number" step="0.1" value={form.width} onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chiều dài (m)</label>
            <input name="length" type="number" step="0.1" value={form.length} onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích (m²)</label>
            <input name="area" type="number" step="0.1" value={form.area} onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kết cấu</label>
          <input name="structure" value={form.structure} onChange={handleChange} placeholder="Ví dụ: 2 tầng, 1 trệt 1 lầu..."
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại hình *</label>
            <select name="listing_type" value={form.listing_type} onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="sale">Bán</option>
              <option value="rent">Cho thuê</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VND) *</label>
            <input name="price" type="number" value={form.price} onChange={handleChange} required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên liên hệ</label>
            <input name="contact_name" value={form.contact_name} onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SĐT liên hệ</label>
            <input name="contact_phone" value={form.contact_phone} onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vĩ độ (Latitude)</label>
            <input name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kinh độ (Longitude)</label>
            <input name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
          <input type="file" accept="image/*" multiple onChange={handleFileChange}
            className="w-full border rounded-lg px-3 py-2 text-sm" />
          {uploading && <p className="text-sm text-blue-500 mt-1">Đang upload...</p>}

          <div className="flex flex-wrap gap-3 mt-3">
            {existingImages.map((img) => (
              <div key={img.id} className="relative">
                <img src={img.image_url} className="w-24 h-20 object-cover rounded border" />
                <button type="button" onClick={() => handleRemoveExistingImage(img.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs hover:bg-red-600">x</button>
              </div>
            ))}
            {images.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} className="w-24 h-20 object-cover rounded border" />
                <button type="button" onClick={() => handleRemoveNewImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs hover:bg-red-600">x</button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Đăng tin"}
          </button>
          <button type="button" onClick={() => navigate(-1)}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300">
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
