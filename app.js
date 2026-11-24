(() => {
  'use strict';
  const data = window.ACTONOMY_DATA;
  if (!data) return;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const aliases = {Evaluate: 'Evaluating', Reflection: 'Reflecting'};
  const label = name => aliases[name] || name;
  const groups = {
    Grounding: {color:'#54879b', bg:'#e8f1f4', description:'Connect with people, agents, tools, and environments.'},
    Retrieval: {color:'#6d91a8', bg:'#e9f1f5', description:'Bring relevant information into the current task.'},
    Reasoning: {color:'#9d8766', bg:'#f2ede3', description:'Analyze, generate, compare, and make sense of information.'},
    Planning: {color:'#7a9052', bg:'#eaf0de', description:'Break down a goal and organize the steps to pursue it.'},
    Evaluate: {color:'#5b9083', bg:'#e5f0eb', description:'Assess an outcome against references, requirements, or criteria.'},
    Deciding: {color:'#b18b50', bg:'#f4eddf', description:'Choose an action, an alternative, or whether to proceed.'},
    Executing: {color:'#65866b', bg:'#e9f0e5', description:'Carry out a plan, make a change, or finish the task.'},
    Reflection: {color:'#a07d9b', bg:'#f1eaf1', description:'Reconsider outcomes, errors, and feedback to inform what happens next.'},
    Learning: {color:'#8c83b2', bg:'#eeecf5', description:'Change knowledge, skills, instructions, or model parameters.'},
    Memory: {color:'#a0846c', bg:'#f2ece6', description:'Store, update, retrieve, consolidate, or discard remembered information.'}
  };
  const order = Object.keys(groups);
  const style = group => `--category:${groups[group]?.color || '#789169'};--category-bg:${groups[group]?.bg || '#ecf0e5'}`;
  const tax = data.taxonomy.taxonomy;
  const evidenceByCode = new Map();
  for (const row of data.codebook) {
    const code = row.taxonomy_code;
    if (!evidenceByCode.has(code)) evidenceByCode.set(code, []);
    evidenceByCode.get(code).push(row);
  }
  const leaves = tax.flatMap(action => action.subactions.flatMap(sub => sub.instances.map(leaf => ({...leaf, action: action.name, sub: sub.name, subCode: sub.code, evidence: evidenceByCode.get(leaf.code) || []}))));
  const taxState = {action:'Planning', query:'', leaf:'T2.1.1.2'};

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); return true; } catch (_) { /* try selection-based fallback */ }
    }
    const field = document.createElement('textarea');
    field.value = text;
    field.style.cssText = 'position:fixed;left:-10000px;top:0';
    document.body.appendChild(field);
    field.select();
    let result = false;
    try { result = document.execCommand('copy'); } catch (_) { result = false; }
    field.remove();
    return result;
  }

  const copyInstall = $('#copy-install');
  if (copyInstall) {
    const command = $('#install-command');
    const status = $('#install-status');
    let resetTimer;
    copyInstall.hidden = false;
    copyInstall.addEventListener('click', async () => {
      const copied = await copyText(command.textContent);
      clearTimeout(resetTimer);
      copyInstall.classList.toggle('is-copied', copied);
      status.textContent = copied ? 'Install command copied.' : 'Command selected for manual copying.';
      if (!copied) {
        const range = document.createRange();
        range.selectNodeContents(command);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
      resetTimer = setTimeout(() => {
        copyInstall.classList.remove('is-copied');
        status.textContent = '';
      }, 2200);
    });
  }

  function matches(leaf) {
    const q = taxState.query.toLowerCase().trim();
    return !q || [leaf.name, leaf.definition, leaf.code, leaf.action, label(leaf.action), leaf.sub, ...leaf.evidence.map(e => e.examples_raw)].join(' ').toLowerCase().includes(q);
  }

  function renderTaxonomy(resetScroll = false) {
    const query = taxState.query.trim();
    const resultLeaves = leaves.filter(leaf => matches(leaf) && (query || leaf.action === taxState.action));
    const selected = resultLeaves.find(leaf => leaf.code === taxState.leaf) || resultLeaves[0];
    if (selected) taxState.leaf = selected.code;
    $('#action-list').innerHTML = order.map(action => {
      const count = leaves.filter(leaf => leaf.action === action && matches(leaf)).length;
      const active = !query && action === taxState.action;
      return `<button data-action="${esc(action)}" class="${active?'active':''}" aria-pressed="${active}" style="${style(action)}"><span class="category-dot"></span><span>${esc(label(action))}</span><span>${count}</span></button>`;
    }).join('');
    if (query) {
      $('#action-heading').innerHTML = `<div class="action-title-row"><h3>Search the vocabulary</h3></div><p>Matching “${esc(query)}” across all 10 actions.</p><div class="action-meta"><span>${resultLeaves.length} LEAF ${resultLeaves.length === 1?'CATEGORY':'CATEGORIES'}</span></div>`;
      $('#taxonomy-count').textContent = `${resultLeaves.length} of ${leaves.length} leaf categories`;
    } else {
      const action = tax.find(a => a.name === taxState.action);
      $('#action-heading').innerHTML = `<div class="action-title-row" style="${style(action.name)}"><span class="category-dot"></span><h3>${esc(label(action.name))}</h3></div><p>${esc(groups[action.name].description)}</p><div class="action-meta"><span>${action.subactions.length} SUBACTIONS</span><span>${resultLeaves.length} LEAF CATEGORIES</span></div>`;
      $('#taxonomy-count').textContent = `${leaves.length} leaf categories`;
    }
    $('#reset-taxonomy').hidden = !query;
    const subGroups = new Map();
    resultLeaves.forEach(leaf => {
      const key = leaf.subCode;
      if (!subGroups.has(key)) subGroups.set(key, {action:leaf.action, name:leaf.sub, code:leaf.subCode, items:[]});
      subGroups.get(key).items.push(leaf);
    });
    $('#taxonomy-results').innerHTML = resultLeaves.length ? [...subGroups.values()].map(sub => `<div class="subaction-group"><div class="subaction-title">${query ? esc(label(sub.action)) + ' / ' : ''}${esc(sub.name)}<span>${esc(sub.code)}</span></div>${sub.items.map(leaf => `<button class="leaf-button ${leaf.code===taxState.leaf?'active':''}" data-leaf="${esc(leaf.code)}" aria-pressed="${leaf.code===taxState.leaf}"><span>${esc(leaf.name)}</span><span aria-hidden="true">↗</span></button>`).join('')}</div>`).join('') : '<div class="empty-results">No categories found.<br>Try “memory”, “plan”, or a code such as T2.1.</div>';
    renderLeaf(selected);
    if (resetScroll) $('.taxonomy-content').scrollTop = 0;
  }

  function renderLeaf(leaf) {
    if (!leaf) { $('#leaf-detail').innerHTML = '<div class="empty-results">Select a category to explore its evidence.</div>'; return; }
    const references = [...new Set(leaf.evidence.map(e => e.papers_cited).filter(Boolean))].join('; ');
    const theory = leaf.evidence.some(e => (e['human reviewers'] || '').includes('theory'));
    $('#leaf-detail').innerHTML = `<div class="detail-main"><div class="mono">A CLOSER LOOK</div><span class="detail-code mono">${esc(leaf.code)}</span><h4>${esc(leaf.name)}</h4><p class="detail-breadcrumb">${esc(label(leaf.action))} <span aria-hidden="true">→</span> ${esc(leaf.sub)}</p></div><div class="detail-evidence"><div class="detail-rule"></div><div class="mono">RELEASED DEFINITION / EXAMPLE</div><p class="detail-definition">${esc(leaf.definition)}</p><p class="detail-reference">${references ? 'Codebook references: ' + esc(references) : theory ? 'Theory-driven entry in the codebook.' : 'Source: the released taxonomy JSON.'}</p></div><div class="detail-actions"><button class="detail-copy" id="copy-category">Copy category link <span aria-hidden="true">↗</span></button><p id="category-copy-status" class="detail-feedback" role="status"></p></div>`;
    $('#copy-category').addEventListener('click', async () => {
      const url = new URL(window.location.href);
      url.hash = `taxonomy/${encodeURIComponent(leaf.code)}`;
      const copied = await copyText(url.href);
      $('#category-copy-status').textContent = copied ? 'Link copied.' : `Category: ${leaf.code}. Select the page URL to copy.`;
    });
  }

  if ($('#taxonomy')) {
  document.addEventListener('actonomy:map-select', event => {
    const leaf = leaves.find(item => item.code === event.detail?.code);
    if (!leaf) return;
    taxState.action = leaf.action; taxState.leaf = leaf.code; taxState.query = '';
    $('#taxonomy-search').value = '';
    renderTaxonomy(true);
    const button = $(`[data-leaf="${CSS.escape(leaf.code)}"]`);
    if (button) $('.taxonomy-content').scrollTop = button.offsetTop - $('.taxonomy-content').offsetTop - 100;
    if (event.detail.scroll) {
      history.replaceState(null, '', `#taxonomy/${encodeURIComponent(leaf.code)}`);
      $('.explorer').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
      button?.focus({preventScroll:true});
    }
  });
  $('#action-list').addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    taxState.action = button.dataset.action;
    taxState.query = ''; $('#taxonomy-search').value = '';
    taxState.leaf = leaves.find(leaf => leaf.action === taxState.action).code;
    renderTaxonomy(true);
    $(`[data-action="${CSS.escape(taxState.action)}"]`).focus({preventScroll:true});
  });
  $('#taxonomy-results').addEventListener('click', event => {
    const button = event.target.closest('[data-leaf]');
    if (!button) return;
    taxState.leaf = button.dataset.leaf;
    $$('.leaf-button').forEach(item => {
      const active = item.dataset.leaf === taxState.leaf;
      item.classList.toggle('active', active); item.setAttribute('aria-pressed', active);
    });
    renderLeaf(leaves.find(leaf => leaf.code === taxState.leaf));
    history.replaceState(null, '', `#taxonomy/${encodeURIComponent(taxState.leaf)}`);
    if (window.innerWidth <= 900) $('#leaf-detail').scrollIntoView({block:'nearest'});
  });
  $('#taxonomy-search').addEventListener('input', event => {taxState.query = event.target.value; renderTaxonomy(true);});
  $('#reset-taxonomy').addEventListener('click', () => {taxState.query = '';$('#taxonomy-search').value = '';renderTaxonomy(true);$('#taxonomy-search').focus();});
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !event.metaKey && !event.ctrlKey && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
      event.preventDefault(); $('.explorer').scrollIntoView(); $('#taxonomy-search').focus({preventScroll:true});
    }
  });
  }

  function readHash() {
    if (!$('#taxonomy')) return;
    if (location.hash === '#traces') {
      location.replace('trajectory-reports/index.html');
      return;
    }
    if (/^#traces\/c621c551(?:\/|$)/.test(location.hash)) {
      location.replace('reports/c621c551.report.html');
      return;
    }
    const match = location.hash.match(/^#taxonomy\/(.+)$/);
    if (!match) return;
    let code;
    try { code = decodeURIComponent(match[1]); } catch (_) { return; }
    const leaf = leaves.find(l => l.code === code);
    if (!leaf) return;
    taxState.leaf = leaf.code;taxState.action = leaf.action;taxState.query = '';
    $('#taxonomy-search').value = '';renderTaxonomy();
    requestAnimationFrame(() => {
      $('.explorer').scrollIntoView({behavior:'instant'});
      const item = $(`[data-leaf="${CSS.escape(code)}"]`);
      if (item) $('.taxonomy-content').scrollTop = item.offsetTop - $('.taxonomy-content').offsetTop - 100;
    });
  }
  window.addEventListener('hashchange', readHash);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {if(entry.isIntersecting) $$('nav a').forEach(link => link.classList.toggle('active',link.hash === `#${entry.target.id}`));});
    }, {rootMargin:'-20% 0px -60% 0px'});
    $$('main section[id]').forEach(section => observer.observe(section));
  }
  if ($('#taxonomy')) renderTaxonomy();
  readHash();
})();
