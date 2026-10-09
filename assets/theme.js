// Runs before styles load, so the selected palette is used on the first paint.
(() => {
  const root = document.documentElement;
  let saved;
  try { saved = localStorage.getItem('lahiru-theme'); } catch {}
  const entry = root.dataset.themeEntry;
  const preferred = 'dark';
  const theme = entry || (['light', 'dark'].includes(saved) ? saved : preferred);
  root.dataset.theme = theme;
  if (entry) { try { localStorage.setItem('lahiru-theme', theme); } catch {} }
})();
