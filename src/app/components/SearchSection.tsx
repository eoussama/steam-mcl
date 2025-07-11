'use client';

import { useState } from 'react';

export const SearchSection: React.FC = () => {
  const [steamProfile, setSteamProfile] = useState('eoussama');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSteamProfile(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Functionality will be added later
    console.log('Searching for:', steamProfile);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="steam-profile" className="block text-sm font-medium text-[#6c757d] mb-2">
            Steam profile
          </label>
          <input
            id="steam-profile"
            type="text"
            value={steamProfile}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-[#ced4da] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1b2838] focus:border-transparent text-[#2c3e50]"
            placeholder="eoussama"
          />
          <p className="mt-2 text-sm text-[#6c757d]">
            You can also input{' '}
            <span className="text-[#1b2838] font-medium">Steam ID64</span>,{' '}
            <span className="text-[#1b2838] font-medium">Steam nickname</span>,{' '}
            <span className="text-[#1b2838] font-medium">Profile URL</span> and{' '}
            <span className="text-[#1b2838] font-medium">Profile permalink</span>.
          </p>
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-[#1b2838] text-white px-8 py-3 rounded-md hover:bg-[#2a3f5f] transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-[#1b2838] focus:ring-offset-2"
            aria-label="Search Steam profile"
          >
            🔍
          </button>
        </div>
      </form>
    </div>
  );
}; 