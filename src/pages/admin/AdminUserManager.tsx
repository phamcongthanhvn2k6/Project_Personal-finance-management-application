import { useEffect, useState } from "react";

// ✅ Import các hook của Redux
import { useDispatch, useSelector } from "react-redux";

// ✅ Lấy kiểu của store để dùng cho TS
import type { AppDispatch, RootState } from "../../redux/store";

// ✅ Import 2 async thunk từ slice: fetchUsers (lấy dữ liệu) & toggleUserStatus (đổi trạng thái)
import { fetchUsers, toggleUserStatus } from "../../redux/slices/user.slice";

// ✅ Layout components
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

export default function AdminUserManager() {
  // ✅ useDispatch với kiểu AppDispatch để tránh lỗi TS khi dispatch async thunk
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Lấy users & loading từ Redux store
  const { users, loading } = useSelector((state: RootState) => state.users);

  // ✅ State cho ô tìm kiếm
  const [search, setSearch] = useState("");

  // ✅ Trang hiện tại
  const [page, setPage] = useState(1);

  // ✅ Mỗi trang hiển thị 8 user
  const perPage = 8;

  // ✅ Gọi API khi component load lần đầu
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // ✅ Lọc theo tên hoặc email
  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Tổng số trang = tổng số user sau lọc / số user 1 trang
  const totalPages = Math.ceil(filtered.length / perPage);

  // ✅ Lấy user theo trang hiện tại
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ✅ Header cố định phía trên */}
      <Header />

      {/* ✅ Sidebar cố định bên trái */}
      <Sidebar />

      {/* ✅ Nội dung chính */}
      <main className="flex-1 ml-60 mt-[86px] p-8">
        
        {/* ✅ Tiêu đề và thanh tìm kiếm */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            User Management
          </h2>

          {/* ✅ Search box */}
          <div className="flex items-center border rounded-md px-3 py-2 bg-white shadow-sm">
            <i className="fa-solid fa-magnifying-glass text-gray-400 mr-2"></i>

            <input
              type="text"
              placeholder="Search user..."
              className="focus:outline-none text-sm"
              value={search}
              // ✅ update keyword search
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ✅ Nếu đang loading thì show Loading */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          // ✅ Bảng danh sách user
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-4 py-3 border-b">STT</th>
                  <th className="px-4 py-3 border-b text-left">Name</th>
                  <th className="px-4 py-3 border-b text-left">Email</th>
                  <th className="px-4 py-3 border-b text-center">Phone</th>
                  <th className="px-4 py-3 border-b text-center">Gender</th>
                  <th className="px-4 py-3 border-b text-center">Status</th>
                  <th className="px-4 py-3 border-b text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {/* ✅ Duyệt qua danh sách user đã được cắt theo trang */}
                {paged.map((u, i) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    {/* ✅ STT tính theo trang */}
                    <td className="px-4 py-3 text-center text-gray-700">
                      {(page - 1) * perPage + i + 1}
                    </td>

                    <td className="px-4 py-3 text-left font-medium text-gray-800">
                      {u.fullName}
                    </td>

                    <td className="px-4 py-3 text-left text-gray-600">
                      {u.email}
                    </td>

                    <td className="px-4 py-3 text-center text-gray-600">
                      {u.phone || "Unknown"}
                    </td>

                    <td className="px-4 py-3 text-center text-gray-600">
                      {u.gender ? "Male" : "Female"}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {/* ✅ Hiển thị trạng thái user */}
                      {u.status ? (
                        <span className="text-green-600 font-medium flex items-center justify-center gap-1">
                          <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                          Active
                        </span>
                      ) : (
                        <span className="text-red-500 font-medium flex items-center justify-center gap-1">
                          <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                          Deactivated
                        </span>
                      )}
                    </td>

                    {/* ✅ Nút đổi trạng thái user → dispatch toggleUserStatus */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => dispatch(toggleUserStatus(u.id))}
                        className={`text-lg transition ${
                          u.status
                            ? "text-red-500 hover:text-red-700"
                            : "text-green-600 hover:text-green-700"
                        }`}
                      >
                        {u.status ? (
                          <i className="fa-solid fa-lock"></i>
                        ) : (
                          <i className="fa-solid fa-lock-open"></i>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* ✅ Pagination cố định bên phải dưới */}
      <div className="fixed bottom-6 right-8 flex items-center gap-2 bg-white shadow-md border border-gray-200 rounded-lg px-4 py-2 z-50">

        {/* ✅ Nút về trang trước */}
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className={`px-3 py-1 border rounded-md text-sm flex items-center gap-1 transition ${
            page === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-gray-100 text-gray-700"
          }`}
        >
          <i className="fa-solid fa-angle-left"></i>
          Prev
        </button>

        {/* ✅ Các nút số trang */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-1 border rounded-md text-sm transition ${
              p === page
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white hover:bg-gray-100 text-gray-700"
            }`}
          >
            {p}
          </button>
        ))}

        {/* ✅ Nút sang trang tiếp */}
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className={`px-3 py-1 border rounded-md text-sm flex items-center gap-1 transition ${
            page === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-gray-100 text-gray-700"
          }`}
        >
          Next
          <i className="fa-solid fa-angle-right"></i>
        </button>
      </div>
    </div>
  );
}
