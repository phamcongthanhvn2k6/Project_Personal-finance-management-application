// 🌐 Lấy URL API và thông tin Cloudinary từ file .env
// import.meta.env được dùng trong Vite để lấy biến môi trường
const API_URL_CATE = `${import.meta.env.VITE_SV_HOST}/categories`; 
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME; 
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// ✅ Tất cả hàm gọi API liên quan đến CATEGORY nằm trong object này
export const CategoryApi = {

  // ✅ LẤY DANH SÁCH DANH MỤC
  async getAll() {
    // Gửi request GET đến server để lấy tất cả category
    const res = await fetch(API_URL_CATE);
    
    // Nếu phản hồi không OK (lỗi HTTP), quăng lỗi
    if (!res.ok) throw new Error("❌ Failed to fetch categories");

    // Trả về dữ liệu dạng JSON (mảng category)
    return res.json();
  },

  // ✅ TẠO MỚI 1 DANH MỤC
  async create(data: { name: string; imageUrl: string; status: boolean }) {
    // Gửi POST request với body là JSON (thêm dữ liệu)
    const res = await fetch(API_URL_CATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // báo server biết đang gửi JSON
      body: JSON.stringify({
        id: Date.now(), // tạo id tạm bằng thời gian (dùng cho json-server)
        ...data,        // gộp phần dữ liệu truyền vào
      }),
    });

    // Nếu server báo lỗi → quăng exception
    if (!res.ok) throw new Error("❌ Failed to create category");

    // Trả về object category vừa được tạo
    return res.json();
  },

  // ✅ CẬP NHẬT DANH MỤC (sửa từng phần – PATCH)
  async update(
    id: number | string,
    data: Partial<{ name: string; imageUrl: string; status: boolean }>
  ) {
    // Gọi PATCH thay vì PUT → chỉ cập nhật trường cần thay đổi, không ghi đè toàn bộ
    const res = await fetch(`${API_URL_CATE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data), // chỉ gửi những field cần sửa
    });

    if (!res.ok) throw new Error("❌ Failed to update category");

    return res.json(); // trả về category đã cập nhật
  },

  // ✅ CHUYỂN TRẠNG THÁI CATEGORY (Active <-> Inactive)
  async toggleStatus(id: number | string, currentStatus: boolean) {
    // PATCH – chỉ sửa 1 field "status"
    const res = await fetch(`${API_URL_CATE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: !currentStatus }), // đảo ngược trạng thái
    });

    if (!res.ok) throw new Error("❌ Failed to toggle category status");

    return res.json(); // trả về dữ liệu sau khi đổi trạng thái
  },

  // ✅ UPLOAD ẢNH LÊN CLOUDINARY
  async uploadImage(file: File): Promise<string> {
    // FormData dùng để gửi file (không thể dùng JSON)
    const formData = new FormData();
    formData.append("file", file); // file hình
    formData.append("upload_preset", UPLOAD_PRESET); // preset upload của cloudinary

    // Gọi API upload của Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData, // gửi formData chứa file
      }
    );

    // Nếu upload lỗi → log và ném lỗi
    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ Cloudinary error:", errText);
      throw new Error("Failed to upload image");
    }

    // Parse JSON → lấy ra secure_url chính là link ảnh online
    const data = await response.json();
    return data.secure_url;
  },
};

// ✅ EXPORT ALIAS tiện lợi để import nhanh trong modal hoặc form
export const uploadImageToCloudinary = CategoryApi.uploadImage;
