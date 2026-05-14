import { createContext, useContext, useState, useEffect } from "react";

var ThemeContext = createContext();

export function ThemeProvider({ children }) {
  var [theme, setTheme] = useState(function () {
    var saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(function () {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggle() {
    setTheme(function (t) { return t === "dark" ? "light" : "dark"; });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() { return useContext(ThemeContext); }
