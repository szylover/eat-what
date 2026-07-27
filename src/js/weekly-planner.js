const DRAFT_KEY = "weekly-planner-draft-v1";
const PROFILE_KEY = "weekly-planner-profile-v1";
const CACHE_PREFIX = "weekly-planner-result-v1:";

const questionContainer = document.getElementById("weeklyQuestion");
const planContainer = document.getElementById("weeklyPlan");
const tasteProfileContainer = document.getElementById("weeklyTasteProfile");
let state = loadDraft();

function loadDraft() {
  const profile = readStorage(PROFILE_KEY, {});
  const draft = readStorage(DRAFT_KEY, {});
  return {
    answers: { ...profile, ...(draft.answers || {}) },
    question: draft.question || null,
    plan: draft.plan || null,
    usage: draft.usage || null,
  };
}

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveDraft() {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
}

function createElement(tag, text, className) {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (className) element.className = className;
  return element;
}

async function request(body) {
  const response = await fetch("/api/weekly-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `请求失败 (${response.status})`);
  return data;
}

async function loadTasteProfile() {
  try {
    const response = await fetch("/api/taste-profile");
    if (!response.ok) return;
    const profile = await response.json();
    renderTasteProfile(profile);
  } catch {
    // The planner remains available if the optional profile summary cannot load.
  }
}

function renderTasteProfile(profile) {
  tasteProfileContainer.hidden = false;
  tasteProfileContainer.replaceChildren(
    createElement("strong", `🍽️ 当前画像：${profile.profileName}`),
    createElement("p", `在家主力：${profile.homeCoreDishes.slice(0, 6).join("、")}等`, "weekly-question-hint"),
    createElement("p", `餐厅收藏：${profile.restaurantFavorites.slice(0, 4).join("、")}等（不默认排入在家菜单）`, "weekly-question-hint"),
    createElement("p", `排除：${[...profile.excludeDishes, ...profile.excludeKeywords].join("、")}`, "weekly-question-hint"),
    createElement("p", "工作日优先快手高分菜；螃蟹、海鲜饭等复杂菜自动留给周末。", "weekly-question-hint")
  );
}

async function loadNextQuestion() {
  questionContainer.innerHTML = "";
  planContainer.hidden = true;
  try {
    const data = await request({ action: "next", answers: state.answers });
    state.question = data.question;
    saveDraft();
    if (data.complete) {
      renderReadyToGenerate();
    } else {
      renderQuestion(data.question);
    }
  } catch (error) {
    questionContainer.replaceChildren(createElement("div", `⚠️ ${error.message}`, "error"));
  }
}

function renderQuestion(question) {
  const title = createElement("h2", question.title, "weekly-question-title");
  const hint = createElement("p", question.hint, "weekly-question-hint");
  const form = document.createElement("form");
  form.className = "weekly-question-form";

  const input = question.kind === "textarea"
    ? document.createElement("textarea")
    : document.createElement("input");
  input.id = `weekly-${question.id}`;
  input.name = question.id;
  input.required = true;
  input.value = state.answers[question.id] ?? question.defaultValue ?? "";
  if (question.kind === "textarea") {
    input.rows = 5;
    input.placeholder = question.placeholder;
  } else {
    input.type = "number";
    input.min = question.min;
    input.max = question.max;
  }
  form.append(input);

  const submit = createElement("button", "继续 →");
  submit.type = "submit";
  form.append(submit);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const value = question.kind === "number" ? Number(input.value) : input.value.trim();
    state.answers[question.id] = value;
    saveDraft();
    await loadNextQuestion();
  });

  questionContainer.replaceChildren(title, hint, form, createResetButton());
}

function renderReadyToGenerate() {
  const title = createElement("h2", "信息齐了，生成这周计划", "weekly-question-title");
  const hint = createElement("p", "生成只会使用本页的答案；你可以稍后选择保存长期偏好。", "weekly-question-hint");
  const button = createElement("button", "✨ 生成一周计划");
  button.className = "weekly-generate";
  button.addEventListener("click", generatePlan);
  questionContainer.replaceChildren(title, hint, button, createResetButton());
}

