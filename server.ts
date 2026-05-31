// ============================================================
// Glyph API 服务器
// 代理 DeepSeek API 调用，保护 API Key
// ============================================================

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// 从环境变量读取 API Key
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

app.use(express.json({ limit: '5mb' }));

// ═══════════════════════════════════════════
// API: /api/generate — 调用 DeepSeek
// ═══════════════════════════════════════════
app.post('/api/generate', async (req, res) => {
  try {
    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({
        success: false,
        error: '未配置 DEEPSEEK_API_KEY。请在 .env 文件中设置你的 DeepSeek API Key。',
      });
    }

    const { model, messages, temperature, max_tokens } = req.body;

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: model || 'deepseek-chat',
        messages,
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens || 8192,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('DeepSeek API error:', response.status, errBody);
      return res.status(response.status).json({
        success: false,
        error: `DeepSeek API 错误 (${response.status}): ${errBody.slice(0, 300)}`,
      });
    }

    const data = await response.json();
    res.json({ success: true, ...data });
  } catch (err: unknown) {
    console.error('Server error:', err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : '服务器内部错误',
    });
  }
});

// ═══════════════════════════════════════════
// API: /api/health — 健康检查
// ═══════════════════════════════════════════
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!DEEPSEEK_API_KEY,
    model: 'deepseek-chat',
  });
});

// ═══════════════════════════════════════════
// 生产环境：托管前端静态文件
// ═══════════════════════════════════════════
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  🎨 Glyph API Server`);
  console.log(`  ─────────────────────`);
  console.log(`  API:    http://localhost:${PORT}/api`);
  console.log(`  Status: ${DEEPSEEK_API_KEY ? '✅ 已配置 DeepSeek Key' : '⚠️  未配置 API Key'}`);
  console.log(`  前端:   请运行 npm run dev:client 启动 Vite 开发服务器\n`);
});
