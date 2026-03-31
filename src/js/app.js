import MENU_DB from './menu-data.js';

// ===== State =====
let currentDishes = [];  // [{name, time, source}]
let currentSoups = [];
let lockedDishes = {};   // index -> dish object
let lockedSoups = {};

// ===== DOM helpers =====
const $ = (id) => document.getElementById(id);

// ===== Menu logic =====
function getSelectedSources() {
  const checkboxes = document.querySelectorAll('#menuSources input[type="checkbox"]:checked');
  return Array.from(checkboxes).map(cb => cb.value);
}

function getActiveMenu() {
  const sources = getSelectedSources();
  const categories = ['hard', 'fastMeat', 'veg', 'cold', 'soup'];

  if (sources.length === 0) {
    // Nothing selected, use all
    const merged = Object.fromEntries(categories.map(c => [c, []]));
    for (const [src, menu] of Object.entries(MENU_DB)) {
      for (const cat of categories) {
        merged[cat].push(...menu[cat].map(d => ({ ...d, source: src })));
      }
    }
    return merged;
  }

  const merged = Object.fromEntries(categories.map(c => [c, []]));
  for (const src of sources) {
    const menu = MENU_DB[src];
    if (!menu) continue;
    for (const cat of categories) {
      merged[cat].push(...menu[cat].map(d => ({ ...d, source: src })));
    }
  }
  return merged;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ===== Generate =====
function generateMenu() {
  const dCount = parseInt($('dishCount').value);
  const sCount = parseInt($('soupCount').value);
  const MENU = getActiveMenu();

  const selectedDishes = [];
  const usedNames = new Set();

  // First dish: prefer hard dishes
  if (dCount >= 1) {
    if (lockedDishes[0]) {
      selectedDishes.push(lockedDishes[0]);
      usedNames.add(lockedDishes[0].name);
    } else {
      const pool = MENU.hard.concat(MENU.fastMeat);
      const pick = pickRandom(pool);
      selectedDishes.push(pick);
      usedNames.add(pick.name);
    }
  }

  // Remaining dishes
  if (dCount > 1) {
    const pool = MENU.fastMeat.concat(MENU.veg).concat(MENU.cold);
    let attempts = 0;
    for (let i = 0; i < dCount - 1; i++) {
      const idx = i + 1;
      if (lockedDishes[idx]) {
        selectedDishes.push(lockedDishes[idx]);
        usedNames.add(lockedDishes[idx].name);
      } else {
        const pick = pickRandom(pool);
        if (!usedNames.has(pick.name)) {
          selectedDishes.push(pick);
          usedNames.add(pick.name);
          attempts = 0;
        } else {
          attempts++;
          if (attempts > 50) {
            selectedDishes.push(pick);
            usedNames.add(pick.name);
            attempts = 0;
          } else {
            i--;
          }
        }
      }
    }
  }

  // Soups
  const selectedSoups = [];
  for (let i = 0; i < sCount; i++) {
    if (lockedSoups[i]) {
      selectedSoups.push(lockedSoups[i]);
    } else {
      selectedSoups.push(pickRandom(MENU.soup));
    }
  }

  // Clean up out-of-range locks
  for (const k in lockedDishes) { if (k >= dCount) delete lockedDishes[k]; }
  for (const k in lockedSoups) { if (k >= sCount) delete lockedSoups[k]; }

  currentDishes = selectedDishes;
  currentSoups = selectedSoups;
  renderResult();
}

// ===== Render =====
function renderResult() {
  const dishListDiv = $('dishList');
  const showSource = getSelectedSources().length !== 1;
  dishListDiv.innerHTML = '<strong>今日菜单：</strong>';

  currentDishes.forEach((d, i) => {
    const isLocked = !!lockedDishes[i];
    const sourceTag = showSource
      ? `<span class="source-tag source-${d.source}">${d.source}</span>`
      : '';
    dishListDiv.innerHTML += `
      <div class="dish-item">
        <div class="dish-info">🍛 ${d.name}${sourceTag}<span class="dish-time">⏱${d.time}min</span></div>
        <button class="lock-btn ${isLocked ? 'locked' : ''}" data-type="dish" data-idx="${i}">${isLocked ? '🔒' : '🔓'}</button>
      </div>`;
  });

  currentSoups.forEach((s, i) => {
    const isLocked = !!lockedSoups[i];
    const sourceTag = showSource
      ? `<span class="source-tag source-${s.source}">${s.source}</span>`
      : '';
    dishListDiv.innerHTML += `
      <div class="dish-item" style="border-left-color:#457b9d">
        <div class="dish-info">🥣 ${s.name}${sourceTag}<span class="dish-time">⏱${s.time}min</span></div>
        <button class="lock-btn ${isLocked ? 'locked' : ''}" data-type="soup" data-idx="${i}">${isLocked ? '🔒' : '🔓'}</button>
      </div>`;
  });

  // Time estimate
  const allItems = [...currentDishes, ...currentSoups];
  const maxTime = Math.max(...allItems.map(d => d.time));
  const sumTime = allItems.reduce((s, d) => s + d.time, 0);
  $('totalTime').innerHTML =
    `<div class="total-time">⏱ 串行总时间 ~${sumTime}min / 并行最快 ~${maxTime}min</div>`;

  $('result').style.display = 'block';
  $('aiResult').innerHTML = '';
  $('generateBtn').textContent = '🔄 不满意，换菜！';
  // Reset notify button
  const nb = $('notifyBtn');
  nb.textContent = '📤 通知老公去买菜';
  nb.disabled = false;
  nb.classList.remove('sent');
}

// ===== Lock toggle =====
function toggleLock(type, index) {
  if (type === 'dish') {
    if (lockedDishes[index]) delete lockedDishes[index];
    else lockedDishes[index] = currentDishes[index];
  } else {
    if (lockedSoups[index]) delete lockedSoups[index];
    else lockedSoups[index] = currentSoups[index];
  }
  renderResult();
}

// ===== Source change =====
function onSourceChange() {
  lockedDishes = {};
  lockedSoups = {};
  $('result').style.display = 'none';
  $('generateBtn').textContent = '🎲 开抽！';
}

function updateChipStates() {
  document.querySelectorAll('#menuSources .source-chip').forEach(label => {
    const cb = label.querySelector('input[type="checkbox"]');
    label.classList.toggle('checked', cb.checked);
  });
  onSourceChange();
}

// ===== AI =====
async function readSSE(resp, targetDiv) {
  targetDiv.innerHTML = '<div class="ai-section"></div>';
  const section = targetDiv.querySelector('.ai-section');
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.content) {
            fullContent += data.content;
            section.innerHTML = fullContent;
          }
        } catch {}
      }
    }
  }
}

