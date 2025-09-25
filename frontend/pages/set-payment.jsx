"use client";
import { useEffect, useState } from "react";
import axios from "axios";

import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";
import { HelpCircle } from "lucide-react";

export default function UpdateChargePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentCharge, setCurrentCharge] = useState("");
  const [currentValue, setCurrentValue] = useState(null);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(null);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/display-total-charge")
      .then((res) => {
        setCurrentCharge(res.data.currentCharge);
        setCurrentValue(res.data.currentCharge);
      })
      .catch(() => {
        setMessage("Failed to load current charge.");
        setIsSuccess(false);
      });
  }, []);
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setIsSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const number = Number(currentCharge);
    if (number < 0) {
      setMessage("Charge value cannot be negative.");
      setIsSuccess(false);
      return;
    }
    if (number === currentValue) {
      setMessage("Value is already the same. No update needed.");
      setIsSuccess(false);
      return;
    }
    try {
      await axios.put("http://localhost:5000/api/settings", {
        currentCharge: number,
      });
      setMessage("Charge updated successfully!");
      setIsSuccess(true);
      setCurrentValue(number);
    } catch {
      setMessage("Failed to update charge.");
      setIsSuccess(false);
    }
  };
  const handleFreeClick = async () => {
    if (currentValue === 0) {
      setMessage("Charge is already set to FREE (₱0).");
      setIsSuccess(false);
      return;
    }
    try {
      await axios.put("http://localhost:5000/api/settings", {
        currentCharge: 0,
      });
      setCurrentCharge(0);
      setCurrentValue(0);
      setMessage("Charge set to FREE (₱0).");
      setIsSuccess(true);
    } catch {
      setMessage("Failed to set charge to FREE.");
      setIsSuccess(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopBar onLogoClick={toggleSidebar} />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />
        <main className="flex-1 flex justify-center items-start pt-25 p-6 bg-gray-50">
          <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md space-y-6">
            <h1 className="text-xl font-semibold text-center">
              Adjust Charging Fee
            </h1>
            <p className="text-sm text-center text-gray-600">
              Current Charge: <strong>₱{currentValue}</strong>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="number"
                value={currentCharge}
                onChange={(e) => setCurrentCharge(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={handleFreeClick}
                  className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-200"
                >
                  Free
                </button>
              </div>
            </form>

            {message && (
              <div
                className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg transition-opacity duration-300 text-sm
      ${isSuccess ? "bg-green-500 text-white" : "bg-red-500 text-white"}
    `}
              >
                {message}
              </div>
            )}
          </div>
          <div className="fixed bottom-4 right-4 group z-50">
            <div className="bg-white text-blue-600 rounded-full w-12 h-12 flex items-center justify-center cursor-pointer shadow-lg hover:bg-gray-100 transition duration-200">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="absolute bottom-14 right-0 w-72 text-sm text-white bg-gray-900 p-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 shadow-lg">
              "Update" to save changes in fee and "Free" to set fee to 0
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
