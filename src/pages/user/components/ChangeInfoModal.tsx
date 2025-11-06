import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../redux/store";
import { updateUserProfile } from "../../../redux/slices/user.slice"; // 🧠 Action cập nhật thông tin người dùng
import type { User } from "../../../types/User.type";

/**
 * 📦 Props nhận từ component cha (ProfileSection)
 * - open: xác định modal có hiển thị hay không
 * - onClose: hàm để đóng modal (truyền từ cha)
 */
interface ChangeInfoModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * 🧩 Component: Modal dùng để cập nhật thông tin cá nhân (họ tên, email, sđt, giới tính)
 */
export default function ChangeInfoModal({ open, onClose }: ChangeInfoModalProps) {
  const dispatch = useDispatch<AppDispatch>();

  // 📦 Lấy thông tin user đang đăng nhập từ Redux store
  const { user } = useSelector((state: RootState) => state.auth);

  /**
   * 🧠 Local state lưu dữ liệu form đang nhập
   * - Sử dụng Partial<User> để cho phép cập nhật từng phần
   * - Mặc định các trường trống để tránh lỗi undefined
   */
  const [formData, setFormData] = useState<Partial<User>>({
    fullName: "",
    email: "",
    phone: "",
    gender: true, // true = Male, false = Female
  });

  /**
   * 🪄 Khi component mount hoặc user thay đổi → đổ dữ liệu hiện tại vào form
   */
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || "",
        gender: user.gender ?? true, // Nếu null thì mặc định true (nam)
      });
    }
  }, [user]);

  // 🚪 Nếu modal không mở → không render gì cả (tối ưu hiệu suất)
  if (!open) return null;

  /**
   * ✍️ Hàm xử lý khi người dùng thay đổi giá trị input hoặc select
   * - name: tên trường (fullName, email, phone, gender)
   * - value: giá trị mới
   * - Nếu là gender thì phải convert "true"/"false" → boolean
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "gender" ? value === "true" : value,
    }));
  };

  /**
   * 💾 Hàm xử lý khi nhấn nút "Save"
   * - Gọi action updateUserProfile (Redux Toolkit AsyncThunk)
   * - Action này gọi API PATCH → cập nhật user trong db.json
   * - Sau khi xong → đóng modal
   */
  const handleSave = async () => {
    if (!user) return; // Nếu chưa đăng nhập thì không xử lý

    await dispatch(updateUserProfile({ id: user.id, data: formData }));
    onClose(); // Đóng modal sau khi lưu
  };

  /**
   * 🧱 JSX: Giao diện modal
   */
  return (
    // Overlay mờ nền sau (sử dụng backdrop-blur để tạo hiệu ứng mờ nhẹ)
    <div className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm flex items-center justify-center">
      {/* Khung modal chính */}
      <div className="bg-white rounded-lg shadow-xl w-[500px] p-6 relative animate-fadeIn">
        {/* 🔘 Nút đóng (góc phải trên) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        {/* 🧾 Tiêu đề */}
        <h2 className="text-lg font-semibold mb-4">Change Information</h2>

        {/* 📋 Form nhập thông tin */}
        <div className="grid grid-cols-1 gap-4">
          {/* Trường họ tên */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Trường email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Trường số điện thoại */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Trường giới tính */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={String(formData.gender)} // convert sang string để hiển thị
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="true">Male</option>
              <option value="false">Female</option>
            </select>
          </div>
        </div>

        {/* 🔘 Các nút hành động ở cuối modal */}
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
