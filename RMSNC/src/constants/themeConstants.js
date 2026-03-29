
const THEME_KEY = `roomsync-theme`;

const applyTheme = (theme) => {
  document.documentElement.classList.toggle(`dark`, theme === `dark`);
  localStorage.setItem(THEME_KEY, theme);
  const btn = document.getElementById(`themeBtn`);
  if (btn) btn.textContent = theme === `dark` ? `☀️` : `🌙`;
};
 
const initTheme = () => {
  const saved = localStorage.getItem(THEME_KEY) || `light`;
  applyTheme(saved);
};

const toggleTheme = () => {
  const current = localStorage.getItem(THEME_KEY) || `light`;
  applyTheme(current === `dark` ? `light` : `dark`);
};