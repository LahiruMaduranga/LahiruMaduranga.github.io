(() => {
  const themeButtons = document.querySelectorAll('[data-set-theme]');
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    themeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.setTheme === theme)));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#080808' : '#ffffff');
  }
  setTheme(document.documentElement.dataset.theme || 'light');
  themeButtons.forEach(button => button.addEventListener('click', () => {
    const theme = button.dataset.setTheme;
    setTheme(theme);
    try { localStorage.setItem('lahiru-theme', theme); } catch {}
  }));
  const filters = document.querySelectorAll('[data-filter]');
  filters.forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => {
      const category = button.dataset.filter;
      filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
      let visible = 0;
      document.querySelectorAll('[data-category]').forEach(card => {
        card.hidden = category !== 'All' && card.dataset.category !== category;
        if (!card.hidden) visible++;
      });
      document.querySelector('[data-filter-status]').textContent = `${visible} ${visible === 1 ? 'project' : 'projects'} shown`;
    });
  });
})();
