import axios from "axios";

/**
 * 🧩 BASE_URL — Lấy từ biến môi trường Vite (nếu có)
 * Nếu không, tự fallback về localhost:3001
 * 
 * .replace(/\/$/, "") dùng để xoá dấu "/" ở cuối URL nếu có,
 * giúp tránh lỗi URL dạng //monthlyCategories
 */
const BASE =
  import.meta.env.VITE_SV_HOST || "http://localhost:3001";

const BASE_URL = `${BASE.replace(/\/$/, "")}/monthlyCategories`;
const CATEGORY_URL = `${BASE.replace(/\/$/, "")}/categories`;

/* eslint-disable @typescript-eslint/no-explicit-any */
export const MonthlyCategoryApi = {
  /**
   * ✅ Lấy tất cả monthlyCategories
   * Dùng khi cần debug hoặc admin
   */
  async getAll() {
    const res = await axios.get(BASE_URL);
    return res.data;
  },

  /**
   * ✅ Lấy 1 monthlyCategory theo user + tháng
   * Trả về object nếu tìm thấy, hoặc null nếu chưa có trong DB
   * 
   * Dùng trong trường hợp user đăng nhập & vào tháng hiện tại
   */
  async getByUserAndMonth(userId: number, month: string) {
    const res = await axios.get(`${BASE_URL}?userId=${userId}&month=${month}`);

    // JSON-server trả array → lấy phần tử đầu tiên nếu có
    return res.data.length > 0 ? res.data[0] : null;
  },

  /**
   * ✅ Tạo mới 1 monthlyCategory
   * Ép kiểu userId & balence về number phòng trường hợp input string
   * 
   * payload = dữ liệu gửi lên DB
   */
  async create(data: {
    userId: number;
    month: string;
    balence: number;
    categories: any[];
  }) {
    const payload = {
      ...data,
      userId: Number(data.userId),
      balence: Number(data.balence),
    };

    const res = await axios.post(BASE_URL, payload);
    return res.data;
  },

  /**
   * ✅ Cập nhật monthlyCategory theo id
   * Dùng PATCH để chỉ cập nhật field thay đổi, không cần gửi toàn bộ object
   */
  async update(id: string | number, data: any) {
    const res = await axios.patch(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  /**
   * ✅ LẤY DANH SÁCH monthlyCategories THEO USER + JOIN CATEGORY
   * - Query monthlyCategories theo userId
   * - Query toàn bộ bảng categories
   * - JOIN thủ công (vì JSON server không hỗ trợ join)
   * 
   * Kết quả cuối cùng:
   *  mỗi item sẽ có: categoryId + full object category
   */
  async getByUser(userId: number) {
    // 1️⃣ Lấy monthlyCategory theo user
    const res = await axios.get(`${BASE_URL}?userId=${userId}`);

    // 2️⃣ Lấy toàn bộ bảng categories
    const cateRes = await axios.get(CATEGORY_URL);
    const allCategories = cateRes.data;

    // 3️⃣ JOIN thủ công từng phần tử
    return res.data.map((m: any) => ({
      ...m,
      categories: m.categories.map((c: any) => ({
        ...c,
        // Tìm category tương ứng bằng ID
        category:
          allCategories.find(
            (cat: any) => String(cat.id) === String(c.categoryId)
          ) || null, // Nếu không có thì trả null
      })),
    }));
  },
};
