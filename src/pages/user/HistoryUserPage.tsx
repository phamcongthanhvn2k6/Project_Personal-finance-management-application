import Sidebar from './components/Sidebar'
import Header from './components/Header'
import BudgetSection from './components/BudgetSection'
import HistoryManager from './components/HistoryManager'
function HistoryUser() {
  return (
    <div>
      <div className="min-h-screen flex flex-col bg-gray-50">
            {/* 🔹 Header chiếm toàn màn hình ngang */}
            <Header />
      
            {/* 🔹 Dưới header là phần thân gồm sidebar + dashboard */}
            <div className="flex flex-1">
              {/* Sidebar bên trái */}
              <Sidebar />
      
              {/* Dashboard bên phải */}
              <main className="flex-1 p-6 overflow-y-auto">
                <div className="flex flex-col gap-6 w-[768px] mx-auto mt-0.5  ">
                    {/* 🔷 Header chào mừng / mô tả */}
                      <div className="bg-indigo-600 text-white rounded-lg shadow-md p-5 text-center">
                          <h1 className="text-xl font-semibold">💡 Kiểm Soát Chi Tiêu Thông Minh</h1>
                            <p className="text-sm mt-1 text-indigo-100">
                              Theo dõi ngân sách và quản lý chi tiêu hàng tháng của bạn một cách dễ dàng.
                            </p>
                      </div>
                                  
                      {/* 🔹 Khu vực ngân sách */}
                        <BudgetSection />
                        <HistoryManager />
                </div>
              </main>
            </div>
          </div>
    </div>
  )
}

export default HistoryUser
