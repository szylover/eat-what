require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

// 提供 src/ 下的静态文件
app.use(express.static(path.join(__dirname, "src")));

function normalizeMenuItems(items, label) {
  if (!Array.isArray(items) || items.length > 12) {
    throw new Error(`${label} 必须是最多 12 项的数组`);
  }

  return items.map((item) => {
    if (typeof item !== "string") {
      throw new Error(`${label} 中的每项必须是文本`);
    }

    const normalized = item.trim();
    if (!normalized || normalized.length > 100) {
      throw new Error(`${label} 中的每项必须是 1-100 个字符`);
    }
    return normalized;
  });
}

// AI 生成烹饪策略
app.post("/api/cooking-plan", async (req, res) => {
  const body = req.body ?? {};
  let dishes;
  let soups;
  try {
    dishes = normalizeMenuItems(body.dishes, "dishes");
    soups = normalizeMenuItems(body.soups, "soups");
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const parsedPeople = Number.parseInt(body.people, 10);
  const peopleCount = Number.isInteger(parsedPeople) && parsedPeople >= 1 && parsedPeople <= 20
    ? parsedPeople
    : 2;
  const allItems = [...dishes, ...soups];
  if (allItems.length === 0) {
    return res.status(400).json({ error: "至少选择一道菜或一道汤" });
  }

  const prompt = body.mode === 'tea'
    ? `你是一位专业奶茶店调饮师。
用户今天要做以下饮品（${peopleCount}人份）：
${dishes.join("、")}

请给出：
1. 材料清单：每款饮品需要什么材料，具体用量（按${peopleCount}人份，标注ml/g/个等）
2. 每款饮品的详细制作步骤（泡茶时间、水温、调配比例、分层技巧等）
3. 小贴士（如何做出奶茶店的口感，比如糖量调节、冰块用量、奶盖打发技巧等）

用简洁生动的中文回答，适当加emoji。用HTML格式输出，不要用markdown。`
    : `你是一位经验丰富的厨师和厨房时间管理专家。
用户今天要做以下菜品（${peopleCount}人份）：
菜：${dishes.join("、") || "无"}
汤：${soups.join("、") || "无"}

请给出：
1. 采购清单：每道菜需要买什么食材，具体用量（按${peopleCount}人份计算，标注克数/个数/勺数等）
2. 每道菜的简短烹饪要点（2-3句话，突出关键调味和火候）
3. 一个合理的1小时出餐时间线，精确到分钟段，考虑并行操作

用简洁生动的中文回答，适当加emoji。用HTML格式输出，不要用markdown。`;

  const apiUrl = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  if (!apiUrl || !apiKey) {
    return res.status(500).json({ error: "AI 服务未配置" });
  }

  const isLegacyModel = /gpt-3|gpt-35/.test(apiUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(Object.assign({
        messages: [
          { role: "system", content: "你是一个热情的中餐烹饪助手，擅长快速出餐策略。回答简洁实用。" },
          { role: "user", content: prompt },
        ],
        stream: true,
      }, isLegacyModel
        ? { max_tokens: 2000, temperature: 0.8 }
        : { max_completion_tokens: 1500 }
      )),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Azure OpenAI error:", response.status, errBody);
      return res.status(500).json({ error: "AI 服务调用失败: " + response.status });
    }

    // Stream SSE to client
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith("data: ") && line.trim() !== "data: [DONE]") {
          try {
            const json = JSON.parse(line.slice(6));
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch (error) {
            console.warn("Unable to parse Azure OpenAI stream event:", error.message);
          }
        }
      }
    }

    buffer += decoder.decode();
    if (buffer.startsWith("data: ") && buffer.trim() !== "data: [DONE]") {
      try {
        const json = JSON.parse(buffer.slice(6));
        const content = json.choices?.[0]?.delta?.content;
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      } catch (error) {
        console.warn("Unable to parse final Azure OpenAI stream event:", error.message);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("Azure OpenAI error:", err.message);
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: "AI 服务调用中断，请重试" })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: "AI 服务调用失败，请检查配置" });
    }
  } finally {
    clearTimeout(timeout);
  }
});

const PORT = process.env.PORT || 3000;

// Bark 推送通知
app.post("/api/notify", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "消息不能为空" });

  const barkKey = process.env.BARK_KEY;
  if (!barkKey) return res.status(500).json({ error: "Bark 未配置" });

  const barkServer = process.env.BARK_SERVER || "https://api.day.app";

  try {
    const resp = await fetch(`${barkServer}/${barkKey}/今晚菜单已定/${encodeURIComponent(message)}?sound=minuet&group=eat-what&icon=https%3A%2F%2Fem-content.zobj.net%2Fsource%2Fapple%2F391%2Fcooking_1f373.png`);
    if (!resp.ok) throw new Error(`Bark error: ${resp.status}`);
    res.json({ ok: true });
  } catch (err) {
    console.error("Bark error:", err.message);
    res.status(500).json({ error: "Bark 推送失败" });
  }
});

app.listen(PORT, () => {
  console.log(`🍳 吃什么服务已启动: http://localhost:${PORT}`);
});
