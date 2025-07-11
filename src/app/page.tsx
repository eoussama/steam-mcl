import { SteamLogo } from './components/SteamLogo';
import { SearchSection } from './components/SearchSection';
import { ErrorMessage } from './components/ErrorMessage';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f5f5] relative overflow-hidden">
      {/* Background Steam Logo */}
      <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
        <SteamLogo size="large" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-[#2c3e50] mb-4">
            Steam
          </h1>
          <h2 className="text-3xl font-semibold text-[#34495e] mb-6">
            Missing Content Lookup
          </h2>
          <p className="text-lg text-[#6c757d] max-w-2xl mx-auto">
            Easily lookup up missing DLC, Sequels, Prequel, Spin-Offs... etc from your Steam library.
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <SearchSection />
        </div>

        {/* Error Message Section */}
        <div className="max-w-4xl mx-auto">
          <ErrorMessage />
        </div>
      </div>
    </main>
  );
}
