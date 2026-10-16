import { useCallback, useSyncExternalStore } from "react";



const CHANGE_EVENT = "steam-mcl:local-flag";

function read(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  }
  catch {
    return false;
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/**
 * @description
 * A boolean kept in local storage, such as a dismissed hint. It reads as unset on the server and when storage is
 * unavailable, and stays in sync across components and tabs.
 *
 * @param key - Storage key.
 * @returns The flag and a setter.
 */
export function useLocalFlag(key: string): [boolean, (value: boolean) => void] {
  const value = useSyncExternalStore(subscribe, () => read(key), () => false);

  const setValue = useCallback((next: boolean) => {
    try {
      if (next) {
        localStorage.setItem(key, "1");
      }
      else {
        localStorage.removeItem(key);
      }
    }
    catch {
      // Storage can be blocked, the flag then stays unset.
    }

    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, [key]);

  return [value, setValue];
}
