"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";
import { HelpCircle } from "lucide-react";

export default function LockerHistoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [actionFilter, setActionFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/locker-history");
        const data = await res.json();
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch locker history:", error);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredHistory = history.filter((item) => {
    const matchesAction =
      !actionFilter || item.action.toLowerCase() === actionFilter.toLowerCase();
    const matchesDate =
      !dateFilter ||
      new Date(item.dateTime).toISOString().slice(0, 10) === dateFilter;
    return matchesAction && matchesDate;
  });

  return (
    <div className="h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopBar onLogoClick={toggleSidebar} />
      </div>

      <div className="flex flex-1 pt-16 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />

        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <div className="bg-white shadow rounded-xl p-6">
            <h1 className="text-2xl font-bold mb-4">Locker Usage History</h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700">Filter by Action</label>
                <select
                  className="mt-1 block w-40 border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200"
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="stored">Stored</option>
                  <option value="retrieved">Retrieved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Filter by Date</label>
                <input
                  type="date"
                  className="mt-1 block w-44 border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>

            {filteredHistory.length > 0 ? (
              <table className="min-w-full text-sm text-center">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-4 py-2">Transaction ID</th>
                    <th className="px-4 py-2">User ID</th>
                    <th className="px-4 py-2">Locker ID</th>
                    <th className="px-4 py-2">Action</th>
                    <th className="px-4 py-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item) => (
                    <tr key={item.id} className="bg-white hover:bg-gray-50 border-b">
                      <td className="px-4 py-2">{item.id}</td>
                      <td className="px-4 py-2">{item.tupcID}</td>
                      <td className="px-4 py-2">{item.slotNumber}</td>
                      <td className="px-4 py-2">{item.action}</td>
                      <td className="px-4 py-2">
                        {new Date(item.dateTime).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500">No history found.</p>
            )}
          </div>

          <div className="fixed bottom-4 right-4 group z-50">
            <div className="bg-white text-blue-600 rounded-full w-12 h-12 flex items-center justify-center cursor-pointer shadow-lg hover:bg-gray-100 transition duration-200">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="absolute bottom-14 right-0 w-72 text-sm text-white bg-gray-900 p-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg">
              This page shows the locker usage history.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
