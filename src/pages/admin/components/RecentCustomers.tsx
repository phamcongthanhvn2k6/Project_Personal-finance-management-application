const customers = [
  { id: 1, name: "Alice Nguyen", email: "alice@example.com", total: "$3,200" },
  { id: 2, name: "John Pham", email: "john@example.com", total: "$1,800" },
  { id: 3, name: "Linh Tran", email: "linh@example.com", total: "$2,450" },
  { id: 4, name: "Bao Le", email: "bao@example.com", total: "$5,100" },
];

export default function RecentCustomers() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">Recent Customers</h3>
      <ul className="space-y-3">
        {customers.map((customer) => (
          <li
            key={customer.id}
            className="flex justify-between items-center border-b pb-2 last:border-none"
          >
            <div>
              <p className="font-medium text-gray-800">{customer.name}</p>
              <p className="text-xs text-gray-500">{customer.email}</p>
            </div>
            <span className="text-green-600 font-semibold">{customer.total}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
