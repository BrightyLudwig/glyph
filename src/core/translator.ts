// ============================================================
// 艺术翻译器 — DeepSeek API 客户端 v2
// 核心改进：内置调色板引擎，LLM 不再自由选色
// ============================================================

import type { ArtStyle, CodeFeatures } from './types';
import { summarizeFeatures } from './parser';
import { selectPalette, paletteToPrompt, PALETTES, type Palette } from './palette';

const MODEL = 'deepseek-chat';

/**
 * 调用 DeepSeek API 生成 SVG 艺术品
 */
export async function translateCodeToArt(
  source: string,
  features: CodeFeatures,
  style: ArtStyle
): Promise<{ svg: string; statement: string; palette: Palette }> {
  // 🎨 核心改进：根据代码特征选择预设调色板
  const palette = selectPalette({
    fileType: features.fileType,
    dominantPatterns: features.dominantPatterns,
    maxNestingDepth: features.maxNestingDepth,
    commentRatio: features.commentRatio,
  });

  const featureSummary = summarizeFeatures(features);
  const styleGuide = getStyleGuide(style);
  const colorInstructions = paletteToPrompt(palette);

  const systemPrompt = buildSystemPrompt(colorInstructions);
  const userPrompt = buildUserPrompt(source, featureSummary, style, styleGuide, palette);

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2, // 低温度保证色彩精确
      max_tokens: 8192,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: '未知错误' }));
    throw new Error(err.error || `API 请求失败: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  const result = parseResponse(content);
  return { ...result, palette };
}

/**
 * 构建系统提示词 — 强调色彩纪律
 */
function buildSystemPrompt(colorInstructions: string): string {
  return `你是一位精通抽象艺术的画家。你的使命是将代码的内在美转化为可以挂上墙的抽象画。

## ⛔ 禁止事项（违反则失败）

- 禁止画树状图、流程图、调用图、UML、或任何形式的示意图
- 禁止在画中包含代码文字、函数名、变量名
- 禁止用文字标注或图例
- 禁止用矩形连线表示调用关系
- 这是一幅抽象画，不是信息可视化

## ✅ 你应该做

- 用颜色、形状、线条、纹理表达代码的"感觉"
- 递归 → 分形般的嵌套色块或螺旋
- 管道链 → 流动的色彩渐变和方向性线条
- 类层级 → 多个形状的对话和互动
- 简洁函数 → 大面积留白中的精确笔触

## ⚠️ 色彩纪律（最高优先级）

严格使用指定调色板。不准用调色板之外的颜色。不准用纯黑纯白。

${colorInstructions}

## 输出格式

\`\`\`svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <!-- 至少 2 个渐变 -->
    <!-- 1 个 feTurbulence 滤镜模拟画布纹理 -->
  </defs>
  <!-- 抽象画元素 -->
  <text x="770" y="585" text-anchor="end" font-family="Georgia, serif" font-size="12" opacity="0.35">glyph</text>
</svg>
\`\`\`

## 艺术家陈述
[80-150 字]

## SVG 质量
- viewBox="0 0 800 600"
- 至少 8 个视觉元素
- 至少 2 个渐变
- 1 个 feTurbulence 纹理滤镜（stdDeviation 2-4）
- 构图有意图：焦点、节奏、负空间`;
}

/**
 * 构建用户提示词
 */
function buildUserPrompt(
  source: string,
  featureSummary: string,
  style: ArtStyle,
  styleGuide: string,
  palette: Palette
): string {
  const styleNames: Record<ArtStyle, string> = {
    auto: '你认为最合适的风格',
    mondrian: '蒙德里安式几何构成（黑线网格分割，色块填充）',
    rothko: '罗斯科式色域绘画（大面积浮动色块，模糊边界）',
    pollock: '波洛克式行动绘画（多层泼溅线条，动态能量）',
    zen: '极简禅意（大面积留白，精确的单一元素）',
    kandinsky: '康定斯基式抒情抽象（几何形状的视觉交响）',
  };

  return `为以下代码创作一幅 **${styleNames[style]}** 的抽象画。

## 当前调色板：${palette.name}
${palette.reference}

## 代码特征
${featureSummary}

## 源代码
\`\`\`
${source.slice(0, 3000)}
\`\`\`

${styleGuide}

请生成 SVG 和艺术家陈述。严格按照指定调色板配色。`;
}

/**
 * 各风格的构图指导
 */
function getStyleGuide(style: ArtStyle): string {
  const guides: Record<ArtStyle, string> = {
    auto: `请根据代码特征自主选择最合适的构图方式。`,

    mondrian: `## 蒙德里安构图
- 使用 3-4 条水平线和 2-3 条垂直线将画布划分为网格
- 线条宽度 3-5px，使用调色板主色
- 选 3-5 个格子填充颜色，其余留白
- 线条从画布一边延伸到另一边
- 参考：《红黄蓝构成》(1930)`,

    rothko: `## 罗斯科构图
- 2-3 个横向矩形色块，边缘用 feGaussianBlur(stdDeviation 8-15) 柔化
- 色块占据画布 60-75%，上下层叠
- 用调色板的主色和辅色，色块之间有微妙的色彩渗透
- 背景色在色块边缘微微透出
- 参考：罗斯科 1958 年西格拉姆壁画系列`,

    pollock: `## 波洛克构图
- 使用多条 <path> 绘制交织曲线，模拟颜料滴洒
- 3-5 种调色板颜色，每层不同透明度(0.3-0.7)
- 线条密度分布不均：左密右疏或中心密四周疏
- 叠加 4-6 层，每层使用不同颜色
- 参考：《秋韵》(1950)`,

    zen: `## 极简禅构图
- 画面 75-85% 留白
- 1-2 个精心放置的元素（一个矩形或一条线或一个圆）
- 元素使用主色，位于黄金分割点
- 一条细线（1px）横跨画面表示地平线
- 参考：杉本博司海景系列，约翰·凯奇 4'33"`,

    kandinsky: `## 康定斯基构图
- 圆形、三角形、弧线在画面中构成视觉对话
- 2-3 个圆形（opacity 0.6-0.85），1-2 个三角形，若干弧线
- 形状之间有重叠或切线关系
- 使用调色板的强调色画 2-3 条细线连接形状
- 参考：《构图 VIII》(1923)`,
  };

  return guides[style];
}

/**
 * 解析 DeepSeek 响应，提取 SVG 和艺术家陈述
 */
function parseResponse(content: string): { svg: string; statement: string } {
  let svg = '';
  let statement = '';

  const svgMatch = content.match(/```svg\s*([\s\S]*?)```/);
  if (svgMatch) {
    svg = svgMatch[1].trim();
  } else {
    const svgTagMatch = content.match(/<svg[\s\S]*?<\/svg>/i);
    if (svgTagMatch) svg = svgTagMatch[0];
  }

  const statementMatch = content.match(
    /(?:##\s*)?艺术家陈述[：:]\s*\n?([\s\S]*?)(?:\n##|\n\`\`\`|$)/
  );
  if (statementMatch) {
    statement = statementMatch[1].trim();
  } else {
    const afterSvg = content.replace(/```svg[\s\S]*?```/, '').trim();
    statement = afterSvg.slice(0, 500);
  }

  if (!svg) {
    throw new Error(
      'DeepSeek 未返回有效 SVG。请重试。\n\n' + content.slice(0, 500)
    );
  }

  return { svg, statement };
}

/** 导出调色板信息供 UI 展示 */
export { PALETTES, selectPalette };
