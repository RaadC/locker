"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";
import { HelpCircle, Unlock } from "lucide-react";

export default function ControlLockerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usedLocker, setUsedLocker] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    const fetchUsedLocker = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/used-lockers");
        setUsedLocker(res.data);
      } catch (err) {
        console.error("Failed to fetch locker in use", err);
        setError("Failed to load lockers.");
      }
    };
    fetchUsedLocker();
    const interval = setInterval(fetchUsedLocker, 5000); // auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleDeactivate = async (id) => {
    if (!confirm(`Are you sure you  want to open locker #${id}?`)) return;
    try {
      const res = await axios.put(
        `http://localhost:5000/api/deactivate-locker/${id}`
      );
      setMessage(res.data.message);
      setData((prev) => prev.filter((row) => row.id !== id));
    } catch (err) {
      setMessage("Failed to deactivate locker.");
    }
  };
    const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-PH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopBar onLogoClick={toggleSidebar} />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />
        <div className="flex-1 overflow-y-auto pt-25 p-6 bg-gray-50">
          <div className="w-full max-w-4xl mx-auto bg-white p-6 shadow rounded-xl">
            <h1 className="text-2xl font-bold mb-4">Helmet Locker in use</h1>

            {error && <p className="text-red-500">{error}</p>}

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-center">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-4 py-2">Locker ID</th>
                    <th className="px-4 py-2">User ID</th>
                    <th className="px-4 py-2">Time Stored</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {usedLocker.length > 0 ? (
                    usedLocker.map((entry, index) => (
                      <tr
                        key={index}
                        className="border-b bg-white hover:bg-gray-50"
                      >
                        <td className="px-4 py-2">{entry.id}</td>
                        <td className="px-4 py-2">{entry.tupcID}</td>
                        <td className="px-4 py-2">
                          {formatDate(entry.dateTime)}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleDeactivate(entry.id)}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700"
                          >
                            <Unlock size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-4 text-gray-500">
                        No lockers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="fixed bottom-4 right-4 group z-50">
            <div className="bg-white text-blue-600 rounded-full w-12 h-12 flex items-center justify-center cursor-pointer shadow-lg hover:bg-gray-100 transition duration-200">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="absolute bottom-14 right-0 w-72 text-sm text-white bg-gray-900 p-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg">
              This page shows the locker in use. This page will allow you to
              forcely unlock the locker in use when QR code of user is not
              available during retrieval
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
