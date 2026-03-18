module.exports = async function (context, req) {
  const { dishes, soups, people } = req.body || {};
  const peopleCount = parseInt(people) || 2;

  if (!Array.isArray(dishes) || !Array.isArray(soups)) {
    context.res = { status: 400, body: { error: "请提供 dishes 和 soups 数组" } };
    return;
  }

  const allItems = [...dishes, ...soups];
  if (allItems.length === 0) {
    context.res = { status: 400, body: { error: "至少选择一道菜或一道汤" } };
    return;
  }

  const prompt = `你是一位经验丰富的厨师和厨房时间管理专家。
用户今天要做以下菜品（${peopleCount}人份）：
菜：${dishes.join("、") || "无"}
汤：${soups.join("、") || "无"}

请给出：
1. 采购清单：每道菜需要买什么食材，具体用量（按${peopleCount}人份计算，标注克数/个数/勺数等）
2. 每道菜的简短烹饪要点（2-3句话，突出关键调味和火候）
3. 一个合理的1小时出餐时间线，精确到分钟段，考虑并行操作（比如炖煮的同时切配其他菜）

用简洁生动的中文回答，适当加emoji。用HTML格式输出（可以用<b>、<br>、<div>等标签），不要用markdown。`;

  const apiUrl = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;

  if (!apiUrl || !apiKey) {
    context.res = { status: 500, body: { error: "AI 服务未配置" } };
    return;
  }

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
      context.log.error("Azure OpenAI error:", response.status, errBody);
      context.res = { status: 500, body: { error: "AI 服务调用失败: " + response.status } };
      return;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "AI 暂时无法生成建议，请稍后再试。";
    context.res = { status: 200, body: { plan: content } };
  } catch (err) {
    context.log.error("Azure OpenAI error:", err.message);
    context.res = { status: 500, body: { error: "AI 服务调用失败，请检查配置" } };
  }
};
