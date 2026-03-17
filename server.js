require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

// 提供静态 HTML
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "chishenme.html"));
});

// AI 生成烹饪策略
app.post("/api/cooking-plan", async (req, res) => {
  const { dishes, soups, people } = req.body;
  const peopleCount = parseInt(people) || 2;

  if (!Array.isArray(dishes) || !Array.isArray(soups)) {
    return res.status(400).json({ error: "请提供 dishes 和 soups 数组" });
  }

  const allItems = [...dishes, ...soups];
  if (allItems.length === 0) {
    return res.status(400).json({ error: "至少选择一道菜或一道汤" });
  }

  const prompt = `你是一位经验丰富的中餐厨师和厨房时间管理专家。
用户今天要做以下菜品（${peopleCount}人份）：
菜：${dishes.join("、") || "无"}
汤：${soups.join("、") || "无"}

请给出：
1. 采购清单：每道菜需要买什么食材，具体用量（按${peopleCount}人份计算，标注克数/个数/勺数等）
2. 每道菜的简短烹饪要点（2-3句话，突出关键调味和火候）
3. 一个合理的1小时出餐时间线，精确到分钟段，考虑并行操作（比如炖煮的同时切配其他菜）
4. 一句鼓励打气的话

用简洁生动的中文回答，适当加emoji。用HTML格式输出（可以用<b>、<br>、<div>等标签），不要用markdown。`;

  const apiUrl = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "你是一个热情的中餐烹饪助手，擅长快速出餐策略。回答简洁实用。" },
          { role: "user", content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Azure OpenAI error:", response.status, errBody);
      return res.status(500).json({ error: "AI 服务调用失败: " + response.status });
    }

    const data = await response.json();
    console.log("Azure response:", JSON.stringify(data, null, 2));
    const content = data.choices?.[0]?.message?.content || "AI 暂时无法生成建议，请稍后再试。";
    res.json({ plan: content });
  } catch (err) {
    console.error("Azure OpenAI error:", err.message);
    res.status(500).json({ error: "AI 服务调用失败，请检查配置" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🍳 吃什么服务已启动: http://localhost:${PORT}`);
});