async function generatePlan() {
  const cacheKey = CACHE_PREFIX + hashAnswers(state.answers);
  const cached = readStorage(cacheKey, null);
  if (cached) {
    state.plan = cached.plan;
    state.usage = cached.usage;
    state.cacheSource = "browser";
    saveDraft();
    renderPlan();
    return;
  }

  questionContainer.replaceChildren(createElement("div", "AI 正在根据你的库存和约束做计划…", "loading"));
  try {
    const data = await request({ action: "generate", answers: state.answers });
    state.plan = data.plan;
    state.usage = data.usage;
    state.cacheSource = data.cache?.source;
    localStorage.setItem(cacheKey, JSON.stringify({ plan: data.plan, usage: data.usage }));
    saveDraft();
    renderPlan();
  } catch (error) {
    questionContainer.replaceChildren(
      createElement("div", `⚠️ ${error.message}`, "error"),
      createElement("button", "重试生成")
    );
    questionContainer.querySelector("button").addEventListener("click", generatePlan);
  }
}

function renderPlan() {
  const { plan } = state;
  if (!plan) return;
  questionContainer.innerHTML = "";
  planContainer.hidden = false;
  planContainer.replaceChildren(
    createElement("h2", plan.title, "weekly-plan-title"),
    createElement("p", plan.overview, "weekly-plan-overview"),
    renderSection("晚餐安排", plan.days, ["label", "dish", "minutes", "prep", "split"]),
    renderSection("采购清单", plan.shopping, ["category", "item", "quantity", "storage"]),
    renderSection("统一预处理", plan.prep, ["step", "duration", "storage"]),
    renderSection("两分钟早餐", plan.breakfast, ["name", "portion", "reheat"]),
    renderBulletSection("食安与保存", plan.safetyNotes),
    renderPlanActions()
  );
}

function renderSection(title, items, fields) {
  const section = document.createElement("section");
  section.className = "weekly-plan-section";
  section.append(createElement("h3", title));
  const list = document.createElement("div");
  list.className = "weekly-plan-list";
  for (const item of items) {
    const card = document.createElement("article");
    for (const field of fields) {
      const value = item[field];
      if (!value) continue;
      const row = document.createElement("p");
      const label = createElement("strong", `${fieldLabel(field)}：`);
      row.append(label, document.createTextNode(value));
      card.append(row);
    }
    list.append(card);
  }
  section.append(list);
  return section;
}

function renderBulletSection(title, items) {
  const section = document.createElement("section");
  section.className = "weekly-plan-section";
  section.append(createElement("h3", title));
  const list = document.createElement("ul");
  for (const item of items) list.append(createElement("li", item));
  section.append(list);
  return section;
}

function fieldLabel(field) {
  return {
    label: "餐次", dish: "吃什么", minutes: "耗时", prep: "提前准备", split: "口味分流",
    category: "分类", item: "食材", quantity: "数量", storage: "保存",
    step: "步骤", duration: "耗时", name: "早餐", portion: "份量", reheat: "复热",
  }[field] || field;
}

function renderPlanActions() {
  const actions = document.createElement("div");
  actions.className = "weekly-actions";
  const saveProfile = createElement("button", "保存长期偏好");
  saveProfile.className = "chip-btn weekly-action";
  saveProfile.addEventListener("click", () => {
    const { people, preferences, time, equipment, shopping } = state.answers;
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ people, preferences, time, equipment, shopping }));
    saveProfile.textContent = "✅ 已保存";
    saveProfile.disabled = true;
  });

  const download = createElement("button", "下载 Markdown");
  download.className = "chip-btn weekly-action";
  download.addEventListener("click", downloadMarkdown);

  const exportPdf = createElement("button", "导出 PDF");
  exportPdf.className = "chip-btn weekly-action";
  exportPdf.addEventListener("click", exportPdfFromPrintView);

  const restart = createElement("button", "重新做一周");
  restart.className = "chip-btn weekly-action";
  restart.addEventListener("click", () => {
    const profile = readStorage(PROFILE_KEY, {});
    state = { answers: profile, question: null, plan: null, usage: null };
    saveDraft();
    loadTasteProfile();
    loadNextQuestion();
  });
  actions.append(saveProfile, download, exportPdf, restart);

  if (state.usage?.cachedTokens !== null && state.usage?.cachedTokens !== undefined) {
    actions.append(createElement("p", `模型 KV 缓存命中：${state.usage.cachedTokens} tokens`, "weekly-cache-note"));
  } else if (state.cacheSource) {
    actions.append(createElement("p", `本次计划来自${state.cacheSource === "browser" ? "浏览器缓存" : "服务端生成"}。`, "weekly-cache-note"));
  }
  return actions;
}

