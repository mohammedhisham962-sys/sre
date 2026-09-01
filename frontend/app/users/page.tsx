'use client';
import Link from 'next/link';

export default function UsersManagement() {
  return (
    <main className="p-12 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">User Management (Admin)</h1>
        <Link href="/" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">This module is protected by RBAC logic and is only visible to ADMIN roles.</p>
        </div>
      </div>
    </main>
  );
}
