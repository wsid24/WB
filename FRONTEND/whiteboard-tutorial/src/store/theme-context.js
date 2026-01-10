import { createContext } from "react";

const themeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
});

export default themeContext;
