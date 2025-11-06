import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 🔹 Header chiếm toàn màn hình ngang */}
      <Header />

      {/* 🔹 Dưới header là phần thân gồm sidebar + dashboard */}
      <div className="flex flex-1">
        {/* Sidebar bên trái */}
        <Sidebar />

        {/* Dashboard bên phải */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}
