"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CreateCoin() {
  const searchParams = useSearchParams();
  const preset = searchParams.get("preset");

  // XCP-420 preset values
  const xcp420Defaults = {
    price: "100000000",
    quantity_by_price: "1000",
    max_mint_per_tx: "1000",
    max_mint_per_address: "35000",
    hard_cap: "10000000",
    soft_cap: "4200000",
    duration: "1000",
    burn_payment: true,
    lock_quantity: true,
    divisible: false,
    premint_quantity: "0",
    minted_asset_commission: "0"
  };

  // Empty defaults
  const emptyDefaults = {
    price: "",
    quantity_by_price: "1",
    max_mint_per_tx: "",
    max_mint_per_address: "",
    hard_cap: "",
    soft_cap: "",
    duration: "",
    burn_payment: false,
    lock_quantity: false,
    divisible: false,
    premint_quantity: "0",
    minted_asset_commission: "0"
  };

  const defaults = preset === "xcp420" ? xcp420Defaults : emptyDefaults;

  const [formData, setFormData] = useState({
    asset: "",
    description: "",
    ...defaults
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual submission to Counterparty
    console.log("Form data:", formData);
    alert("Fairminter creation not yet implemented. This would submit to Counterparty.");
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
          ← Back to home
        </Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">Create Fairminter</h1>
        {preset === "xcp420" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
            Form pre-populated with XCP-420 standard values
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Asset Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-bold text-lg mb-4">Asset Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Name *
              </label>
              <input
                type="text"
                name="asset"
                value={formData.asset}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g. MYTOKEN"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                rows={3}
                placeholder="Optional description for your asset"
              />
            </div>
          </div>
        </div>

        {/* Mint Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-bold text-lg mb-4">Mint Settings</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (in satoshis) *
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="100000000 = 0.1 XCP"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity Per Price *
              </label>
              <input
                type="text"
                name="quantity_by_price"
                value={formData.quantity_by_price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Mint Per TX *
              </label>
              <input
                type="text"
                name="max_mint_per_tx"
                value={formData.max_mint_per_tx}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Mint Per Address
              </label>
              <input
                type="text"
                name="max_mint_per_address"
                value={formData.max_mint_per_address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="0 = unlimited"
              />
            </div>
          </div>
        </div>

        {/* Supply Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-bold text-lg mb-4">Supply Settings</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hard Cap *
              </label>
              <input
                type="text"
                name="hard_cap"
                value={formData.hard_cap}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Soft Cap
              </label>
              <input
                type="text"
                name="soft_cap"
                value={formData.soft_cap}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="0 = no soft cap"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (blocks)
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Number of blocks"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Premint Quantity
              </label>
              <input
                type="text"
                name="premint_quantity"
                value={formData.premint_quantity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commission (0-1)
              </label>
              <input
                type="text"
                name="minted_asset_commission"
                value={formData.minted_asset_commission}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="0.1 = 10%"
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-bold text-lg mb-4">Options</h2>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="burn_payment"
                checked={formData.burn_payment}
                onChange={handleChange}
                className="mr-3"
              />
              <span className="text-sm">
                <span className="font-medium">Burn XCP Payment</span>
                <span className="text-gray-500 ml-2">(XCP is destroyed when soft cap is reached)</span>
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="lock_quantity"
                checked={formData.lock_quantity}
                onChange={handleChange}
                className="mr-3"
              />
              <span className="text-sm">
                <span className="font-medium">Lock Supply</span>
                <span className="text-gray-500 ml-2">(Cannot issue more after fairminter closes)</span>
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="divisible"
                checked={formData.divisible}
                onChange={handleChange}
                className="mr-3"
              />
              <span className="text-sm">
                <span className="font-medium">Divisible</span>
                <span className="text-gray-500 ml-2">(Asset has 8 decimal places)</span>
              </span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Create Fairminter
          </button>
        </div>
      </form>
    </main>
  );
}