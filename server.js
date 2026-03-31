require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

// 提供 src/ 下的静态文件
app.use(express.static(path.join(__dirname, "src")));

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

  const prompt = req.body.mode === 'tea'
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
        max_completion_tokens: 2000,
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
