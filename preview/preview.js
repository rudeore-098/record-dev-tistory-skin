(() => {
  const root = document.documentElement;
  const theme = document.querySelector('[data-theme-toggle]');
  if (theme) theme.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    theme.textContent = root.dataset.theme === 'light' ? '☀' : '☾';
  });
  document.querySelectorAll('.category-toggle').forEach(button => button.addEventListener('click', () => {
    const branch = button.closest('.category-branch');
    const list = branch.querySelector(':scope > .sub_category_list');
    const open = branch.classList.toggle('is-open');
    list.hidden = !open;
    button.textContent = open ? '−' : '+';
    button.setAttribute('aria-expanded', String(open));
  }));
  const menu = document.querySelector('.mobile-menu');
  if (menu) menu.addEventListener('click', () => document.querySelector('.is-preview-rail')?.classList.toggle('is-open'));
})();
