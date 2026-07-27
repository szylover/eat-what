const crypto = require("crypto");

const QUESTIONS = [
  {
    id: "people",
    title: "这一周通常几个人吃晚餐？",
    hint: "之后每份采购量都会按这个人数计算。",
    kind: "number",
    min: 1,
    max: 12,
    defaultValue: 2,
  },
  {
    id: "inventory",
    title: "冰箱、冷冻和储物柜里有什么？",
    hint: "写食材、数量、保存时间；没有就写“基本没有”。",
    kind: "textarea",
    placeholder: "例如：冷冻牛排 12 块、肥羊卷 2 板、鸡蛋 6 个",
  },
  {
    id: "preferences",
    title: "谁喜欢什么、不吃什么？",
    hint: "包含忌口、过敏、辣度、减脂或高蛋白等需求。",
    kind: "textarea",
    placeholder: "例如：两人都不爱肥肉；一人不吃辣，另一人爱重口",
  },
  {
    id: "time",
    title: "工作日和周末各能花多久做饭？",
    hint: "告诉我快手餐的上限，以及是否留复杂菜给周末。",
    kind: "textarea",
    placeholder: "例如：工作日 20 分钟，周末可做 1 小时",
  },
  {
    id: "equipment",
    title: "有什么厨具能用？",
    hint: "例如燃气灶、电饭锅、烤箱、微波炉、高压锅、空气炸锅。",
    kind: "textarea",
    placeholder: "例如：燃气灶、电饭锅、烤箱、微波炉",
  },
  {
    id: "shopping",
    title: "采购和早餐怎么安排？",
    hint: "说明能否补货、能否囤冷冻，以及早餐想不想复用晚餐。",
    kind: "textarea",
    placeholder: "例如：一次性采购，工作日可叮咚补菜；早餐想要饭团或三明治",
  },
];

const RESULT_CACHE = new Map();
const MAX_CACHE_ENTRIES = 50;
const SYSTEM_PROMPT = `你是严谨的中国家庭一周饮食规划助手。只能依据用户输入生成可执行计划：
- 尊重忌口、过敏、辣度和食安；辣味必须通过独立收尾/蘸料分流。
- 按实际时间、厨具、库存和采购频率安排；不要假定用户拥有未提及的设备。
- 对冷冻肉标明安全解冻时间，对刺身/易腐食材明确当天购买与保存限制。
- 合并采购数量，避免同一食材重复购买；所有数量按用户人数写清楚。
- 输出有效 JSON，不要 Markdown，不要代码块，不要额外文字。`;

class WeeklyPlanError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function getNextQuestion(answers) {
  const index = QUESTIONS.findIndex((question) => !hasAnswer(answers[question.id]));
  return index === -1 ? null : QUESTIONS[index];
}

function validateAnswers(rawAnswers) {
  if (!rawAnswers || typeof rawAnswers !== "object" || Array.isArray(rawAnswers)) {
    throw new WeeklyPlanError(400, "answers 必须是对象");
  }

  const answers = {};
  for (const question of QUESTIONS) {
    const value = rawAnswers[question.id];
    if (question.kind === "number") {
      const number = Number(value);
      if (!Number.isInteger(number) || number < question.min || number > question.max) {
        throw new WeeklyPlanError(400, `${question.title}需要填写 ${question.min}-${question.max} 的整数`);
      }
      answers[question.id] = number;
      continue;
    }

    if (typeof value !== "string") {
      throw new WeeklyPlanError(400, `${question.title}需要填写文本`);
    }
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > 1000) {
      throw new WeeklyPlanError(400, `${question.title}需要填写 1-1000 个字符`);
    }
    answers[question.id] = trimmed;
  }
  return answers;
}

