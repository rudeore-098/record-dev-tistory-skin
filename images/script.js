(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const conf = window.RECORD_CONFIG || {};
  const series = Array.isArray(conf.series) ? conf.series : [];
  const isHome = document.body.id === 'tt-body-index';
  const isPreview = location.pathname.includes('/preview/');
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
  const keyFor = u => { try { return decodeURI(new URL(u, location.href).pathname).replace(/\/$/, '') || '/'; } catch { return ''; } };
  const safeURL = u => { try { const v = new URL(u, location.href); return ['http:', 'https:'].includes(v.protocol) || (isPreview && v.protocol === 'file:') ? v.href : null; } catch { return null; } };
  const el = (tag, text, cls) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; };
  const entry = $('.entry[data-post-url]');
  const article = $('.article-body');
  const completed = new Set(read('record-completed', []));
  const metadata = new Map(Object.entries(conf.posts || {}).map(([u, m]) => [keyFor(u), m]));
  series.forEach(s => (s.posts || []).forEach((p, i) => metadata.set(keyFor(p.url), {...metadata.get(keyFor(p.url)), ...p, series: s, position: i + 1})));
  const metaFor = u => metadata.get(keyFor(u));
  const year = $('[data-year]'); if (year) year.textContent = new Date().getFullYear();
  document.body.classList.toggle('has-listing', Boolean($('.listing')));
  document.body.classList.toggle('has-entry', Boolean(article));
  const themeButton = $('[data-theme-toggle]');
  function showTheme() {
    const dark = document.documentElement.dataset.theme !== 'light';
    themeButton.textContent = dark ? '☾' : '☀';
    themeButton.setAttribute('aria-label', dark ? '라이트 모드로 전환' : '다크 모드로 전환');
  }
  function toggleTheme() {
    const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('record-theme', theme); } catch {}
    showTheme();
  }
  showTheme(); themeButton.addEventListener('click', toggleTheme);
  const menu = $('.mobile-menu'), rail = $('.rail');
  menu.addEventListener('click', () => menu.setAttribute('aria-expanded', String(rail.classList.toggle('is-open'))));
  function closeMenu() { rail.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); }
  rail.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('click', e => { if (!e.target.closest('.rail,.mobile-menu')) closeMenu(); });
  function openPostRow(row) {
    const url = safeURL(row.dataset.postUrl);
    if (url) location.href = url;
  }
  document.addEventListener('click', e => {
    const row = e.target.closest('.post-row[data-post-url]');
    if (!row || e.target.closest('a,button,input,select,textarea')) return;
    openPostRow(row);
  });
  document.addEventListener('keydown', e => {
    const row = e.target.closest('.post-row[data-post-url]');
    if (row && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openPostRow(row);
    }
  });

  function initCategoryTree() {
    $$('.rail-category li').forEach(item => {
      const children = item.querySelector(':scope > .sub_category_list');
      const link = item.querySelector(':scope > a');
      if (!children || !link) return;
      item.classList.add('category-branch', 'is-open');
      const toggle = el('button', '−', 'category-toggle');
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', link.textContent.trim() + ' 하위 카테고리 접기');
      toggle.addEventListener('click', () => {
        const open = item.classList.toggle('is-open');
        children.hidden = !open;
        toggle.textContent = open ? '−' : '+';
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', link.textContent.trim() + (open ? ' 하위 카테고리 접기' : ' 하위 카테고리 펼치기'));
      });
      item.insertBefore(toggle, link);
    });
  }
  initCategoryTree();

  function renderSeries() {
    const nav = $('[data-series-nav]'), grid = $('[data-series-grid]');
    nav.replaceChildren(); grid.replaceChildren();
    $('[data-series-count]').textContent = series.length;
    $('[data-series-empty]').hidden = series.length > 0;
    $('.no-series').hidden = series.length > 0;
    series.forEach((s, i) => {
      const posts = Array.isArray(s.posts) ? s.posts : [];
      const done = posts.filter(p => completed.has(keyFor(p.url))).length;
      const target = safeURL((posts.find(p => !completed.has(keyFor(p.url))) || posts[0] || {}).url || s.url);
      if (!target) return;
      const link = el('a', undefined, 'series-nav-link'); link.href = safeURL(s.url) || target;
      link.append(el('span', s.title), el('small', posts.length)); nav.append(link);
      const card = el('a', undefined, 'series-card'); card.href = target; card.dataset.seriesIndex = i;
      card.append(el('span', 'SERIES ' + String(i + 1).padStart(2, '0'), 'eyebrow'), el('h3', s.title));
      const bar = el('progress'); bar.max = Math.max(posts.length, 1); bar.value = done; bar.setAttribute('aria-label', s.title + ' 읽은 글');
      const label = el('small'); label.append(el('b', String(done)), document.createTextNode(' / ' + posts.length + ' 읽음'));
      card.append(bar, label); card.hidden = i >= 3; grid.append(card);
    });
    const all = $('[data-series-all]'); all.hidden = series.length <= 3;
  }
  renderSeries();
  $('[data-series-all]').addEventListener('click', e => {
    const expand = e.currentTarget.textContent.trim() !== '접기 ↑';
    $$('.series-card').forEach((c, i) => c.hidden = !expand && i >= 3);
    e.currentTarget.textContent = expand ? '접기 ↑' : 'ALL →';
  });
  const total = conf.totalPosts ?? Number(($('.rail-category .link_tit .c_cnt')?.textContent || '').replace(/\D/g, '') || NaN);
  if (Number.isFinite(total)) { $('[data-total-posts]').hidden = false; $('[data-total-posts] b').textContent = total; }
  const filters = $('.category-filters');
  if (filters) {
    const home = el('a', '전체', 'active'); home.href = $('.brand').href; filters.append(home);
    $$('.rail-category .category_list > li > a').forEach(a => {
      const n = el('a', a.cloneNode(true).textContent.replace(/\s*\([\d,]+\)\s*$/, '').trim()); n.href = a.href; filters.append(n);
    });
  }
  function decorate(root = document) {
    $$('.post-row', root).forEach(row => {
      const a = $('.post-link', row), meta = a && metaFor(a.href);
      const time = $('[data-read-time]', row);
      if (time && Number(meta?.minutes) > 0) { time.textContent = meta.minutes + '분'; time.title = '작성자가 설정한 예상 읽기 시간'; }
      const badge = $('[data-post-badge]', row);
      if (badge && (meta?.badge || row.dataset.category)) { badge.textContent = meta?.badge || row.dataset.category; badge.hidden = false; }
    });
  }
  decorate();
  // Home-only layout: introduction / chronological posts / navigation.
  function refreshTimeline() {
    if (!isHome) return;
    $$('.timeline-month').forEach(n => n.remove());
    const container = $('[data-latest-list]') || $('#main');
    let previous = '';
    $$('.post-row', container).forEach(row => {
      const time = $('time', row);
      if (!time) return;
      const raw = time.dataset.fullDate || time.textContent.trim();
      time.dataset.fullDate = raw;
      const match = raw.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
      if (!match) return;
      const [, year, month, day] = match;
      const group = year + '-' + month.padStart(2, '0');
      time.dateTime = group + '-' + day.padStart(2, '0');
      time.textContent = month.padStart(2, '0') + '. ' + day.padStart(2, '0');
      time.setAttribute('aria-label', year + '년 ' + Number(month) + '월 ' + Number(day) + '일');
      if (previous !== group) row.before(el('h2', year + '년 ' + Number(month) + '월', 'timeline-month'));
      previous = group;
    });
  }
  if (isHome) {
    const intro = $('.home-intro');
    $('.layout').insertBefore(intro, $('#main'));
    $('.rail-category h2').textContent = '카테고리';
    $('.rail-series h2').textContent = '시리즈';
    rail.insertBefore($('.rail-category'), $('.rail-series'));
    rail.append($('.series-section'));
    refreshTimeline();
  }
  const latest = $('[data-latest-list]'), popular = $('[data-popular-list]');
  if (latest && popular) {
    const category = $('.listing').dataset.currentCategory || '';
    const isCategory = document.body.id === 'tt-body-category';
    const rows = $$('#popular-source .post-row').filter(r => !isCategory || r.dataset.category === category || r.dataset.category.startsWith(category + '/'));
    rows.forEach(r => popular.append(r.cloneNode(true))); decorate(popular);
    if (!rows.length) popular.append(el('p', '티스토리에서 제공한 인기글 중 이 분류에 해당하는 글이 없습니다.', 'empty'));
    $$('[data-sort]').forEach(button => button.addEventListener('click', () => {
      const isPopular = button.dataset.sort === 'popular'; latest.hidden = isPopular; popular.hidden = !isPopular;
      $('.popular-info').hidden = !isPopular;
      if ($('.pagination')) $('.pagination').hidden = isPopular;
      $$('[data-sort]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    }));
  }
  const tags = $$('.tag-cloud a'); if ($('[data-tag-count]')) $('[data-tag-count]').textContent = tags.length + '개';

  const resume = $('[data-resume]'), last = read('record-last', null);
  if (last?.url && safeURL(last.url)) {
    resume.hidden = false; const url = new URL(last.url, location.href); url.hash = 'reading-position'; resume.href = url.href;
    $('[data-resume-title]').textContent = last.title + ' (' + Math.round(last.percent) + '%)'; $('progress', resume).value = last.percent;
  }

  // Native pagination remains usable if fetching a next page fails.
  const nextPage = $('[data-page-next]');
  let moreURL = nextPage?.getAttribute('href') ? nextPage.href : null;
  const loadButton = $('[data-load-more]');
  if (isHome && latest && moreURL) {
    $('.load-more-wrap').hidden = false; $('.pagination').hidden = true;
    loadButton.addEventListener('click', async () => {
      if (!moreURL) return;
      loadButton.disabled = true; $('[data-load-status]').textContent = '불러오는 중…';
      try {
        const url = new URL(moreURL, location.href); if (url.origin !== location.origin) throw Error('origin');
        const response = await fetch(url.href, {credentials:'same-origin'}); if (!response.ok) throw Error('http');
        const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
        const links = new Set($$('.post-link', latest).map(a => keyFor(a.href)));
        let count = 0;
        $$('.post-row', $('[data-latest-list]', doc) || doc).filter(r => !r.closest('#popular-source')).forEach(r => {
          const a = $('.post-link', r), target = a && new URL(a.getAttribute('href'), url.href);
          if (!target || target.origin !== location.origin || links.has(keyFor(target.href))) return;
          // Rebuild from text; never insert scripts or handlers from fetched markup.
          const thumbnail = $('.post-thumb img', r)?.getAttribute('src');
          const row = makeRow({url:target.href,title:a.textContent,date:$('time', r)?.textContent,summary:$('.post-copy p', r)?.textContent,category:r.dataset.category,thumbnail:thumbnail ? new URL(thumbnail,url.href).href : ''});
          latest.append(row); links.add(keyFor(target.href)); count++;
        });
        decorate(latest);
        refreshTimeline();
        const next = $('[data-page-next]', doc)?.getAttribute('href'); const resolved = next ? new URL(next, url.href).href : null;
        moreURL = resolved !== url.href ? resolved : null;
        if (!count) moreURL = null;
        loadButton.hidden = !moreURL; $('[data-load-status]').textContent = count ? count + '개 글을 더 불러왔습니다.' : '마지막 글입니다.';
      } catch { $('[data-load-status]').textContent = '불러오지 못했습니다. 아래 페이지 번호로 이동해 주세요.'; $('.pagination').hidden = false; }
      finally { loadButton.disabled = false; }
    });
  }
  function makeRow(p) {
    const row = el('article', undefined, 'post-row'); row.dataset.category = p.category || ''; row.dataset.postUrl = p.url; row.tabIndex = 0; row.setAttribute('role','link');
    const copy = el('div', undefined, 'post-copy'), title = el('div', undefined, 'post-title-line');
    const a = el('a', p.title, 'post-link'); a.href = p.url;
    const badge = el('span', undefined, 'post-badge'); badge.dataset.postBadge = ''; badge.hidden = true;
    title.append(a,badge); copy.append(title,el('p',p.summary || ''));
    const time = el('span', undefined, 'read-time'); time.dataset.readTime = '';
    row.append(el('time',p.date || ''),copy);
    if (p.thumbnail && safeURL(p.thumbnail)) {
      const thumb = el('a', undefined, 'post-thumb'); thumb.href = p.url; thumb.tabIndex = -1; thumb.setAttribute('aria-hidden','true');
      const image = el('img'); image.src = safeURL(p.thumbnail); image.alt = ''; image.loading = 'lazy'; image.decoding = 'async'; thumb.append(image); row.append(thumb);
    }
    row.append(time); return row;
  }

  // Search uses the real Tistory search route, not a partial client-side index.
  const dialog = $('#search-dialog'), query = $('#search-query'), results = $('.search-results');
  let opener = null, searchAbort = null, delay = null;
  const blogBase = new URL($('.brand').href, location.href);
  function searchURL(q) { return new URL('/search/' + encodeURIComponent(q), blogBase).href; }
  function openSearch(button) { opener = button || document.activeElement; if (!dialog.open) dialog.showModal(); query.focus(); }
  function closeSearch() { dialog.close(); opener?.focus?.(); }
  $$('[data-search-open]').forEach(b => b.addEventListener('click', () => openSearch(b)));
  $('[data-search-close]').addEventListener('click', closeSearch);
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeSearch(); } });
  dialog.addEventListener('close', () => opener?.focus?.());
  dialog.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); closeSearch(); return; }
    if (e.key !== 'Tab') return;
    const nodes = $$('button,input,a[href]', dialog).filter(n => n.getClientRects().length && !n.disabled);
    if(e.shiftKey && document.activeElement === nodes[0]){e.preventDefault();nodes.at(-1).focus();}
    else if(!e.shiftKey && document.activeElement === nodes.at(-1)){e.preventDefault();nodes[0].focus();}
  });
  function highlighted(target, text, term) {
    const index = text.toLocaleLowerCase().indexOf(term.toLocaleLowerCase());
    if (index < 0) { target.textContent = text; return; }
    target.append(document.createTextNode(text.slice(0,index)),el('mark',text.slice(index,index+term.length)),document.createTextNode(text.slice(index+term.length)));
  }
  async function doSearch() {
    clearTimeout(delay); searchAbort?.abort(); const term = query.value.trim();
    results.replaceChildren(); $('.all-results').hidden = true;
    if (!term) { $('.search-status').textContent = '검색어를 입력해 주세요.'; return; }
    const url = searchURL(term); const all = $('.all-results'); all.href = url;
    $('.search-status').textContent = '검색 중…';
    try {
      let hits, total;
      if (isPreview && Array.isArray(conf.previewSearch)) {
        hits = conf.previewSearch.filter(p => (p.title+' '+p.summary).toLocaleLowerCase().includes(term.toLocaleLowerCase())); total = hits.length;
      } else {
        searchAbort = new AbortController();
        const response = await fetch(url, {signal:searchAbort.signal,credentials:'same-origin'}); if (!response.ok) throw Error('search');
        const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
        const list = $('[data-latest-list]', doc);
        if (!list) throw Error('markup');
        hits = $$('.post-row',list).map(r => ({title:$('.post-link',r)?.textContent || '',url:$('.post-link',r)?.getAttribute('href'),summary:$('.post-copy p',r)?.textContent || ''}));
        total = $('.result-count',doc)?.textContent || hits.length + '개';
      }
      if (term !== query.value.trim()) return;
      $('.search-status').textContent = typeof total === 'number' ? total + '건 찾았습니다.' : total;
      hits.forEach(hit => {
        const safe = safeURL(hit.url); if(!safe)return;
        const a = el('a',undefined,'search-hit');a.href=safe;
        const title=el('strong'),summary=el('p');highlighted(title,hit.title,term);highlighted(summary,hit.summary,term);a.append(title,summary);results.append(a);
      });
      if (!hits.length) results.append(el('p','검색 결과가 없습니다. 다른 검색어를 입력해 보세요.','empty'));
      all.hidden = false;
    } catch(e) {
      if(e.name === 'AbortError')return;
      $('.search-status').textContent='검색 결과를 불러오지 못했습니다. 전체 검색 페이지를 이용해 주세요.';all.hidden=false;
    }
  }
  query.addEventListener('input', () => { searchAbort?.abort(); clearTimeout(delay); delay=setTimeout(doSearch,350); });
  $('.search-form').addEventListener('submit',e=>{e.preventDefault();doSearch();});

  if (article) {
    const title = $('.entry-header h1')?.textContent || document.title;
    const url = entry?.dataset.postUrl || location.href;
    const currentKey = keyFor(url), meta = metaFor(url);
    const minutes = Math.max(1,Math.ceil(article.textContent.replace(/\s/g,'').length/500));
    if($('[data-entry-time]')){ $('[data-entry-time]').textContent = (meta?.minutes || minutes)+'분'; $('[data-entry-time]').title='예상 읽기 시간'; }
    if (meta?.series) {
      const crumb = $('.breadcrumb');crumb.hidden=false;
      const a=el('a',meta.series.title);a.href=safeURL(meta.series.url)||$('.brand').href;crumb.append(a,document.createTextNode('/ '+String(meta.position).padStart(2,'0')));
      const position=$('[data-series-position]');position.hidden=false;position.textContent='시리즈 '+String(meta.position).padStart(2,'0')+' / '+String(meta.series.posts.length).padStart(2,'0');position.className='post-badge';
      const prev=meta.series.posts[meta.position-2], next=meta.series.posts[meta.position];
      const neighbors=$('.post-neighbors');neighbors.replaceChildren();
      [[prev,'prev','← 이전 글'],[next,'next','다음 글 →']].forEach(([p,dir,label])=>{if(p&&safeURL(p.url)){const a=el('a');a.href=safeURL(p.url);a.dataset[dir]='';a.append(el('small',label),el('span',p.title));neighbors.append(a);}});
    }
    const readingRail=$('.reading-rail');readingRail.hidden=false;
    const headings=$$('h2,h3',article);const toc=$('.toc ol');
    headings.forEach((h,i)=>{
      if(!h.id){let id='record-heading-'+(i+1);while(document.getElementById(id))id+='-x';h.id=id;}
      const li=el('li',undefined,h.tagName==='H3'?'depth-3':'');const a=el('a',h.textContent);a.href='#'+encodeURIComponent(h.id);li.append(a);toc.append(li);
    });
    if(!headings.length)$('.toc').hidden=true;
    let lastSaved=0,pending=false;
    function updateProgress() {
      pending=false;
      const top=article.getBoundingClientRect().top+scrollY;
      const end=top+article.offsetHeight;
      const available=end-top-innerHeight+100;
      const percent=Math.max(0,Math.min(100,available<=0?(scrollY+innerHeight>=end?100:0):(scrollY-top+100)/available*100));
      const rounded=Math.round(percent);
      $('.top-progress').style.width=rounded+'%';$('.reading-meter progress').value=rounded;$('[data-progress-label]').textContent=rounded+'%';
      let active=0;headings.forEach((h,i)=>{if(h.getBoundingClientRect().top<=150)active=i;});
      $$('.toc a').forEach((a,i)=>{if(i===active)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
      if(Date.now()-lastSaved>800 && scrollY>20){save('record-last',{url:safeURL(url),title,percent:rounded,y:scrollY});lastSaved=Date.now();}
      if(percent>=95 && !completed.has(currentKey)){completed.add(currentKey);save('record-completed',Array.from(completed));}
    }
    addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(updateProgress);}},{passive:true});addEventListener('resize',updateProgress);updateProgress();
    if(location.hash==='#reading-position' && keyFor(last?.url)===currentKey){requestAnimationFrame(()=>scrollTo({top:last.y||0,behavior:'instant'}));}
    addEventListener('pagehide',()=>{if(scrollY>20)save('record-last',{url:safeURL(url),title,percent:Number($('[data-progress-label]').textContent.replace('%','')),y:scrollY});});

    // Optional .code-tabs wrapper groups adjacent pre elements into file tabs.
    const handled=new Set();
    $$('.code-tabs',article).forEach(group=>buildCode(group,$$('pre',group)));
    $$('pre',article).forEach(pre=>{if(handled.has(pre))return;const shell=el('div');pre.before(shell);shell.append(pre);buildCode(shell,[pre]);});
    function buildCode(shell,pres) {
      if(!pres.length)return;shell.classList.add('code-shell');const bar=el('div',undefined,'code-bar');bar.setAttribute('role','tablist');bar.setAttribute('aria-label','코드 파일');
      let selected=0;const buttons=[];const idBase='code-'+$$('.code-shell').indexOf(shell)+'-'+Math.random().toString(36).slice(2,7);
      pres.forEach((pre,i)=>{
        handled.add(pre);const code=$('code',pre);const lang=(code?.className.match(/(?:language|lang)-([\w+-]+)/)||[])[1];
        const tab=el('button',pre.dataset.file || (pres.length>1?'파일 '+(i+1):lang || 'code'),'code-tab');tab.type='button';tab.setAttribute('role','tab');tab.id=idBase+'-tab-'+i;pre.id=idBase+'-panel-'+i;tab.setAttribute('aria-controls',pre.id);pre.setAttribute('role','tabpanel');pre.setAttribute('aria-labelledby',tab.id);buttons.push(tab);bar.append(tab);
        tab.addEventListener('click',()=>select(i));
        tab.addEventListener('keydown',e=>{let next=i;if(e.key==='ArrowRight')next=(i+1)%pres.length;else if(e.key==='ArrowLeft')next=(i+pres.length-1)%pres.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=pres.length-1;else return;e.preventDefault();select(next);buttons[next].focus();});
        if(code && !code.children.length)highlightCode(code);
      });
      const copy=el('button','COPY','copy-code');copy.type='button';copy.setAttribute('aria-label','현재 코드 복사');
      copy.addEventListener('click',async()=>{try{const code=$('code',pres[selected]);await navigator.clipboard.writeText((code||pres[selected]).textContent);copy.textContent='COPIED';}catch{copy.textContent='직접 선택해 복사';}setTimeout(()=>copy.textContent='COPY',1500);});
      // Copy is not a tab: keep it outside the tablist for accessible semantics.
      const barWrap=el('div',undefined,'code-bar-wrap');barWrap.append(bar,copy);shell.prepend(barWrap);
      function select(i){selected=i;pres.forEach((p,j)=>p.hidden=i!==j);buttons.forEach((b,j)=>{b.setAttribute('aria-selected',String(i===j));b.tabIndex=i===j?0:-1;});}select(0);
    }
  }
  function highlightCode(code) {
    const text=code.textContent;const re=/(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:if|else|for|while|return|const|let|var|class|new|try|catch|finally|import|from|def|public|void|int|float|async|await|throw|true|false|null)\b|\b\d+(?:\.\d+)?\b)/g;
    const frag=document.createDocumentFragment();let pos=0;
    for(const m of text.matchAll(re)){frag.append(document.createTextNode(text.slice(pos,m.index)));const s=m[0];let type=/^(\/\/|\/\*|#)/.test(s)?'comment':/^['"]/.test(s)?'string':/^\d/.test(s)?'number':'keyword';frag.append(el('span',s,'tok-'+type));pos=m.index+s.length;}frag.append(document.createTextNode(text.slice(pos)));code.replaceChildren(frag);
  }
  function top(){scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  $('[data-top]').addEventListener('click',top);
  document.addEventListener('keydown',e=>{
    const typing=e.target.closest('input,textarea,select,[contenteditable="true"],[role="textbox"]');
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();return;}
    if(e.key==='Escape'){closeMenu();return;}
    if(typing||dialog.open||e.ctrlKey||e.metaKey||e.altKey)return;
    if(e.key.toLowerCase()==='t'){e.preventDefault();toggleTheme();}
    else if(e.key.toLowerCase()==='g'){e.preventDefault();top();}
    else if(entry && ['j','k'].includes(e.key.toLowerCase())){const a=$(e.key.toLowerCase()==='j'?'[data-prev]':'[data-next]');if(a){e.preventDefault();location.href=a.href;}}
  });
})();
