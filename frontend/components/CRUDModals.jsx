"use client";
import { X } from "lucide-react";

export function AddModal({ isOpen, onClose, onSubmit }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      email: e.target.email.value,
      password: e.target.password.value,
      role: e.target.role.value,
    };
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Add Account</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="email" type="email" placeholder="Email" className="w-full px-4 py-2 border rounded-md" required />
          <input name="password" type="password" placeholder="Password" className="w-full px-4 py-2 border rounded-md" required />
          <select name="role" className="w-full px-4 py-2 border rounded-md" required>
            <option value="0">Super Admin</option>
            <option value="1">Admin</option>
          </select>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
            Add
          </button>
        </form>
      </div>
    </div>
  );
}

export function UpdateModal({ isOpen, onClose, onSubmit, account }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      id: account.id,
      password: e.target.password.value,
    };
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Update Password</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="password" type="password" placeholder="New Password" className="w-full px-4 py-2 border rounded-md" required />
          <button type="submit" className="w-full bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700">
            Update
          </button>
        </form>
      </div>
    </div>
  );
}

export function DeleteModal({ isOpen, onClose, onConfirm, account }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 text-center">
        <h2 className="text-lg font-semibold mb-4">Delete Account</h2>
        <p className="mb-6">
          Are you sure you want to delete <strong>{account?.email}</strong>?
        </p>
        <div className="flex justify-center gap-4">
          <button onClick={() => onConfirm(account.id)} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
            Delete
          </button>
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
