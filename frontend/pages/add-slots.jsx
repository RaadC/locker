"use client";
import { useEffect, useState } from "react";
import axios from "axios";

import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";
import { HelpCircle } from "lucide-react";

export default function UpdateTotalLockerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalLocker, setTotalLocker] = useState("");
  const [currentValue, setCurrentValue] = useState(null);
  const [activeLockers, setActiveLockers] = useState([]);
  const [message, setMessage] = useState("");

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  //Fetch totalLocker
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/display-total-charge")
      .then((res) => {
        setTotalLocker(res.data.totalLocker);
        setCurrentValue(res.data.totalLocker);
      })
      .catch(() => setMessage("Failed to load total locker"));
  }, []);

  //Fetch active lockers
  useEffect(() => {
    const fetchActiveLockers = () => {
      axios
        .get("http://localhost:5000/api/used-lockers")
        .then((res) => setActiveLockers(res.data))
        .catch((err) => console.error("Failed to fetch active lockers", err));
    };

    fetchActiveLockers();
    const interval = setInterval(fetchActiveLockers, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const number = Number(totalLocker);

    const maxUsedId = activeLockers.reduce(
      (max, locker) => Math.max(max, locker.id),
      0
    );
    if (number < 10) {
      setMessage("Value must be at least 10");
      return;
    }
    if (number < maxUsedId) {
      setMessage(
        `Value cannot be less than highest used locker slot ${maxUsedId}`
      );
      return;
    }
    try {
      const res = await axios.put("http://localhost:5000/api/settings", {
        totalLocker: number,
      });
      const { message, updated } = res.data;
      setMessage(message);
      if (updated) {
        setCurrentValue(number);
      }
    } catch {
      setMessage("Failed to update total locker");
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopBar onLogoClick={toggleSidebar} />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />
        <div className="flex flex-1 flex-col lg:flex-row pt-25 gap-6 overflow-y-auto p-6 bg-gray-50">
          <div className="w-full lg:w-1/3">
            <div className="bg-white shadow rounded-xl p-6 space-y-6">
              <h1 className="text-xl font-semibold">Adjust Total Slots</h1>
              <p className="text-sm text-gray-600">
                Total Locker Slots: <strong>{currentValue}</strong>
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  id="totalLocker"
                  type="number"
                  value={totalLocker}
                  onChange={(e) => setTotalLocker(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Update
                </button>
              </form>

              {message && (
                <div
                  className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg transition-opacity duration-300 text-sm animate-fade-in-out ${
                    message.toLowerCase().includes("success")
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-2/3">
            <div className="bg-white shadow rounded-xl p-6 space-y-7">
              <h2 className="text-xl font-semibold">Helmet Locker in use</h2>

              {activeLockers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-center">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="px-4 py-2 font-semibold text-gray-700">
                          Locker ID
                        </th>
                        <th className="px-4 py-2 font-semibold text-gray-700">
                          User ID
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeLockers.map((locker) => (
                        <tr
                          key={locker.id}
                          className="bg-white hover:bg-gray-50 shadow-sm border-b border-gray-200"
                        >
                          <td className="px-4 py-2">{locker.id}</td>
                          <td className="px-4 py-2">{locker.tupcID}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No active lockers found.
                </p>
              )}
            </div>
          </div>

          <div className="fixed bottom-4 right-4 group z-50">
            <div className="bg-white text-blue-600 rounded-full w-12 h-12 flex items-center justify-center cursor-pointer shadow-lg hover:bg-gray-100 transition duration-200">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="absolute bottom-14 right-0 w-72 text-sm text-white bg-gray-900 p-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 shadow-lg">
              "Update" to adjust total locker slot. Value must not be less than
              10 or less than locker slots in use. This page also shows
              currently used lockers.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
