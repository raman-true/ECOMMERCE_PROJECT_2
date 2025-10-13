import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export function ShopSearchBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      newSearchParams.set('search', searchTerm);
    } else {
      newSearchParams.delete('search');
    }
    newSearchParams.delete('page'); // Reset page when search changes
    setSearchParams(newSearchParams);
  };

  return (
    <form onSubmit={handleSearchSubmit} className="mb-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 pl-12 rounded-lg border border-brown-300 text-brown-900 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
        <button type="submit" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brown-500 w-5 h-5">
          <Search />
        </button>
      </div>
    </form>
  );
}
