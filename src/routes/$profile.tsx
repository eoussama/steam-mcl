import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Footer } from "@/components/Footer";
import { ParticlesBackground } from "@/components/ParticlesBackground";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserResultsView } from "@/components/UserResultsView";
import { useSteamUserSearch } from "@/hooks/useSteam";



export const Route = createFileRoute("/$profile")({
  component: UserProfilePage,
});

function UserProfilePage() {
  const { profile } = Route.useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useSteamUserSearch(profile);

  const handleBackToHome = () => {
    void navigate({ to: "/" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background-secondary)] to-[var(--background-tertiary)] relative flex flex-col">
      <ParticlesBackground />

      <div className="absolute inset-0 bg-gradient-to-r from-[var(--steam-accent)]/5 to-transparent pointer-events-none" />

      <div className="absolute top-4 right-4 z-20 animate-fadeIn">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex flex-col items-center w-full py-8 relative z-10">
        <div className="w-full max-w-4xl mb-6 text-center flex-shrink-0">
          <button
            type="button"
            onClick={handleBackToHome}
            className="inline-block hover:scale-105 transition-transform duration-300 cursor-pointer"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight steam-title mb-2">
              Steam
            </h1>
          </button>
          <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground-secondary)] bg-clip-text text-transparent">
            Missing Content Lookup
          </h2>
        </div>

        {isLoading && (
          <div className="w-full max-w-4xl space-y-6 flex flex-col animate-fadeInUp">
            <div className="relative bg-[var(--card-background)]/90 backdrop-blur-xl border border-[var(--card-border)]/50 rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-8 h-8 border-4 border-[var(--steam-accent)]/30 border-t-[var(--steam-accent)] rounded-full animate-spin" />
                <span className="text-lg font-medium text-[var(--foreground)]">
                  Searching for
                  {" "}
                  {profile}
                  ...
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="w-full max-w-4xl space-y-6 flex flex-col animate-fadeInUp">
            <div className="relative bg-[var(--card-background)]/90 backdrop-blur-xl border border-[var(--card-border)]/50 rounded-2xl shadow-2xl p-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <h3 className="text-xl font-bold text-[var(--foreground)]">
                  User Not Found
                </h3>
                <p className="text-[var(--foreground-muted)] max-w-md">
                  Unable to find the Steam user &ldquo;
                  {profile}
                  &rdquo;. Please check the username and try again.
                </p>
                <button
                  type="button"
                  onClick={handleBackToHome}
                  className="px-6 py-3 bg-[var(--steam-primary)] hover:bg-[var(--steam-primary)]/80 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--steam-accent)]/50"
                >
                  Back to Search
                </button>
              </div>
            </div>
          </div>
        )}

        {data?.player && <UserResultsView data={data} onClose={handleBackToHome} />}
      </div>

      <Footer />
    </main>
  );
}
