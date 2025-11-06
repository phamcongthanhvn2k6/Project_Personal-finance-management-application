import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../redux/store";
import { updateUserProfile } from "../../../redux/slices/user.slice"; // 🧠 Action cập nhật thông tin người dùng (trong đó có mật khẩu)

/**
 * 📦 Kiểu props truyền từ component cha (ProfileSection)
 * - open: xác định có hiển thị modal không
 * - onClose: hàm đóng modal (được truyền từ cha)
 */
interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * 🔐 Component: Modal thay đổi mật khẩu người dùng
 */
export default function ChangePasswordModal({
  open,
  onClose,
}: ChangePasswordModalProps) {
  const dispatch = useDispatch<AppDispatch>();

  // 📦 Lấy user hiện tại đang đăng nhập từ Redux store
  const { user } = useSelector((state: RootState) => state.auth);

  // 🧠 Trạng thái local cho các ô input của form
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 🧾 Biến trạng thái hiển thị lỗi / thành công
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 🚪 Nếu modal không mở → không render gì cả
  if (!open) return null;

  /**
   * ✍️ Hàm xử lý khi người dùng nhập vào input
   * - Cập nhật giá trị formData tương ứng với tên input
   * - Reset lại thông báo lỗi/thành công
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  /**
   * 💾 Hàm xử lý khi nhấn "Save"
   * - Kiểm tra hợp lệ các trường nhập
   * - Nếu đúng → gọi Redux action cập nhật mật khẩu (PATCH API)
   */
  const handleSave = async () => {
    if (!user) return; // nếu chưa có user đăng nhập thì không làm gì

    const { oldPassword, newPassword, confirmPassword } = formData;

    // ✅ 1. Kiểm tra nhập đủ thông tin
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // ✅ 2. Kiểm tra mật khẩu cũ có khớp không
    if (oldPassword !== user.password) {
      setError("Mật khẩu cũ không chính xác!");
      return;
    }

    // ✅ 3. Kiểm tra xác nhận mật khẩu mới có khớp không
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới không khớp!");
      return;
    }

    // ✅ 4. Kiểm tra độ dài mật khẩu tối thiểu
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    // ✅ 5. Nếu hợp lệ → gọi Redux để cập nhật mật khẩu mới
    try {
      await dispatch(
        updateUserProfile({
          id: user.id,
          data: { password: newPassword }, // chỉ cập nhật trường password
        })
      ).unwrap(); // unwrap() giúp bắt lỗi trực tiếp nếu có

      // ✅ 6. Hiển thị thông báo thành công
      setSuccess("✅ Đổi mật khẩu thành công!");

      // ⏳ 7. Tự động đóng modal sau 1.2 giây
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("❌ Cập nhật thất bại!");
    }
  };

  /**
   * 🧱 JSX: Giao diện modal
   */
  return (
    // Overlay nền mờ
    <div className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm flex items-center justify-center">
      {/* Hộp modal */}
      <div className="bg-white rounded-lg shadow-xl w-[500px] p-6 relative animate-fadeIn">
        {/* ❌ Nút đóng modal */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        {/* 🔹 Tiêu đề modal */}
        <h2 className="text-lg font-semibold mb-4 text-center">
          🔒 Change Password
        </h2>

        {/* 🧾 Form nhập thông tin */}
        <div className="space-y-4">
          {/* Ô nhập mật khẩu cũ */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Old Password
            </label>
            <input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter old password"
            />
          </div>

          {/* Ô nhập mật khẩu mới */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter new password"
            />
          </div>

          {/* Ô xác nhận lại mật khẩu mới */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Re-enter new password"
            />
          </div>

          {/* Hiển thị thông báo lỗi hoặc thành công */}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
        </div>

        {/* 🔘 Nút hành động */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
