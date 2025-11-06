// ✅ Import hook React
import { useEffect, useState } from "react";

// ✅ Import hook kết nối Redux
import { useDispatch, useSelector } from "react-redux";

// ✅ Import kiểu TypeScript cho store
import type { AppDispatch, RootState } from "../../redux/store";

// ✅ Import các action async từ slice category
import {
  fetchCategories,       // Lấy danh sách category từ API
  toggleCategoryStatus,  // Đổi trạng thái Active / Inactive
  addCategory,           // Thêm mới category
  updateCategory,        // Cập nhật category
} from "../../redux/slices/category.slice";

// ✅ Import UI component layout
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import CategoryModal from "./components/CategoryModal";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminCategoryManager() {
  // ✅ dispatch: để gửi action tới Redux store
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Lấy dữ liệu categories và trạng thái loading từ Redux
  const { categories, loading } = useSelector(
    (state: RootState) => state.categories
  );

  // ✅ Quản lý modal mở/đóng
  const [showModal, setShowModal] = useState(false);

  // ✅ Lưu category đang chỉnh sửa; nếu null → đang thêm mới
  const [currentCategory, setCurrentCategory] = useState<{
    id: number;
    name: string;
    imageUrl: string;
    status: boolean;
  } | null>(null);

  // ✅ Từ khóa tìm kiếm
  const [search, setSearch] = useState("");

  // ✅ Trạng thái phân trang
  const [page, setPage] = useState(1);

  // ✅ Số phần tử hiển thị mỗi trang
  const perPage = 8;

  // ✅ TẢI DỮ LIỆU CATEGORY KHI MỞ TRANG
  useEffect(() => {
    dispatch(fetchCategories()); // gọi action redux -> api -> trả dữ liệu về store
  }, [dispatch]);

  // ✅ TÌM KIẾM: lọc danh sách theo từ khóa
  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ TÍNH SỐ TRANG
  const totalPages = Math.ceil(filtered.length / perPage);

  // ✅ LẤY DANH SÁCH THEO TRANG
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  // ✅ MỞ MODAL THÊM MỚI
  const handleAddOpen = () => {
    setCurrentCategory(null); // set null → chế độ thêm mới
    setShowModal(true);
  };

  // ✅ MỞ MODAL CHỈNH SỬA
  const handleEditOpen = (category: any) => {
    setCurrentCategory(category); // lưu dữ liệu đang chỉnh sửa
    setShowModal(true);
  };

  // ✅ THÊM MỚI CATEGORY
  const handleAdd = async (data: { name: string; imageUrl: string; status?: boolean }) => {
    try {
      await dispatch(addCategory(data)).unwrap(); // unwrap để bắt lỗi chuẩn
      alert("✅ Added successfully!");
    } catch (err) {
      alert("❌ Add failed: " + err);
    }
  };

  // ✅ CẬP NHẬT CATEGORY
  const handleUpdate = async (data: { name: string; imageUrl: string; status?: boolean }) => {
    if (!currentCategory) return; // nếu không có id thì không cập nhật
    try {
      await dispatch(updateCategory({ id: currentCategory.id, data })).unwrap();
      alert("✅ Updated successfully!");
    } catch (err) {
      alert("❌ Update failed: " + err);
    }
  };

  // ✅ ĐỔI TRẠNG THÁI ACTIVE / INACTIVE
  const handleToggle = async (id: number) => {
    try {
      await dispatch(toggleCategoryStatus(id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    // ✅ Layout chính: flex ngang + nền xám
    <div className="flex min-h-screen bg-gray-50">
      {/* Header cố định phía trên */}
      <Header />

      {/* Sidebar cố định bên trái */}
      <Sidebar />

      {/* Khu vực nội dung */}
      <main className="flex-1 ml-60 mt-[56px] p-8">
        <div className="bg-white rounded-xl shadow-md p-6 max-w-6xl mx-auto">
          
          {/* ✅ Thanh công cụ: Tìm kiếm + nút thêm */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleAddOpen}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
            >
              + Add Category
            </button>

            {/* Ô tìm kiếm */}
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search category..."
                className="border px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                value={search}
                onChange={(e) => {
                  setPage(1);        // về trang đầu khi tìm kiếm
                  setSearch(e.target.value);
                }}
              />
              <i className="fa-solid fa-magnifying-glass ml-2 text-gray-500"></i>
            </div>
          </div>

          {/* ✅ BẢNG DANH MỤC */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            {loading ? (
              <p className="text-center py-4 text-gray-500">Loading...</p>
            ) : (
<table className="w-full text-sm bg-white border-collapse">
  
  {/* Header bảng */}
  <thead className="bg-gray-100 text-gray-600 text-center border-b border-gray-200">
    <tr>
      <th className="px-4 py-2 font-medium">#</th>
      <th className="px-4 py-2 font-medium">Name</th>
      <th className="px-4 py-2 font-medium">Image</th>
      <th className="px-4 py-2 font-medium">Status</th>
      <th className="px-4 py-2 font-medium">Actions</th>
    </tr>
  </thead>

  {/* Body bảng */}
  <tbody className="text-center text-gray-700">
    {paged.map((c, i) => (
      <tr key={c.id} className="hover:bg-gray-50 transition border-b border-gray-100">
        
        {/* STT tự động theo trang */}
        <td className="px-4 py-2">
          {(page - 1) * perPage + i + 1}
        </td>

        <td className="px-4 py-2">{c.name}</td>

        {/* Ảnh category */}
        <td className="px-4 py-2 flex justify-center">
          <img
            src={c.imageUrl}
            alt={c.name}
            className="w-7 h-7 object-cover rounded-md border border-gray-200"
          />
        </td>

        {/* Trạng thái */}
        <td className="px-4 py-2">
          {c.status ? (
            <span className="text-green-600 text-sm flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Active
            </span>
          ) : (
            <span className="text-red-500 text-sm flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Inactive
            </span>
          )}
        </td>

        {/* Các nút chức năng */}
        <td className="px-4 py-2 flex justify-center gap-2">
          
          {/* Nút chỉnh sửa */}
          <button
            onClick={() => handleEditOpen(c)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs"
          >
            Edit
          </button>

          {/* Nút đổi trạng thái */}
          <button
            onClick={() => handleToggle(c.id)}
            className={`px-3 py-1 rounded text-xs flex items-center gap-1 ${
              c.status
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {c.status ? (
              <>
                <i className="fa-solid fa-lock"></i> Block
              </>
            ) : (
              <>
                <i className="fa-solid fa-lock-open"></i> Unblock
              </>
            )}
          </button>

        </td>
      </tr>
    ))}
  </tbody>
</table>
            )}
          </div>

          {/* ✅ PHÂN TRANG */}
          <div className="flex justify-end mt-4 pr-4">
            <div className="flex items-center gap-1">

              {/* Nút PREV */}
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className={`px-3 py-1 border rounded-md text-sm flex items-center gap-1 transition ${
                  page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:bg-gray-100 text-gray-700"
                }`}
              >
                <i className="fa-solid fa-angle-left"></i> Prev
              </button>

              {/* Các nút trang số */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p: number) => (
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

              {/* Nút NEXT */}
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className={`px-3 py-1 border rounded-md text-sm flex items-center gap-1 transition ${
                  page === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:bg-gray-100 text-gray-700"
                }`}
              >
                Next <i className="fa-solid fa-angle-right"></i>
              </button>

            </div>
          </div>
        </div>
      </main>

      {/* ✅ MODAL THÊM / SỬA */}
      {showModal && (
        <CategoryModal
          open={showModal}
          onClose={() => setShowModal(false)}
          editingCategory={currentCategory}
          onSubmit={(data) =>
            currentCategory ? handleUpdate(data) : handleAdd(data)
          }
        />
      )}
    </div>
  );
}