function hasAnswer(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function buildCacheKey(answers) {
  return crypto.createHash("sha256")
    .update(JSON.stringify({ schemaVersion: 1, answers }))
    .digest("hex");
}

function normalizePlan(rawPlan) {
  if (!rawPlan || typeof rawPlan !== "object" || Array.isArray(rawPlan)) {
    throw new WeeklyPlanError(502, "AI 返回的计划不是对象");
  }

  const requiredArrays = ["days", "shopping", "prep", "breakfast", "safetyNotes"];
  for (const name of requiredArrays) {
    if (!Array.isArray(rawPlan[name]) || rawPlan[name].length === 0) {
      throw new WeeklyPlanError(502, `AI 返回的计划缺少 ${name}`);
    }
  }
  if (typeof rawPlan.title !== "string" || !rawPlan.title.trim()) {
    throw new WeeklyPlanError(502, "AI 返回的计划缺少标题");
  }

  return {
    title: rawPlan.title.trim().slice(0, 100),
    overview: readText(rawPlan.overview, "本周菜单会按你的库存、口味和时间安排。"),
    days: normalizeItems(rawPlan.days, ["label", "dish", "minutes", "prep", "split"]),
    shopping: normalizeItems(rawPlan.shopping, ["category", "item", "quantity", "storage"]),
    prep: normalizeItems(rawPlan.prep, ["step", "duration", "storage"]),
    breakfast: normalizeItems(rawPlan.breakfast, ["name", "portion", "reheat"]),
    safetyNotes: rawPlan.safetyNotes.map((item) => readText(item)).filter(Boolean).slice(0, 10),
  };
}

function normalizeItems(items, fields) {
  return items.slice(0, 12).map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new WeeklyPlanError(502, "AI 返回的列表项无效");
    }
    const normalized = {};
    for (const field of fields) {
      normalized[field] = readText(item[field]);
    }
    return normalized;
  });
}

function readText(value, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, 500) || fallback : fallback;
}

function extractJson(content) {
  const trimmed = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    throw new WeeklyPlanError(502, "AI 返回的内容不是有效 JSON，请重试");
  }
}

async function generateWeeklyPlan(answers, env, fetchImplementation = fetch) {
  const normalizedAnswers = validateAnswers(answers);
  const cacheKey = buildCacheKey(normalizedAnswers);
  const cached = RESULT_CACHE.get(cacheKey);
  if (cached) {
    return { ...cached, cache: { source: "server", key: cacheKey } };
  }

  const apiUrl = env.AZURE_OPENAI_ENDPOINT;
  const apiKey = env.AZURE_OPENAI_API_KEY;
  if (!apiUrl || !apiKey) {
    throw new WeeklyPlanError(500, "AI 服务未配置");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);
  const userPrompt = `请依据下面的问答生成一份一周晚餐计划。计划可以是“按天固定”或“今晚任选”，但必须明确解冻、采购、预处理和保存。

用户问答：
${JSON.stringify(normalizedAnswers)}

严格返回这个 JSON 结构：
{
  "title": "string",
  "overview": "string",
  "days": [{"label":"string","dish":"string","minutes":"string","prep":"string","split":"string"}],
  "shopping": [{"category":"string","item":"string","quantity":"string","storage":"string"}],
  "prep": [{"step":"string","duration":"string","storage":"string"}],
  "breakfast": [{"name":"string","portion":"string","reheat":"string"}],
  "safetyNotes": ["string"]
}`;

  try {
    const isLegacyModel = /gpt-3|gpt-35/.test(apiUrl);
    const response = await fetchImplementation(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        ...(isLegacyModel
          ? { max_tokens: 3000, temperature: 0.2 }
          : { max_completion_tokens: 3000, temperature: 0.2 }),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new WeeklyPlanError(502, `AI 服务调用失败: ${response.status}`);
    }

    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      throw new WeeklyPlanError(502, "AI 未返回计划内容");
    }

    const result = {
      plan: normalizePlan(extractJson(content)),
      usage: {
        promptTokens: payload.usage?.prompt_tokens ?? null,
        completionTokens: payload.usage?.completion_tokens ?? null,
        cachedTokens: payload.usage?.prompt_tokens_details?.cached_tokens ?? null,
      },
      cache: { source: "model", key: cacheKey },
    };
    if (RESULT_CACHE.size >= MAX_CACHE_ENTRIES) {
      RESULT_CACHE.delete(RESULT_CACHE.keys().next().value);
    }
    RESULT_CACHE.set(cacheKey, result);
    return result;
  } catch (error) {
    if (error instanceof WeeklyPlanError) throw error;
    if (error.name === "AbortError") {
      throw new WeeklyPlanError(504, "AI 服务响应超时，请重试");
    }
    throw new WeeklyPlanError(502, "AI 服务调用失败，请重试");
  } finally {
    clearTimeout(timeout);
  }
}

async function handleWeeklyPlan(body, env, fetchImplementation) {
  const action = body?.action;
  if (action === "next") {
    const answers = body.answers && typeof body.answers === "object" ? body.answers : {};
    return { question: getNextQuestion(answers), complete: getNextQuestion(answers) === null };
  }
  if (action === "generate") {
    return generateWeeklyPlan(body.answers, env, fetchImplementation);
  }
  throw new WeeklyPlanError(400, "action 必须是 next 或 generate");
}

module.exports = {
  QUESTIONS,
  WeeklyPlanError,
  buildCacheKey,
  generateWeeklyPlan,
  handleWeeklyPlan,
  validateAnswers,
};
