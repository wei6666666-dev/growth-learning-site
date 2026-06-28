const MAX_QUESTION_LENGTH = 500;
const MAX_CONTEXT_LENGTH = 6000;

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") return JSON.parse(req.body);
  return req.body;
}

function extractAnswer(data) {
  return data.choices?.[0]?.message?.content?.trim();
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "只支持 POST 请求" });
  }

  const apiKey = process.env.DOUBAO_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "AI 接口未配置，请在 Vercel 环境变量中添加 DOUBAO_API_KEY" });
  }

  let body;
  try {
    body = parseBody(req);
  } catch {
    return res.status(400).json({ error: "请求格式不正确" });
  }

  const question = String(body.question || "").trim();
  const knowledgePoint = String(body.knowledgePoint || "当前知识点").trim();
  const context = JSON.stringify(body.context || {}).slice(0, MAX_CONTEXT_LENGTH);

  if (!question) return res.status(400).json({ error: "问题不能为空" });
  if (question.length > MAX_QUESTION_LENGTH) {
    return res.status(400).json({ error: `问题不能超过 ${MAX_QUESTION_LENGTH} 字` });
  }

  const systemPrompt = [
    "你是一名高中物理老师，面向新高一学生。",
    "要求：",
    "1. 用通俗语言讲解。",
    "2. 先解释核心概念。",
    "3. 再分步骤讲解。",
    "4. 给生活例子。",
    "5. 最后给1道小练习。",
    "6. 避免复杂术语。",
    "7. 不超纲。",
    "8. 如果问题与物理学习无关，请温和地引导回物理知识点。",
  ].join("\n");

  const userPrompt = [
    `当前知识点：${knowledgePoint}`,
    `知识点上下文：${context}`,
    `学生问题：${question}`,
  ].join("\n\n");

  try {
    const doubaoResponse = await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.DOUBAO_MODEL || "doubao-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.45,
        max_tokens: 700,
      }),
    });

    const data = await doubaoResponse.json().catch(() => ({}));
    if (!doubaoResponse.ok) {
      const message = data.error?.message || data.message || "豆包请求失败";
      return res.status(doubaoResponse.status).json({ error: message });
    }

    const answer = extractAnswer(data);
    if (!answer) return res.status(502).json({ error: "AI 没有返回有效内容" });

    return res.status(200).json({ answer });
  } catch {
    return res.status(500).json({ error: "AI 服务暂时不可用，请稍后再试" });
  }
};
