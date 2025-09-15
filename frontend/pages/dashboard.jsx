"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";
import { HelpCircle } from "lucide-react";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lockers, setLockers] = useState([]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const fetchLockers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/all-lockers"); // your API
        const data = await res.json();
        setLockers(data);
      } catch (err) {
        console.error("Failed to fetch lockers:", err);
      }
    };

    fetchLockers();
    const interval = setInterval(fetchLockers, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  // Group lockers into columns of 5 and reverse each column
  const columns = [];
  for (let i = 0; i < lockers.length; i += 5) {
    columns.push(lockers.slice(i, i + 5).reverse());
  }

  return (
    <div className="h-screen flex flex-col">
      {/* TopBar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopBar onLogoClick={toggleSidebar} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} />

        {/* Main Content */}
        <div className="flex-1 pt-25 p-6 overflow-y-auto bg-gray-50">
          <div className="bg-white shadow rounded-xl p-6">

            {/* Locker Grid */}
            <div className="flex justify-center">
              <div className="flex gap-6 p-6">
                {columns.map((col, colIndex) => (
                  <div key={colIndex} className="flex flex-col gap-3">
                    {col.map((locker) => (
                      <div
                        key={locker.id}
                        className={`relative w-24 h-24 flex flex-col items-center justify-center rounded-xl shadow-md`}
                        style={{
                          backgroundColor: locker.tupcID ? "white" : "#bbf7d0",
                          backgroundImage: locker.tupcID
                            ? "url('/helmet.png')" // 👈 put your image in /public
                            : "none",
                          backgroundSize: "50%",
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "center",
                        }}
                      >
                        {/* Locker number in top-right */}
                        <span className="absolute top-1 right-2 text-xs font-bold text-gray-700">
                          {locker.id}
                        </span>

                        {/* Show TUPC ID if occupied */}
                        {locker.tupcID && (
                          <span className="absolute bottom-1 text-[10px] font-semibold text-gray-700 bg-white/70 px-1 rounded">
                            {locker.tupcID}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Help Tooltip (bottom-right) */}
          <div className="fixed bottom-4 right-4 group z-50">
            <div className="bg-white text-blue-600 rounded-full w-12 h-12 flex items-center justify-center cursor-pointer shadow-lg hover:bg-gray-100 transition duration-200">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="absolute bottom-14 right-0 w-72 text-sm text-white bg-gray-900 p-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg">
              This dashboard shows the current locker status. Green = available
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
