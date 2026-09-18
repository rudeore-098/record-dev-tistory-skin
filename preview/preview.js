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
  document.addEventListener('click', event => {
    const row = event.target.closest('.post-row[data-post-url]');
    if (!row || event.target.closest('a,button,input,select,textarea')) return;
    location.href = row.dataset.postUrl;
  });
  document.addEventListener('keydown', event => {
    const row = event.target.closest('.post-row[data-post-url]');
    if (row && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      location.href = row.dataset.postUrl;
    }
  });
})();