function downloadMarkdown() {
  const markdown = planToMarkdown(state.plan);
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "一周吃什么计划.md";
  link.click();
  URL.revokeObjectURL(url);
}

function exportPdfFromPrintView() {
  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) {
    alert("浏览器拦截了打印窗口，请允许弹窗后重试。");
    return;
  }

  printWindow.document.write(printablePlanDocument(state.plan));
  printWindow.document.close();
  printWindow.addEventListener("load", () => {
    printWindow.focus();
    printWindow.print();
  }, { once: true });
}

function printablePlanDocument(plan) {
  const section = (title, items, fields) => `
    <section>
      <h2>${escapeHtml(title)}</h2>
      ${items.map((item) => `<article>${fields.map((field) => {
        const value = item[field];
        return value ? `<p><strong>${escapeHtml(fieldLabel(field))}：</strong>${escapeHtml(value)}</p>` : "";
      }).join("")}</article>`).join("")}
    </section>`;
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>${escapeHtml(plan.title)}</title>
<style>
  @page { size: A4; margin: 11mm; }
  * { box-sizing: border-box; }
  body { color: #111; font-family: "Microsoft YaHei", "PingFang SC", sans-serif; font-size: 10pt; line-height: 1.4; margin: 0; }
  h1 { border-bottom: 2px solid #111; font-size: 20pt; margin: 0 0 5pt; padding-bottom: 5pt; }
  h2 { border-bottom: 1px solid #555; break-after: avoid; font-size: 13pt; margin: 13pt 0 5pt; padding-bottom: 2pt; }
  p { margin: 2pt 0; }
  .overview { color: #444; margin-bottom: 8pt; }
  article { background: #f7f7f7; break-inside: avoid; border-radius: 4pt; margin: 4pt 0; padding: 5pt 7pt; }
  ul { margin: 3pt 0; padding-left: 18pt; }
  li { break-inside: avoid; margin: 2pt 0; }
  .hint { color: #555; font-size: 9pt; margin-top: 14pt; }
  @media print { .hint { display: none; } }
</style>
</head>
<body>
  <h1>${escapeHtml(plan.title)}</h1>
  <p class="overview">${escapeHtml(plan.overview)}</p>
  ${section("晚餐安排", plan.days, ["label", "dish", "minutes", "prep", "split"])}
  ${section("采购清单", plan.shopping, ["category", "item", "quantity", "storage"])}
  ${section("统一预处理", plan.prep, ["step", "duration", "storage"])}
  ${section("两分钟早餐", plan.breakfast, ["name", "portion", "reheat"])}
  <section><h2>食安与保存</h2><ul>${plan.safetyNotes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul></section>
  <p class="hint">在系统打印窗口中选择“另存为 PDF”或“保存为 PDF”即可下载。</p>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function planToMarkdown(plan) {
  const section = (title, items, fields) => [
    `## ${title}`,
    ...items.flatMap((item) => fields.map((field) => `- **${fieldLabel(field)}**：${item[field]}`).filter((line) => !line.endsWith("："))),
    "",
  ];
  return [
    `# ${plan.title}`,
    "",
    plan.overview,
    "",
    ...section("晚餐安排", plan.days, ["label", "dish", "minutes", "prep", "split"]),
    ...section("采购清单", plan.shopping, ["category", "item", "quantity", "storage"]),
    ...section("统一预处理", plan.prep, ["step", "duration", "storage"]),
    ...section("两分钟早餐", plan.breakfast, ["name", "portion", "reheat"]),
    "## 食安与保存",
    ...plan.safetyNotes.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

function createResetButton() {
  const reset = createElement("button", "从头填写");
  reset.type = "button";
  reset.className = "chip-btn weekly-reset";
  reset.addEventListener("click", () => {
    state = { answers: {}, question: null, plan: null, usage: null };
    saveDraft();
    loadNextQuestion();
  });
  return reset;
}

function hashAnswers(answers) {
  const text = ["people", "inventory", "preferences", "time", "equipment", "shopping"]
    .map((key) => `${key}:${answers[key] ?? ""}`)
    .join("|");
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

loadNextQuestion();
