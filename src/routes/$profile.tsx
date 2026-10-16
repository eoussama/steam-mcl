import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { Footer } from "@/components/Footer";
import { ParticlesBackground } from "@/components/ParticlesBackground";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserResultsView } from "@/components/UserResultsView";
import { useLibraryAnalysis } from "@/features/analysis";
import { getProfileSlug, useLibrary, useProfile } from "@/features/profile/queries";
import { getErrorCode } from "@/lib/query/retry";



export const Route = createFileRoute("/$profile")({
  component: UserProfilePage,
});

function getErrorCopy(error: unknown): { title: string; message: string } {
  switch (getErrorCode(error)) {
    case "NOT_FOUND":
      return { title: "Profile Not Found", message: "No Steam profile matches that name or ID. Check it and try again." };

    case "BAD_REQUEST":
      return { title: "Invalid Profile", message: "Use a Steam ID64, a profile URL or a custom profile name." };

    case "TOO_MANY_REQUESTS":
      return { title: "Steam Is Busy", message: "Steam is limiting requests right now. Please try again in a minute." };

    default:
      return { title: "Something Went Wrong", message: "Steam could not be reached. Please try again in a moment." };
  }
}

function UserProfilePage() {
  const { profile: profileParam } = Route.useParams();
  const navigate = useNavigate();

  const profileQuery = useProfile(profileParam);
  const profile = profileQuery.data;
  const libraryQuery = useLibrary(profile?.steamId);
  const analysis = useLibraryAnalysis(libraryQuery.data?.isPrivate === false ? libraryQuery.data.games : undefined);

  useEffect(() => {
    if (profile && getProfileSlug(profile) !== profileParam) {
      void navigate({ to: "/$profile", params: { profile: getProfileSlug(profile) }, replace: true });
    }
  }, [navigate, profile, profileParam]);

  const handleBackToHome = () => {
    void navigate({ to: "/" });
  };

  const error = profileQuery.error ?? libraryQuery.error;
  const errorCopy = error ? getErrorCopy(error) : null;

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
            <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight steam-title mb-2">
              Steam
            </span>
          </button>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground-secondary)] bg-clip-text text-transparent">
            Missing Content Lookup
          </p>
        </div>

        {profileQuery.isPending && (
          <div className="w-full max-w-4xl px-4 animate-fadeInUp">
            <div className="relative bg-[var(--card-background)]/90 backdrop-blur-xl border border-[var(--card-border)]/50 rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-center space-x-3" role="status">
                <div className="w-8 h-8 border-4 border-[var(--steam-accent)]/30 border-t-[var(--steam-accent)] rounded-full animate-spin" />
                <span className="text-lg font-medium text-[var(--foreground)]">
                  Looking up
                  {" "}
                  {profileParam}
                  ...
                </span>
              </div>
            </div>
          </div>
        )}

        {errorCopy && (
          <div className="w-full max-w-4xl px-4 animate-fadeInUp">
            <div className="relative bg-[var(--card-background)]/90 backdrop-blur-xl border border-[var(--card-border)]/50 rounded-2xl shadow-2xl p-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center" role="alert">
                <h1 className="text-xl font-bold text-[var(--foreground)]">{errorCopy.title}</h1>
                <p className="text-[var(--foreground-muted)] max-w-md">{errorCopy.message}</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => void (profileQuery.error ? profileQuery.refetch() : libraryQuery.refetch())}
                    className="px-6 py-3 bg-[var(--background-secondary)]/60 hover:bg-[var(--steam-accent)]/10 border border-[var(--card-border)]/50 rounded-xl font-medium transition-all duration-300 cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToHome}
                    className="px-6 py-3 bg-[var(--steam-primary)] hover:bg-[var(--steam-primary)]/80 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    Back to Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {profile && !errorCopy && (
          <UserResultsView
            profile={profile}
            library={libraryQuery.data}
            analysis={analysis}
            onClose={handleBackToHome}
          />
        )}
      </div>

      <Footer />
    </main>
  );
}
