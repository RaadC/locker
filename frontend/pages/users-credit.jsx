"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";
import { HelpCircle } from "lucide-react";

export default function UserCreditsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tupcID, setTupcID] = useState("");
  const [amount, setAmount] = useState("");
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    const fetchHistory = () => {
      axios
        .get("http://localhost:5000/api/load-history")
        .then((res) => setHistory(res.data))
        .catch((err) => console.error("Failed to fetch load history", err));
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
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
    if (!tupcID || isNaN(amount)) {
      setMessage("Please enter valid values.");
      return;
    }

    try {
      const response = await axios.put(
        "http://localhost:5000/api/add-credits",
        {
          tupcID,
          amount: parseFloat(amount),
        }
      );

      setMessage(response.data.message || "Balance updated successfully");
      setTupcID("");
      setAmount("");
    } catch (error) {
      setMessage("User ID to update does not exists");
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
        <div className="flex flex-1 flex-col lg:flex-row pt-25 gap-6 overflow-y-auto p-6 bg-gray-50">
          <div className="w-full lg:w-1/3">
            <div className="bg-white shadow rounded-xl p-6 space-y-6">
              <h1 className="text-2xl font-bold">
                Add Users Credit
              </h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="TUPC ID"
                  value={tupcID}
                  onChange={(e) => setTupcID(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Amount to Add"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Add Credits
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
              <h2 className="text-xl font-semibold">Credit Load History</h2>
              {history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-center">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="px-4 py-2 font-semibold text-gray-700">
                          Transac. ID
                        </th>
                        <th className="px-4 py-2 font-semibold text-gray-700">
                          User ID
                        </th>
                        <th className="px-4 py-2 font-semibold text-gray-700">
                          Added Amount
                        </th>
                        <th className="px-4 py-2 font-semibold text-gray-700">
                          Time Updated
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((entry) => (
                        <tr
                          key={entry.id}
                          className="bg-white hover:bg-gray-50 shadow-sm border-b border-gray-200"
                        >
                          <td className="px-4 py-2">{entry.id}</td>
                          <td className="px-4 py-2">{entry.tupcID}</td>
                          <td className="px-4 py-2">{entry.addedAmount}</td>
                          <td className="px-4 py-2">
                            {formatDate(entry.dateTime)}
                          </td>
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
              To "Add balance" enter TUPC ID and amount to be added. This page
              also shows balance update transactions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
