import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../redux/store";
import { fetchUserFromToken } from "../../../redux/slices/authSlice";
import ChangeInfoModal from "./ChangeInfoModal";
import ChangePasswordModal from "./ChangePasswordModal";

export default function ProfileSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const [openModal, setOpenModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (token) dispatch(fetchUserFromToken(token));
  }, [token, dispatch]);

  if (loading)
    return <p className="text-center text-gray-500">Đang tải thông tin...</p>;
  if (error) return <p className="text-center text-red-500">❌ {error}</p>;
  if (!user)
    return (
      <p className="text-center text-gray-500">Không có thông tin người dùng</p>
    );

  return (
    <>
      {/* 🧩 Phần chính */}
      <section className="bg-white rounded-2xl shadow-lg p-8 max-w-[768px] w-full mx-auto mt-1 text-center">
        <h2 className="text-xl font-semibold text-indigo-700 mb-3">
          👤 Thông Tin Cá Nhân
        </h2>

        <div className="grid grid-cols-2 gap-4 text-gray-700 text-sm text-left">
          <div>
            <label className="block font-medium text-gray-600 mb-1">
              Họ và tên
            </label>
            <p className="border p-2 rounded bg-gray-50">{user.fullName}</p>
          </div>

          <div>
            <label className="block font-medium text-gray-600 mb-1">Email</label>
            <p className="border p-2 rounded bg-gray-50">{user.email}</p>
          </div>

          <div>
            <label className="block font-medium text-gray-600 mb-1">
              Số điện thoại
            </label>
            <p className="border p-2 rounded bg-gray-50">
              {user.phone || "Chưa cập nhật"}
            </p>
          </div>

          <div>
            <label className="block font-medium text-gray-600 mb-1">
              Giới tính
            </label>
            <p className="border p-2 rounded bg-gray-50">
              {user.gender ? "Nam" : "Nữ"}
            </p>
          </div>
        </div>

        {/* 🔹 Nút thao tác */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setOpenModal(true)}
            className="w-[49%] border border-indigo-600 text-indigo-600 px-4 py-2 rounded hover:bg-indigo-50 transition"
          >
            Change Information
          </button>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-[49%] border border-indigo-600 text-indigo-600 px-4 py-2 rounded hover:bg-indigo-50 transition"
          >
            Change Password
          </button>
        </div>
      </section>

      {/* 🟢 Modal render tách ra ngoài layout chính */}
      {openModal && (
        <div className="relative z-50">
          <ChangeInfoModal open={openModal} onClose={() => setOpenModal(false)} />
        </div>
      )}
      {showPasswordModal && (
        <div className="relative z-50">
          <ChangePasswordModal
            open={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
          />
        </div>
      )}
    </>
  );
}