async function askAI() {
  const aiDiv = $('aiResult');
  aiDiv.innerHTML = '<div class="loading">AI 正在规划出餐方案…</div>';

  try {
    const resp = await fetch('/api/cooking-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dishes: currentDishes.map(d => d.name),
        soups: currentSoups.map(d => d.name),
        people: parseInt($('peopleCount').value)
      })
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || `请求失败 (${resp.status})`);
    }

    const ct = resp.headers.get('content-type') || '';
    if (ct.includes('text/event-stream')) {
      await readSSE(resp, aiDiv);
    } else {
      const data = await resp.json();
      aiDiv.innerHTML = `<div class="ai-section">${data.plan}</div>`;
    }
  } catch (e) {
    aiDiv.innerHTML = `<div class="error">⚠️ ${e.message}</div>`;
  }
}

// ===== Milk Tea Raffle =====
function generateTea() {
  const count = parseInt($('teaPeople').value);
  const teaMenu = MENU_DB['奶茶甜品'];
  const pool = [...teaMenu.cold, ...teaMenu.hard, ...teaMenu.fastMeat, ...teaMenu.veg, ...teaMenu.soup].filter(d => d.name);

  const teaListDiv = $('teaList');
  teaListDiv.innerHTML = '<strong>🧋 今日奶茶：</strong>';

  const used = new Set();
  for (let i = 0; i < count; i++) {
    let pick;
    let attempts = 0;
    do {
      pick = pool[Math.floor(Math.random() * pool.length)];
      attempts++;
    } while (used.has(pick.name) && attempts < 50);
    used.add(pick.name);

    teaListDiv.innerHTML += `<div class="tea-item">
      <span class="tea-person">#${i + 1}</span>
      <span class="tea-drink">${pick.name}</span>
      <span class="tea-time">⏱${pick.time}min</span>
    </div>`;
  }

  $('teaResult').style.display = 'block';
  $('teaBtn').textContent = '🔄 再来一轮！';
  $('teaAiResult').innerHTML = '';
}

