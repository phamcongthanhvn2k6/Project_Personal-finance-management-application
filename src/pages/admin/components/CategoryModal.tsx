import React, { useState, useEffect } from "react";
// hàm upload ảnh đã viết ở apis/core/category.api
// uploadImageToCloudinary(file: File) => Promise<string> (trả về secure_url)
import { uploadImageToCloudinary } from "../../../apis/core/category.api";

/**
 * Props của modal:
 * - open: modal đang mở hay đóng
 * - onClose: callback đóng modal
 * - editingCategory: nếu không null => modal đang ở chế độ edit, có data để fill form
 * - onSubmit: callback khi nhấn Save, truyền về dữ liệu {name, imageUrl, status}
 */
interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  editingCategory: {
    id: number;
    name: string;
    imageUrl: string;
    status: boolean;
  } | null;
  onSubmit: (data: { name: string; imageUrl: string; status: boolean }) => void;
}

export default function CategoryModal({
  open,
  onClose,
  editingCategory,
  onSubmit,
}: CategoryModalProps) {
  // --------------------------
  // Local state của component
  // --------------------------

  // name: tên category (text input)
  const [name, setName] = useState("");

  // imageUrl: url ảnh (sau khi upload thành công lưu vào đây)
  const [imageUrl, setImageUrl] = useState("");

  // status: trạng thái active/inactive (checkbox / toggle đơn giản)
  const [status, setStatus] = useState(true);

  // uploading: cờ báo có đang upload ảnh lên Cloudinary hay không
  const [uploading, setUploading] = useState(false);

  // fileName: lưu tên file hiển thị trong preview (không bắt buộc nhưng tốt UX)
  const [fileName, setFileName] = useState("");

  // --------------------------
  // Khi editingCategory thay đổi (vào chế độ edit hoặc thoát edit)
  // --------------------------
  useEffect(() => {
    if (editingCategory) {
      // Nếu có dữ liệu edit -> đổ dữ liệu vào form
      setName(editingCategory.name);
      setImageUrl(editingCategory.imageUrl);
      setStatus(editingCategory.status);
      // fileName có thể không có nếu URL là link đã upload trước đó
      setFileName(""); 
    } else {
      // Nếu không có editingCategory -> reset form (chế độ tạo mới)
      setName("");
      setImageUrl("");
      setStatus(true);
      setFileName("");
    }
    // effect phụ thuộc vào editingCategory
  }, [editingCategory]);

  // --------------------------
  // Hàm xử lý upload file
  // - nhận input file từ <input type="file" />
  // - gọi uploadImageToCloudinary(file) để upload, lấy url trả về
  // - cập nhật imageUrl state khi upload xong
  // - xử lý trạng thái uploading để disable nút Save trong lúc upload
  // --------------------------
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // lấy file đầu tiên (nếu người dùng chọn nhiều file thì chỉ lấy file[0])
    const file = e.target.files?.[0];
    if (!file) return; // nếu không có file thì bỏ qua

    setUploading(true);        // bật trạng thái uploading
    setFileName(file.name);     // lưu tên file để hiển thị

    try {
      // gọi API upload (trong Apis/core/category.api)
      // trả về secure_url (string)
      const url = await uploadImageToCloudinary(file);
      setImageUrl(url); // set url vào state để preview + gửi về server khi lưu
    } catch (err) {
      // xử lý lỗi upload: ở đây đơn giản alert, bạn có thể dùng toast
      alert("❌ Upload failed!");
      console.error("Upload error:", err);
    } finally {
      // luôn tắt uploading dù thành công hay lỗi
      setUploading(false);
    }
  };

  // --------------------------
  // Xoá ảnh đã upload (chỉ xóa link trên client)
  // Nếu bạn muốn xóa file trên Cloudinary luôn, cần gọi API Cloudinary delete (thường yêu cầu signed request)
  // --------------------------
  const handleRemoveImage = () => {
    setImageUrl("");
    setFileName("");
  };

  // --------------------------
  // Xử lý submit form
  // - Kiểm tra upload đang chạy -> chặn lưu
  // - Validate bắt buộc: name.trim() không rỗng, imageUrl phải có (bắt buộc theo UI hiện tại)
  // - Gọi onSubmit(data) truyền dữ liệu lên parent (parent sẽ gọi API tạo/sửa trên server)
  // - Đóng modal sau khi gọi onSubmit
  // --------------------------
  const handleSubmit = () => {
    if (uploading) {
      // nếu đang upload, yêu cầu user chờ
      alert("⏳ Vui lòng chờ ảnh upload xong!");
      return;
    }

    // validate cơ bản
    if (!name.trim() || !imageUrl) {
      alert("⚠️ Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // gọi callback onSubmit ở parent
    onSubmit({ name: name.trim(), imageUrl, status });

    // close modal (parent có thể refresh list sau khi onSubmit hoàn tất)
    onClose();
  };

  // Nếu modal đóng -> không render gì (null)
  if (!open) return null;

  // --------------------------
  // JSX UI: modal overlay + dialog
  // - backdrop blur + center container
  // - input name, upload button, preview image
  // - Cancel / Save button
  // --------------------------
  return (
    <div className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-[420px] p-6 relative">
        {/* Title */}
        <h2 className="text-md font-semibold mb-4 text-gray-700">
          Form Category
        </h2>

        {/* Form body */}
        <div className="space-y-4">
          {/* Name field */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Name <span className="text-red-500">*</span>
            </label>

            {/* input name */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)} // cập nhật state name
              className="w-full border px-3 py-2 rounded-md text-sm focus:ring-1 focus:ring-orange-400 focus:border-orange-400 outline-none"
              placeholder="Enter category name..."
            />
          </div>

          {/* Image upload */}
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">Image</label>

            {/* Styled label như button để kích file input */}
            <label className="w-full flex justify-center items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md py-2 cursor-pointer transition">
              <i className="fa-solid fa-upload text-white"></i>
              <span>Upload Image</span>

              {/* Hidden file input: khi thay đổi file -> handleImageUpload */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {/* Show uploading state */}
            {uploading && (
              <p className="text-xs text-orange-500 mt-2">Uploading...</p>
            )}

            {/* Nếu có imageUrl (upload xong hoặc edit mode có url) -> show preview + file name + remove button */}
            {!uploading && imageUrl && (
              <div className="flex items-center justify-between border rounded-md px-3 py-2 mt-3">
                <div className="flex items-center gap-3">
                  {/* thumbnail preview */}
                  <img
                    src={imageUrl}
                    alt="preview"
                    className="w-12 h-12 rounded-md object-cover border"
                  />
                  {/* nếu fileName rỗng (ví dụ edit có URL cũ) bạn có thể hiển thị "Uploaded image" */}
                  <span className="text-sm text-gray-700">
                    {fileName || "Uploaded image"}
                  </span>
                </div>

                {/* nút remove image (chỉ remove ở client-side) */}
                <button
                  onClick={handleRemoveImage}
                  className="text-red-500 hover:text-red-600"
                  title="Remove image"
                  type="button"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer: Cancel + Save */}
        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
          {/* Cancel sẽ gọi onClose không thay đổi dữ liệu */}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm transition"
            type="button"
          >
            Cancel
          </button>

          {/* Save: disabled khi đang uploading */}
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className={`px-4 py-2 rounded-md text-white text-sm ${
              uploading
                ? "bg-orange-300 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
            type="button"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
