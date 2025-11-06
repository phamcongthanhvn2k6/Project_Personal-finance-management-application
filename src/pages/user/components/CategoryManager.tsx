/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../../redux/store";
import {
  fetchMonthlyCategories,
  resetMonthlyCategories,
} from "../../../redux/slices/monthlyCategory.slice";
import EditCategoryModal from "./EditCategoryModal";
import { Apis } from "../../../apis";
import type { Category, MonthlyCategoryItem } from "../../../types/Category.type";

export default function CategoryManager() {
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const [categories, setCategories] = useState<Category[]>([]);
  const monthlyStore = useSelector((state: RootState) => state.monthlyCategories);

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [monthlyCategories, setMonthlyCategories] = useState<MonthlyCategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [budget, setBudget] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MonthlyCategoryItem | null>(null);

  // ✅ Load danh sách Category hệ thống 1 lần
  useEffect(() => {
    const fetchCategories = async () => {
      const categoryList = await Apis.category.getAll();
      setCategories(categoryList || []);
    };
    fetchCategories();
  }, []);

  // ✅ Load MonthlyCategory khi user hoặc month thay đổi
  useEffect(() => {
    if (!user) return;

    dispatch(resetMonthlyCategories());        // ✅ XÓA dữ liệu cũ
    dispatch(fetchMonthlyCategories(user.id)); // ✅ LOAD dữ liệu mới
  }, [user, month]);

  // ✅ Đồng bộ category theo tháng sau khi store thay đổi
  useEffect(() => {
    const monthly = monthlyStore.list.find((m) => m.month.startsWith(month));
    setMonthlyCategories(monthly?.categories || []);
  }, [monthlyStore.list, month]);

  // ➕ Thêm Category mới
  const handleAddCategory = async () => {
    if (!selectedCategory || !budget) return alert("Chọn danh mục và nhập giới hạn!");

    const newItem: MonthlyCategoryItem = {
      id: Date.now(),
      categoryId: selectedCategory,
      budget: Number(budget),
    };

    const newList = [...monthlyCategories, newItem];
    setMonthlyCategories(newList);

    const monthly = monthlyStore.list.find((m) => m.month.startsWith(month));
    if (monthly) {
      await Apis.monthlyCategory.update(monthly.id, { categories: newList });
    }

    setSelectedCategory("");
    setBudget("");
  };

  // ❌ Xóa
  const handleDelete = async (id: number) => {
    const updatedList = monthlyCategories.filter((item) => item.id !== id);
    setMonthlyCategories(updatedList);

    const monthly = monthlyStore.list.find((m) => m.month.startsWith(month));
    if (monthly) {
      await Apis.monthlyCategory.update(monthly.id, { categories: updatedList });
    }
  };

  // ✏️ Edit
  const handleEdit = (item: MonthlyCategoryItem) => {
    setEditingItem(item);
    setEditModalOpen(true);
  };

  const refreshMonthly = async () => {
    const monthly = monthlyStore.list.find((m) => m.month.startsWith(month));
    setMonthlyCategories(monthly?.categories || []);
  };

  return (
    <section className="bg-white rounded-2xl shadow-md p-6 max-w-[1000px] w-full mx-auto mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">💼 Quản lý danh mục theo tháng</h2>

      {/* Chọn tháng */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-gray-700">📅 Tháng:</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Thêm danh mục */}
      <div className="flex items-center gap-3 mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded-lg p-2 flex-1 text-sm"
        >
          <option value="">Chọn danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Giới hạn (VND)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="border rounded-lg p-2 flex-1 text-sm"
        />

        <button
          onClick={handleAddCategory}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Thêm
        </button>
      </div>

      {/* Hiển thị */}
      <div className="grid grid-cols-3 gap-6">
        {monthlyCategories.length === 0 ? (
          <p className="col-span-3 text-gray-400 text-center">Chưa có danh mục tháng này.</p>
        ) : (
          monthlyCategories.map((item) => {
            const cat = categories.find((c) => c.id === item.categoryId);

            return (
              <div key={item.id} className="border p-4 rounded-xl relative bg-white shadow-sm">
                {/* Delete & Edit */}
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ❌
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-gray-600 hover:text-indigo-600"
                  >
                    ✏️
                  </button>
                </div>

                {/* Nội dung */}
                <p className="text-sm font-medium">{cat?.name || "Không xác định"}</p>
                <p className="text-gray-500 mt-1">
                  {item.budget.toLocaleString("vi-VN")} ₫
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Modal chỉnh sửa */}
      {editModalOpen && editingItem && (
        <EditCategoryModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            refreshMonthly();
          }}
          item={editingItem}
          userId={user!.id}
          month={month}
        />
      )}
    </section>
  );
}
