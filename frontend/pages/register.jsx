"use client";
import { useEffect, useState } from "react";
import axios from "axios";

import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";
import { HelpCircle, Trash2 } from "lucide-react";

export default function RegisterUserPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tupcID, setTupcID] = useState("");
  const [balance, setBalance] = useState("");
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    const fetchUsers = () => {
      axios
        .get("http://localhost:5000/api/users")
        .then((res) => setUsers(res.data))
        .catch((err) => console.error("Failed to fetch active lockers", err));
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 5000);
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

  // ✅ Enforce format: TUPC-XX-XXXX (always uppercase)
  const idPattern = /^TUPC-\d{2}-\d{4}$/;
  const formattedID = tupcID.toUpperCase().trim();

  if (!idPattern.test(formattedID)) {
    setMessage("Invalid TUPC ID format. Use TUPC-##-####");
    return;
  }

  if (!formattedID || isNaN(balance)) {
    setMessage("Invalid input");
    return;
  }
  if (balance < 0) {
    setMessage("Initial value cannot be negative.");
    return;
  }

  try {
    const response = await axios.post("http://localhost:5000/api/insert-user", {
      tupcID: formattedID,
      balance: parseFloat(balance),
    });
    setMessage(response.data.message || "User inserted successfully");
    setTupcID("");
    setBalance("");
  } catch (error) {
    setMessage("User ID already registered");
  }
};


  const handleDelete = async (tupcID) => {
    if (!confirm(`Are you sure you want to delete user ${tupcID}?`)) return;

    try {
      await axios.delete(`http://localhost:5000/api/delete-user/${tupcID}`);
      setUsers((prev) => prev.filter((user) => user.tupcID !== tupcID));
      setMessage(`User ${tupcID} deleted successfully.`);
    } catch (error) {
      setMessage(`Failed to delete user ${tupcID}.`);
    }
  };
  const filteredUsers = users.filter((user) =>
    user.tupcID.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-2xl font-bold mb-4">Register New User</h1>
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
                  placeholder="Amount"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Register
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
              <h2 className="text-xl font-semibold">All registered users</h2>
              <div className="flex justify-end mb-3">
                <input
                  type="text"
                  placeholder="Search User ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-center">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="px-4 py-2 font-semibold text-gray-700">
                          User ID
                        </th>
                        <th className="px-4 py-2 font-semibold text-gray-700">
                          Balance
                        </th>
                        <th className="px-4 py-2 font-semibold text-gray-700"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr
                          key={user.tupcID}
                          className="bg-white hover:bg-gray-50 shadow-sm border-b border-gray-200"
                        >
                          <td className="px-4 py-2">{user.tupcID}</td>
                          <td className="px-4 py-2">₱{user.balance}</td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => handleDelete(user.tupcID)}
                              className="text-red-600 hover:text-red-800 transition duration-150"
                              title="Delete user"
                            >
                              <Trash2 className="w-5 h-5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No matching users found.
                </p>
              )}
            </div>
          </div>

          <div className="fixed bottom-4 right-4 group z-50">
            <div className="bg-white text-blue-600 rounded-full w-12 h-12 flex items-center justify-center cursor-pointer shadow-lg hover:bg-gray-100 transition duration-200">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="absolute bottom-14 right-0 w-72 text-sm text-white bg-gray-900 p-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 shadow-lg">
              To "Register" user enter TUPC ID and initial balance. This page
              also shows all users
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
