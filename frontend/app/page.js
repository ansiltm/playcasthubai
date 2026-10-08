import React from 'react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24">
      <h1 className="text-6xl font-bold text-blue-600 mb-4">
        PlaycasthubAI
      </h1>
      <p className="text-xl text-gray-600 mb-8 text-center max-w-2xl">
        Your ultimate destination for RC, Toys, Diecast, and Hobby-grade items for all ages.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Storefront Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold mb-2">Storefront</h2>
          <p className="text-gray-600">Browse our collection of high-quality toys and models.</p>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Shop Now
          </button>
        </div>

        {/* Admin Dashboard Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold mb-2">Admin Panel</h2>
          <p className="text-gray-600">Manage products, inventory, and orders.</p>
          <button className="mt-4 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition">
            Login
          </button>
        </div>
      </div>
    </main>
  );
}
