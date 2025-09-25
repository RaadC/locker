"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { HelpCircle, Trash2, Settings, Plus } from "lucide-react";
import { AddModal, UpdateModal, DeleteModal } from "@/components/CRUDModals";

export default function SuperadminPage() {
  const [account, setAccount] = useState([]);
  const [loadHistory, setLoadHistory] = useState([]);
  const [lockerHistory, setLockerHistory] = useState([]);
  const [toast, setToast] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accRes, loadRes, lockerRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin-account"),
          axios.get("http://localhost:5000/api/load-history"),
          axios.get("http://localhost:5000/api/locker-history"),
        ]);

        setAccount(accRes.data || []);
        setLoadHistory(loadRes.data || []);
        setLockerHistory(lockerRes.data || []);
      } catch (err) {
        setToast({ message: "Failed to fetch data", type: "error" });
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleAddAccount = async (formData) => {
    try {
      await axios.post("http://localhost:5000/api/admin-account", {
        email: formData.email,
        password: formData.password,
        role: formData.role || 0,
      });
      setToast({ message: "Account added", type: "success" });
      setAddOpen(false);
    } catch (err) {
      setToast({ message: "Failed to add account", type: "error" });
    }
  };

  const handleUpdatePassword = async (formData) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin-account/${formData.id}`,
        {
          password: formData.password,
        }
      );
      setToast({ message: "Password updated", type: "success" });
      setUpdateOpen(null);
    } catch (err) {
      setToast({ message: "Failed to update password", type: "error" });
    }
  };

  const handleDeleteAccount = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin-account/${id}`);
      setToast({ message: "Account deleted", type: "success" });
      setDeleteOpen(null);
    } catch (err) {
      setToast({ message: "Failed to delete account", type: "error" });
    }
  };

  const handleDeleteLoadHistory = async () => {
    try {
      await axios.delete("http://localhost:5000/api/load-history");
      setLoadHistory([]);
      setToast({ message: "Load history cleared", type: "success" });
    } catch {
      setToast({ message: "Failed to delete load history", type: "error" });
    }
  };

  const handleDeleteLockerHistory = async () => {
    try {
      await axios.delete("http://localhost:5000/api/locker-history");
      setLockerHistory([]);
      setToast({ message: "Locker history cleared", type: "success" });
    } catch {
      setToast({ message: "Failed to delete locker history", type: "error" });
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
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopBar />
      </div>

      <div className="pt-20 px-6 flex justify-end">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          <Settings className="w-5 h-5" />
          Admin Control
        </Link>
      </div>

      <div className="flex-1 p-6 space-y-8">
        <div className="bg-white shadow rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Accounts</h2>
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Account
            </button>
          </div>
          {account.length > 0 ? (
            <table className="min-w-full text-sm text-center">
              <thead className="bg-blue-100">
                <tr>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {account.map((acc) => (
                  <tr
                    key={acc.id}
                    className="bg-white hover:bg-gray-50 border-b"
                  >
                    <td className="px-4 py-2">{acc.email}</td>
                    <td className="px-4 py-2">
                      {acc.role === 0 ? "Super Admin" : "Admin"}
                    </td>
                    <td className="px-4 py-2 flex gap-2 justify-center">
                      <button
                        onClick={() => setUpdateOpen(acc)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => setDeleteOpen(acc)}
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-500">No account data found.</p>
          )}
        </div>
        <div className="bg-white shadow rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Load History</h2>
            <button
              onClick={handleDeleteLoadHistory}
              className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" /> Delete History
            </button>
          </div>
          {loadHistory.length > 0 ? (
            <table className="min-w-full text-sm text-center">
              <thead className="bg-blue-100">
                <tr>
                  <th className="px-4 py-2">User ID</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {loadHistory.map((entry) => (
                  <tr
                    key={entry.id}
                    className="bg-white hover:bg-gray-50 border-b"
                  >
                    <td className="px-4 py-2">{entry.tupcID}</td>
                    <td className="px-4 py-2">₱{entry.addedAmount}</td>
                    <td className="px-4 py-2">{formatDate(entry.dateTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-500">No load history found.</p>
          )}
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Locker Usage History</h2>
            <button
              onClick={handleDeleteLockerHistory}
              className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" /> Delete History
            </button>
          </div>
          {lockerHistory.length > 0 ? (
            <table className="min-w-full text-sm text-center">
              <thead className="bg-blue-100">
                <tr>
                  <th className="px-4 py-2">User ID</th>
                  <th className="px-4 py-2">Locker ID</th>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {lockerHistory.map((entry) => (
                  <tr
                    key={entry.id}
                    className="bg-white hover:bg-gray-50 border-b"
                  >
                    <td className="px-4 py-2">{entry.tupcID}</td>
                    <td className="px-4 py-2">{entry.slotNumber}</td>
                    <td className="px-4 py-2">{entry.action}</td>
                    <td className="px-4 py-2">{formatDate(entry.dateTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-500">No locker history found.</p>
          )}
        </div>
      </div>

      <AddModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAddAccount}
      />
      <UpdateModal
        isOpen={!!updateOpen}
        onClose={() => setUpdateOpen(null)}
        onSubmit={handleUpdatePassword}
        account={updateOpen}
      />
      <DeleteModal
        isOpen={!!deleteOpen}
        onClose={() => setDeleteOpen(null)}
        onConfirm={handleDeleteAccount}
        account={deleteOpen}
      />

      {toast && (
        <div
          className={`fixed bottom-20 right-4 px-4 py-2 rounded-md shadow-lg text-white transition-transform duration-300 ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
