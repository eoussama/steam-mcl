export const ErrorMessage: React.FC = () => {
  return (
    <div className="bg-[#f8f9fa] border border-[#dee2e6] rounded-lg p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-[#ffc107] rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-[#856404]"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[#2c3e50] text-sm leading-relaxed">
            Http failure response for https://cors-anywhere.herokuapp.com/http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=368F4B94FC9034A9A0261EA60AF74BB0&vanityurl=eoussama: 403 Forbidden
          </p>
        </div>
      </div>
    </div>
  );
}; 