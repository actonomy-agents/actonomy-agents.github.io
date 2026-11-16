(() => {
  'use strict';
  const host = document.getElementById('taxonomy-map');
  const taxonomy = window.ACTONOMY_DATA?.taxonomy?.taxonomy;
  if (!host || !taxonomy) return;

  const $ = selector => host.querySelector(selector);
  const svg = $('#map-svg');
  const stage = $('#map-stage');
  const panel = $('#map-detail');
  const motionButton = $('#map-motion');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ns = 'http://www.w3.org/2000/svg';
  const esc = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const names = {Evaluate:'Evaluating', Reflection:'Reflecting'};
  const display = name => names[name] || name;
  const colors = {
    blue: {line:'#246fe5', ink:'#24529f', bg:'#edf3ff'},
    green: {line:'#16ae73', ink:'#15794f', bg:'#eaf8f1'},
    purple: {line:'#a044e7', ink:'#7834b0', bg:'#f5edfc'}
  };
  const palette = name => colors[['Grounding','Retrieval'].includes(name) ? 'blue' : ['Memory','Learning','Reflection'].includes(name) ? 'purple' : 'green'];
  const paint = name => {const c = palette(name); return `--branch:${c.line};--branch-ink:${c.ink};--branch-bg:${c.bg}`;};
  const descriptions = {
    Grounding:'Connect with people, agents, tools, and environments.',
    Retrieval:'Bring relevant information into the current task.',
    Planning:'Break down a goal and organize the steps to pursue it.',
    Reasoning:'Analyze, generate, compare, and make sense of information.',
    Evaluate:'Assess an outcome against references, requirements, or criteria.',
    Deciding:'Choose an action, an alternative, or whether to proceed.',
    Executing:'Carry out a plan, make a change, or finish the task.',
    Reflection:'Reconsider outcomes, errors, and feedback to inform what happens next.',
    Learning:'Change knowledge, skills, instructions, or model parameters.',
    Memory:'Store, update, retrieve, consolidate, or discard remembered information.'
  };
  // Compact figure labels; the detail panel always uses released names.
  const shortLabels = {
    'T1.1.1':'From skill library', 'T1.1.2':'From local corpus',
    'T1.1.3':'From external knowledge base', 'T1.1.4':'From open web', 'T1.1.5':'From relevant context',
    'T1.2.1':'Store information', 'T1.2.2':'Update information', 'T1.2.3':'Discard information',
    'T1.2.4':'Consolidate memory', 'T1.2.5':'Read memory',
    'T2.1.1':'Decompose task', 'T2.1.2':'Formulate workflow / plan', 'T2.1.3':'Select strategy', 'T2.1.4':'Modify plan',
    'T2.2.4':'Summarizing / distilling', 'T2.2.6':'Comparing & ranking', 'T2.2.8':'Combining & synthesis',
    'T2.3.1':'With gold', 'T2.3.2':'With goals / constraints', 'T2.3.3':'Without ground truth',
    'T2.4.3':'Accept / reject', 'T2.4.4':'Under uncertainty',
    'T3.1.1':'Interact with users', 'T3.1.2':'Interact with physical envs',
    'T3.1.3':'Interact with digital envs', 'T3.1.4':'Interact with other agents', 'T3.1.5':'External computation',
    'T4.1.1':'Update reasoning', 'T4.1.2':'Update grounding', 'T4.1.3':'New knowledge',
    'T4.1.4':'Update LLM parameters', 'T4.1.5':'Update instructions',
    'T4.2.1':'On errors / failures', 'T4.2.2':'On self-outcomes', 'T4.2.3':'On feedback'
  };
  const order = ['Memory','Grounding','Retrieval','Planning','Reasoning','Evaluate','Deciding','Executing','Reflection','Learning'];
  const actions = order.map(name => taxonomy.find(action => action.name === name)).filter(Boolean);
  const state = {angle:0, playing:!reducedMotion.matches, hover:false, focus:false, action:null, sub:null, leaf:null, zoom:1, drag:null};
  const sectors = [];
  const labels = [];
  let frame = 0;
  let previousTime = null;
  let onScreen = true;
  let suppressClick = false;

  function node(tag, attrs = {}, parent = svg) {
    const element = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
    parent.appendChild(element);
    return element;
  }
  function textNode(text, attrs, parent) {
    const element = node('text', attrs, parent);
    element.textContent = text;
    return element;
  }
  function point(radius, angle) {
    const radians = angle * Math.PI / 180;
    return [radius * Math.cos(radians), radius * Math.sin(radians)];
  }
  const xy = (radius, angle) => point(radius, angle).map(v => v.toFixed(3)).join(',');
  const normalize = angle => ((angle % 360) + 360) % 360;
  function arc(radius, start, end) {
    return `M${xy(radius,start)} A${radius},${radius} 0 ${end-start>180?1:0} 1 ${xy(radius,end)}`;
  }

  node('circle', {r:454, class:'map-orbit', 'aria-hidden':'true'});
  node('circle', {r:212, class:'map-inner-orbit', 'aria-hidden':'true'});
  const rotor = node('g', {id:'map-rotor'});
  const step = 360 / (actions.reduce((sum,a) => sum + a.subactions.length, 0) + actions.length * 2);
  let cursor = -88;
  actions.forEach(action => {
    const span = (action.subactions.length + 2) * step;
    const middle = cursor + span / 2;
    const sector = node('g', {class:'map-sector', style:paint(action.name), 'data-map-sector':action.name}, rotor);
    sectors.push({name:action.name, element:sector});
    node('path', {d:arc(454, cursor + 3, cursor + span - 3), class:'map-sector-arc', 'aria-hidden':'true'}, sector);
    node('circle', {cx:point(95,middle)[0],cy:point(95,middle)[1],r:2.6,class:'map-root','aria-hidden':'true'}, sector);

    action.subactions.forEach((sub,index) => {
      const angle = cursor + (index + 1.5) * step;
      const group = node('g', {class:'map-subaction',role:'button',tabindex:'0','data-map-sub':sub.code,'data-map-action':action.name,'aria-label':`${display(action.name)}: ${sub.name}, ${sub.instances.length} leaf categories`, 'aria-pressed':'false'}, sector);
      node('path', {class:'map-branch-line',d:`M${xy(95,middle)} C${xy(144,middle)} ${xy(157,angle)} ${xy(212,angle)}`,'aria-hidden':'true'}, group);
      sub.instances.forEach((leaf,i) => {
        const leafAngle = angle + (i - (sub.instances.length-1)/2) * Math.min(.85,3.5 / Math.max(1,sub.instances.length-1));
        node('path', {class:'map-leaf-line',d:`M${xy(171,angle)} Q${xy(186,angle)} ${xy(201,leafAngle)}`,'aria-hidden':'true'}, group);
        const [cx,cy] = point(201,leafAngle);
        node('circle', {class:'map-leaf-dot',cx,cy,r:1.65,'data-map-leaf':leaf.code,'aria-hidden':'true'}, group);
      });
      const [cx,cy] = point(212,angle);
      node('circle', {class:'map-sub-dot',cx,cy,r:2.5,'aria-hidden':'true'}, group);
      const labelGroup = node('g', {class:'map-sub-label',transform:`rotate(${angle})`}, group);
      const hit = node('rect', {class:'map-node-hit',x:219,y:-10,width:220,height:20,rx:4}, labelGroup);
      const text = textNode(shortLabels[sub.code] || sub.name, {x:225,y:0,'dominant-baseline':'middle'}, labelGroup);
      labels.push({kind:'sub',group:labelGroup,text,hit,angle});
    });

    const category = node('g', {class:'map-action',role:'button',tabindex:'0','data-map-action':action.name,'aria-label':`${display(action.name)}, ${action.subactions.length} subactions`,'aria-pressed':'false'}, sector);
    const [cx,cy] = point(454,middle);
    node('circle', {class:'map-action-dot',cx,cy,r:7.5,'aria-hidden':'true'}, category);
    const [x,y] = point(488,middle);
    const labelGroup = node('g', {transform:`translate(${x},${y})`}, category);
    const width = Math.max(85, display(action.name).length * 12.5);
    const hit = node('rect', {class:'map-node-hit',x:-width/2-7,y:-18,width:width+14,height:36,rx:9}, labelGroup);
    const text = textNode(display(action.name), {x:0,y:0,'text-anchor':'middle','dominant-baseline':'middle'}, labelGroup);
    labels.push({kind:'action',group:labelGroup,text,hit,width,x,y,angle:middle});
    cursor += span;
  });
  const center = node('g', {'aria-hidden':'true'});
  node('circle', {r:79,class:'map-core-circle'}, center);
  node('image', {href:'assets/actonomy_icon.png',x:-37,y:-52,width:74,height:83,preserveAspectRatio:'xMidYMid meet'}, center);
  textNode('Act*ONOMY',{x:0,y:51,class:'map-core-name','text-anchor':'middle'},center);

  function drawAngle() {
    rotor.setAttribute('transform',`rotate(${state.angle})`);
    labels.forEach(label => {
      if (label.kind === 'action') {
        label.group.setAttribute('transform',`translate(${label.x},${label.y}) rotate(${-state.angle})`);
        const direction = Math.cos((label.angle + state.angle) * Math.PI / 180);
        const offset = label.width / 2 * Math.max(-1,Math.min(1,direction / .35));
        label.text.setAttribute('x',offset);
        label.hit.setAttribute('x',offset-label.width/2-7);
      } else {
        const flipped = normalize(label.angle + state.angle) > 90 && normalize(label.angle + state.angle) < 270;
        if (label.flipped === flipped) return;
        label.flipped = flipped;
        label.group.setAttribute('transform',`rotate(${label.angle + (flipped ? 180 : 0)})`);
        label.text.setAttribute('x',flipped ? -225 : 225);
        label.text.setAttribute('text-anchor',flipped ? 'end' : 'start');
        label.hit.setAttribute('x',flipped ? -439 : 219);
      }
    });
  }
  function highlight(name = state.action) {
    sectors.forEach(sector => sector.element.classList.toggle('is-muted',Boolean(name && sector.name !== name)));
    svg.querySelectorAll('[data-map-sub]').forEach(element => {
      const active = element.dataset.mapSub === state.sub;
      element.classList.toggle('is-selected',active);
      element.setAttribute('aria-pressed',String(active));
    });
    svg.querySelectorAll('.map-action').forEach(element => element.setAttribute('aria-pressed',String(element.dataset.mapAction === state.action)));
  }

  function renderPanel(focusTarget = null) {
    const action = actions.find(a => a.name === state.action);
    if (!action) {
      panel.removeAttribute('style');
      panel.innerHTML = `<p class="map-detail-kicker">THE BIG PICTURE</p><h3>A map of<br>agent behavior.</h3><p class="map-detail-description">Follow a branch from an action to the concrete behaviors beneath it.</p><div class="map-action-picker">${actions.map(a => `<button type="button" data-panel-action="${esc(a.name)}" style="${paint(a.name)}"><span class="map-color-dot" aria-hidden="true"></span>${esc(display(a.name))}</button>`).join('')}</div><p class="map-detail-note">Choose an action or a subaction.<br>Each small dot represents a leaf category in the released taxonomy.</p>`;
    } else {
      panel.setAttribute('style',paint(action.name));
      const sub = action.subactions.find(s => s.code === state.sub);
      const leaf = sub?.instances.find(l => l.code === state.leaf);
      const title = sub ? sub.name : display(action.name);
      const count = sub ? `${sub.instances.length} LEAF ${sub.instances.length===1?'CATEGORY':'CATEGORIES'}` : `${action.subactions.length} SUBACTIONS · ${action.subactions.reduce((n,s)=>n+s.instances.length,0)} LEAVES`;
      panel.innerHTML = `<button type="button" class="map-back" data-panel-back="${sub?'action':'all'}">← ${sub?esc(display(action.name)):'All actions'}</button><p class="map-detail-kicker">${esc(sub?display(action.name):action.code)} / ${sub?'SUBACTION':'ACTION'}</p><h3 class="map-selected-title" tabindex="-1">${esc(title)}</h3>${sub?'':`<p class="map-detail-description">${esc(descriptions[action.name])}</p>`}<div class="map-detail-count">${esc(count)}</div><div class="map-detail-list">${sub ? sub.instances.map(l => `<button type="button" data-panel-leaf="${esc(l.code)}" aria-pressed="${l.code===state.leaf}"><span>${esc(l.name)}</span><span aria-hidden="true">→</span></button>`).join('') : action.subactions.map(s => `<button type="button" data-panel-sub="${esc(s.code)}"><span>${esc(s.name)}</span><span>${s.instances.length}</span></button>`).join('')}</div>${leaf?`<div class="map-leaf-definition"><p class="map-detail-kicker">${esc(leaf.code)} · DEFINITION / EXAMPLE</p><h4>${esc(leaf.name)}</h4><p>${esc(leaf.definition)}</p></div>`:''}<button type="button" class="map-open-codebook" data-open-codebook>Open in the full codebook <span aria-hidden="true">↓</span></button>`;
    }
    if (focusTarget) panel.querySelector(focusTarget)?.focus({preventScroll:true});
  }

  function selectedCode() {
    const action = actions.find(a => a.name === state.action);
    const sub = action?.subactions.find(s => s.code === state.sub);
    return state.leaf || sub?.instances[0]?.code || action?.subactions[0]?.instances[0]?.code;
  }
  function syncExplorer(scroll = false) {
    const code = selectedCode();
    if (code) document.dispatchEvent(new CustomEvent('actonomy:map-select',{detail:{code,scroll}}));
  }
  function choose(actionName, subCode = null, leafCode = null, focusTarget = null) {
    state.action = actionName;
    state.sub = subCode;
    const sub = actions.find(a => a.name === actionName)?.subactions.find(s => s.code === subCode);
    state.leaf = leafCode || (sub?.instances.length === 1 ? sub.instances[0].code : null);
    state.playing = false;
    highlight();
    renderPanel(focusTarget);
    syncExplorer();
    updateMotion();
  }
  function activateNode(target) {
    const button = target.closest('[data-map-action]');
    if (button) choose(button.dataset.mapAction,button.dataset.mapSub || null);
  }
  svg.addEventListener('click',event => {
    if (suppressClick) {suppressClick = false;return;}
    activateNode(event.target);
  });
  svg.addEventListener('keydown',event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.closest('[data-map-action]')) {
      event.preventDefault();activateNode(event.target);
    } else if (event.key === 'Escape') reset();
  });
  svg.addEventListener('pointerover',event => {
    if (state.drag?.moved) return;
    const action = event.target.closest('[data-map-action]');
    if (action) highlight(action.dataset.mapAction);
  });
  svg.addEventListener('pointerout',event => {
    const next = event.relatedTarget?.closest?.('[data-map-action]');
    if (!next) highlight();
  });
  panel.addEventListener('click',event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.panelAction) choose(button.dataset.panelAction,null,null,'.map-selected-title');
    else if (button.dataset.panelSub) choose(state.action,button.dataset.panelSub,null,'.map-selected-title');
    else if (button.dataset.panelLeaf) choose(state.action,state.sub,button.dataset.panelLeaf,`[data-panel-leaf="${button.dataset.panelLeaf}"]`);
    else if (button.dataset.panelBack === 'action') choose(state.action,null,null,'.map-selected-title');
    else if (button.dataset.panelBack === 'all') {state.action = state.sub = state.leaf = null;highlight();renderPanel('[data-panel-action]');}
    else if (button.hasAttribute('data-open-codebook')) syncExplorer(true);
  });

  function running() {
    return state.playing && !state.hover && !state.focus && !state.drag && !document.hidden && onScreen;
  }
  function animate(time) {
    frame = 0;
    if (!running()) {previousTime = null;return;}
    if (previousTime !== null) state.angle = normalize(state.angle + Math.min(time - previousTime,100) * 360 / 300000);
    previousTime = time;
    drawAngle();
    frame = requestAnimationFrame(animate);
  }
  function updateMotion() {
    const active = running();
    host.classList.toggle('is-paused',!active);
    motionButton.textContent = state.playing ? 'Pause rotation' : 'Resume rotation';
    motionButton.setAttribute('aria-label',motionButton.textContent);
    $('#map-motion-status').textContent = !state.playing ? 'Rotation paused' : state.hover || state.focus ? 'Paused for reading' : 'Slowly rotating';
    if (active && !frame) {previousTime = null;frame = requestAnimationFrame(animate);}
    if (!active && frame) {cancelAnimationFrame(frame);frame = 0;previousTime = null;}
  }
  motionButton.addEventListener('click',() => {state.playing = !state.playing;updateMotion();});
  stage.addEventListener('pointerenter',event => {if(event.pointerType!=='touch'){state.hover=true;updateMotion();}});
  stage.addEventListener('pointerleave',() => {state.hover=false;highlight();updateMotion();});
  stage.addEventListener('focusin',event => {state.focus=true;highlight(event.target.closest('[data-map-action]')?.dataset.mapAction);updateMotion();});
  stage.addEventListener('focusout',event => {state.focus=stage.contains(event.relatedTarget);if(!state.focus)highlight();updateMotion();});
  document.addEventListener('visibilitychange',updateMotion);
  reducedMotion.addEventListener('change',() => {state.playing=!reducedMotion.matches;updateMotion();});
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {onScreen=entries[0].isIntersecting;updateMotion();},{rootMargin:'80px'}).observe(host);
  }

  function pointerAngle(event) {
    const rect = svg.getBoundingClientRect();
    return Math.atan2(event.clientY-rect.top-rect.height/2,event.clientX-rect.left-rect.width/2)*180/Math.PI;
  }
  stage.addEventListener('pointerdown',event => {
    if (event.button!==0 || event.pointerType==='touch') return;
    suppressClick = false;
    state.drag = {id:event.pointerId,x:event.clientX,y:event.clientY,last:pointerAngle(event),moved:false};
    updateMotion();
  });
  stage.addEventListener('pointermove',event => {
    const drag = state.drag;
    if (!drag || drag.id !== event.pointerId) return;
    if (!drag.moved && Math.hypot(event.clientX-drag.x,event.clientY-drag.y)<5) return;
    if (!drag.moved) {drag.moved=true;state.playing=false;stage.setPointerCapture(event.pointerId);stage.classList.add('is-dragging');}
    const angle = pointerAngle(event);
    state.angle = normalize(state.angle + ((angle-drag.last+540)%360)-180);
    drag.last = angle;
    drawAngle();updateMotion();
  });
  function stopDrag(event) {
    if (!state.drag || state.drag.id!==event.pointerId) return;
    suppressClick = state.drag.moved;
    state.drag = null;
    stage.classList.remove('is-dragging');
    if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);
    updateMotion();
  }
  window.addEventListener('pointerup',stopDrag);
  stage.addEventListener('pointercancel',stopDrag);
  stage.addEventListener('lostpointercapture',stopDrag);

  function setZoom(value) {
    const old = state.zoom;
    const centerX = (stage.scrollLeft + stage.clientWidth/2) / old;
    const centerY = (stage.scrollTop + stage.clientHeight/2) / old;
    state.zoom = Math.round(Math.min(2,Math.max(1,value))*100)/100;
    svg.style.width = `${state.zoom*100}%`;
    svg.style.height = `${state.zoom*100}%`;
    stage.scrollLeft = centerX*state.zoom-stage.clientWidth/2;
    stage.scrollTop = centerY*state.zoom-stage.clientHeight/2;
    $('#map-zoom-level').textContent = `${Math.round(state.zoom*100)}%`;
    $('#map-zoom-out').disabled = state.zoom===1;
    $('#map-zoom-in').disabled = state.zoom===2;
  }
  $('#map-zoom-in').addEventListener('click',() => setZoom(state.zoom+.25));
  $('#map-zoom-out').addEventListener('click',() => setZoom(state.zoom-.25));
  function reset() {
    state.angle=0;state.action=state.sub=state.leaf=null;state.playing=!reducedMotion.matches;
    setZoom(1);drawAngle();highlight();renderPanel();updateMotion();
  }
  $('#map-reset').addEventListener('click',reset);
  drawAngle();renderPanel();updateMotion();
})();
