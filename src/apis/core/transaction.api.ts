// src/apis/transaction.api.ts
import axios from "axios";
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * BASE — lấy từ biến môi trường Vite (VITE_SV_HOST).
 * Nếu không có biến môi trường, dùng fallback "http://localhost:3001".
 * .replace(/\/$/, "") đảm bảo không có dấu '/' ở cuối, tránh URL dạng "http://...//transactions".
 */
const BASE = (import.meta.env.VITE_SV_HOST || "http://localhost:3001").replace(/\/$/, "");

/**
 * ENDPOINT — đường dẫn tới resource transactions trên server.
 * Ví dụ: "http://localhost:3001/transactions"
 */
const ENDPOINT = `${BASE}/transactions`;

/**
 * TransactionApi: tập hợp các hàm gọi HTTP liên quan tới "transactions".
 * - Dùng axios để gửi request.
 * - Mỗi hàm trả về res.data (phần payload json từ server).
 */
export const TransactionApi = {
  /**
   * Lấy tất cả transaction cho một monthlyCategory cụ thể
   * @param monthlyCategoryId - id của monthlyCategory (string)
   * @returns Promise<any[]> - mảng giao dịch thuộc monthlyCategory đó
   *
   * Ví dụ request: GET /transactions?monthlyCategoryId=95ec
   * JSON-server sẽ trả về mảng các transaction phù hợp.
   */
  async getByMonthly(monthlyCategoryId: string) {
    const res = await axios.get(`${ENDPOINT}?monthlyCategoryId=${monthlyCategoryId}`);
    return res.data;
  },

  /**
   * Tạo (thêm) một transaction mới
   * @param payload - object chứa dữ liệu transaction (ví dụ: { id, createdDate, total, description, categoryId, monthlyCategoryId })
   * @returns Promise<any> - object transaction vừa tạo (server trả về)
   *
   * Lưu ý:
   * - payload nên chứa đầy đủ các field cần thiết tùy API (đảm bảo kiểu number/string đúng).
   * - Nếu dùng json-server, bạn có thể tạo `id` phía client (Date.now()) hoặc để server tự tạo.
   */
  async create(payload: any) {
    const res = await axios.post(ENDPOINT, payload);
    return res.data;
  },

  /**
   * Xoá một transaction theo id
   * @param id - id của transaction (string)
   * @returns Promise<any> - phản hồi từ server (thường là {} hoặc object đã xoá tuỳ server)
   *
   * Ví dụ request: DELETE /transactions/24b7
   */
  async remove(id: string) {
    const res = await axios.delete(`${ENDPOINT}/${id}`);
    return res.data;
  }
};