// ===== Tea AI =====
let currentTeaDrinks = [];

function generateTeaWithTracking() {
  generateTea();
  // Collect current drinks from DOM
  currentTeaDrinks = Array.from(document.querySelectorAll('#teaList .tea-drink')).map(el => el.textContent);
}

async function askTeaAI() {
  const aiDiv = $('teaAiResult');
  aiDiv.innerHTML = '<div class="loading">AI 正在生成奶茶教程…</div>';

  try {
    const resp = await fetch('/api/cooking-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dishes: currentTeaDrinks,
        soups: [],
        people: parseInt($('teaPeople').value),
        mode: 'tea'
      })
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || `请求失败 (${resp.status})`);
    }

    const ct = resp.headers.get('content-type') || '';
    if (ct.includes('text/event-stream')) {
      await readSSE(resp, aiDiv);
    } else {
      const data = await resp.json();
      aiDiv.innerHTML = `<div class="ai-section">${data.plan}</div>`;
    }
  } catch (e) {
    aiDiv.innerHTML = `<div class="error">⚠️ ${e.message}</div>`;
  }
}

// ===== Notify =====
async function notifyHusband() {
  const btn = $('notifyBtn');
  btn.textContent = '✉️ 发送中…';
  btn.disabled = true;

  const dishes = currentDishes.map(d => d.name).join('、');
  const soups = currentSoups.map(d => d.name).join('、');
  const msg = `🍳 菜：${dishes}${soups ? '\n🥣 汤：' + soups : ''}`;

  try {
    const resp = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    if (!resp.ok) throw new Error('Failed');
    btn.textContent = '✅ 已通知！';
    btn.classList.add('sent');
  } catch (e) {
    btn.textContent = '❌ 发送失败，点击重试';
    btn.disabled = false;
  }
}

// ===== Tab switching =====
function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === `tab-${tabName}`));
}

// ===== Event binding =====
document.addEventListener('DOMContentLoaded', () => {
  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  $('menuSources').addEventListener('change', updateChipStates);
  $('selectAllBtn').addEventListener('click', () => {
    document.querySelectorAll('#menuSources input[type="checkbox"]').forEach(cb => cb.checked = true);
    updateChipStates();
  });
  $('clearAllBtn').addEventListener('click', () => {
    document.querySelectorAll('#menuSources input[type="checkbox"]').forEach(cb => cb.checked = false);
    updateChipStates();
  });
  $('generateBtn').addEventListener('click', generateMenu);
  $('aiBtn').addEventListener('click', askAI);
  $('notifyBtn').addEventListener('click', notifyHusband);
  $('teaBtn').addEventListener('click', generateTeaWithTracking);
  $('teaAiBtn').addEventListener('click', askTeaAI);

  // Delegate lock button clicks
  $('dishList').addEventListener('click', (e) => {
    const btn = e.target.closest('.lock-btn');
    if (!btn) return;
    toggleLock(btn.dataset.type, parseInt(btn.dataset.idx));
  });
});
