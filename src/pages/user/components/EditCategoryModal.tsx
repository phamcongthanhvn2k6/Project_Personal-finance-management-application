import { useEffect, useState } from "react";
import { Apis } from "../../../apis";
import type { Category, MonthlyCategoryItem } from "../../../types/Category.type";


interface EditCategoryModalProps {
  open: boolean;
  onClose: () => void;
  item: MonthlyCategoryItem;
  userId: number;
  month: string;
}

/**
 * 🧩 Modal chỉnh sửa danh mục trong CategoryManager
 */
export default function EditCategoryModal({
  open,
  onClose,
  item,
  userId,
  month,
}: EditCategoryModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(item.categoryId);
  const [budget, setBudget] = useState(item.budget.toString());

  // 📦 Lấy danh mục hiện có
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await Apis.category.getAll();
        setCategories(data || []);
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  if (!open) return null;

  // 💾 Lưu thay đổi
  const handleSave = async () => {
    try {
      const monthly = await Apis.monthlyCategory.getByUserAndMonth(userId, month);
      if (!monthly) return;

      const updatedCategories = monthly.categories.map((cat: MonthlyCategoryItem) =>
        cat.id === item.id
          ? { ...cat, categoryId: selectedCategory, budget: Number(budget) }
          : cat
      );

      await Apis.monthlyCategory.update(monthly.id, { categories: updatedCategories });

      onClose();
    } catch (error) {
      console.error("Lỗi cập nhật danh mục:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[400px] p-6 relative animate-fadeIn">
        {/* 🔘 Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          ✏️ Sửa danh mục
        </h2>

        <div className="flex flex-col gap-4">
          {/* Tên danh mục */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Tên danh mục
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-indigo-500"
            >
              {categories
                .filter((c) => c.status)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Ngân sách */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Ngân sách (VND)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
