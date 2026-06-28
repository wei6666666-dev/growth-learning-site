const MAX_QUESTION_LENGTH = 500;
const MAX_CONTEXT_LENGTH = 6000;

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") return JSON.parse(req.body);
  return req.body;
}

function extractAnswer(data) {
  if (data.output_text) return data.output_text;
  const parts = data.output
    ?.flatMap((item) => item.content || [])
    ?.map((content) => content.text)
    ?.filter(Boolean);
  return parts?.join("\n").trim();
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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "AI 接口未配置，请在 Vercel 环境变量中添加 OPENAI_API_KEY" });
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
    "你是一位耐心、清晰、擅长启发的新高一物理老师。",
    "你要用高中生能理解的语言讲解物理。",
    "回答要遵循：",
    "1. 先用一句话解释核心。",
    "2. 再分步骤讲清楚。",
    "3. 必要时举生活例子。",
    "4. 最后给一个小练习。",
    "5. 不要直接堆公式。",
    "6. 不要讲超纲内容。",
    "7. 如果问题与物理学习无关，请温和地引导回物理知识点。",
  ].join("\n");

  const userPrompt = [
    `当前知识点：${knowledgePoint}`,
    `知识点上下文：${context}`,
    `学生问题：${question}`,
  ].join("\n\n");

  try {
    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.45,
        max_output_tokens: 700,
      }),
    });

    const data = await openaiResponse.json().catch(() => ({}));
    if (!openaiResponse.ok) {
      const message = data.error?.message || "OpenAI 请求失败";
      return res.status(openaiResponse.status).json({ error: message });
    }

    const answer = extractAnswer(data);
    if (!answer) return res.status(502).json({ error: "AI 没有返回有效内容" });

    return res.status(200).json({ answer });
  } catch {
    return res.status(500).json({ error: "AI 服务暂时不可用，请稍后再试" });
  }
};
