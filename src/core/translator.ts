// ============================================================
// 艺术翻译器 — DeepSeek API 客户端
// 核心职责：将代码特征 + 源码翻译为 SVG 艺术品
// ============================================================

import type { ArtParameters, ArtStyle, CodeFeatures } from './types';
import { summarizeFeatures } from './parser';

/** DeepSeek API 配置 */
const DEEPSEEK_BASE = 'https://api.deepseek.com/v1';
const MODEL = 'deepseek-chat';

/**
 * 调用 DeepSeek API 生成艺术参数和 SVG
 */
export async function translateCodeToArt(
  source: string,
  features: CodeFeatures,
  style: ArtStyle
): Promise<{ svg: string; statement: string }> {
  const featureSummary = summarizeFeatures(features);
  const styleGuide = getStyleGuide(style, features);

  const systemPrompt = buildSystemPrompt(styleGuide);
  const userPrompt = buildUserPrompt(source, featureSummary, style, styleGuide);

  // 调用 DeepSeek API（通过后端代理保护 API Key）
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: style === 'auto' ? 0.7 : 0.3,
      max_tokens: 8192,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: '未知错误' }));
    throw new Error(err.error || `API 请求失败: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  // 解析 DeepSeek 的响应：提取 SVG 和艺术家陈述
  return parseResponse(content);
}

/**
 * 构建系统提示词——定义 DeepSeek 的角色和输出格式
 */
function buildSystemPrompt(styleGuide: string): string {
  return `你是一位精通代码美学和现代艺术理论的艺术家。你的使命是将程序员写的代码转化为值得挂上墙的抽象画。

## 你的艺术资历
- 你深谙 20 世纪抽象艺术史：蒙德里安的构成主义、罗斯科的色域绘画、波洛克的行动绘画、康定斯基的抒情抽象、东方的留白美学
- 你精通色彩理论：互补色对比、LAB 色彩空间的和谐配色、色彩心理学
- 你理解代码：你能感受递归的分形之美、管道链的流动之美、函数嵌套的层级之美

## 输出格式
你必须严格按照以下格式输出：

\`\`\`svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <!-- 你的 SVG 艺术品 -->
</svg>
\`\`\`

## 艺术家陈述
[用中文写一段 150 字左右的艺术家陈述，解释这幅画的审美决策：
为什么选择这个配色？构图传达了代码的什么特质？
使用了什么艺术流派的技法？]

## SVG 质量要求
- 画布：800×600，可使用 viewBox
- 使用 defs 定义渐变和滤镜
- 至少有 5 个以上的视觉元素（矩形、圆形、线条、多边形等）
- 至少有 2 个渐变（linearGradient 或 radialGradient）
- 添加细微纹理或滤镜模拟画布质感
- 在画面角落添加小型签名 "glyph"
- 配色必须和谐，有明确的冷暖倾向
- 构图必须有意图（不是随机摆放）
- 负空间（留白）必须经过思考

${styleGuide}`;
}

/**
 * 构建用户提示词——包含具体代码和特征数据
 */
function buildUserPrompt(
  source: string,
  featureSummary: string,
  style: ArtStyle,
  styleGuide: string
): string {
  const styleNames: Record<ArtStyle, string> = {
    auto: '由你根据代码特征自主判断最合适的风格',
    mondrian: '蒙德里安式几何构成：黑色网格线分割画面，红蓝黄原色块填充，强调结构和边界',
    rothko: '罗斯科式色域绘画：大面积浮动色块，模糊边界，色彩互相渗透，表达情感深度',
    pollock: '波洛克式行动绘画：多层泼溅线条，混沌中隐含秩序，能量在画面中流动',
    zen: '极简禅意：大面积留白，单一精致的线条或色块，沉默即表达',
    kandinsky: '康定斯基式抒情抽象：几何形状在空间中互动，线条、圆、三角构成视觉交响乐',
  };

  return `## 任务
为以下代码创作一幅${styleNames[style]}的抽象画。

## 代码特征分析
${featureSummary}

## 源代码
\`\`\`
${source.slice(0, 3000)}
\`\`\`

请基于你对代码的理解和艺术理论，生成 SVG 艺术品和艺术家陈述。`;
}

/**
 * 风格引导词 —— 指导 DeepSeek 采用特定艺术流派的技法
 */
function getStyleGuide(style: ArtStyle, features: CodeFeatures): string {
  const baseGuides: Record<ArtStyle, string> = {
    auto: `## 风格选择自主权
你是艺术家，根据代码特征选择最合适的风格：
- 函数式/管道链 → 蒙德里安几何构成
- 深层嵌套/复杂逻辑 → 罗斯科色域绘画
- 脚本/事件驱动 → 波洛克行动绘画
- 接口/类型定义 → 极简禅意留白
- OOP/类交互 → 康定斯基有机抽象`,

    mondrian: `## 蒙德里安模式
- 使用粗黑线（3-5px）划分画面为几何网格
- 原色填充：红(#C41E3A)、蓝(#1E3A5F)、黄(#F5A623)
- 白色(#F5F0E8) 和浅灰作为剩余区域
- 每条线从画布边缘到边缘
- 体现代码的结构和边界`,

    rothko: `## 罗斯科模式
- 2-4 个横向浮动的大色块，占据画布 60-80%
- 色块边缘模糊（使用 SVG filter feGaussianBlur）
- 颜色在 LAB 空间中和谐过渡
- 背景色与前景色块形成呼吸般的对比
- 体现代码嵌套的深度和情感的冷暖`,

    pollock: `## 波洛克模式
- 多层细线（1-2px）交织覆盖画面
- 使用 3-5 种颜色在不同方向泼溅
- SVG path 的 d 属性使用大量曲线和随机拐点
- 线条密度分布不均——某些区域密集，某些区域稀疏
- 体现代码中异步流、回调、事件的涌动`,

    zen: `## 极简禅模式
- 画面 70-90% 为留白
- 只有一个或两个精心放置的元素
- 使用微妙的灰度渐变和一条强调色
- 线条精确、简洁、有力量
- 体现代码的克制、精确和意图`,

    kandinsky: `## 康定斯基模式
- 多种几何形状（圆、三角、弧线、不规则多边形）在画面中互动
- 暖色调为主：橙、红、金、深褐
- 形状之间有"对话"——部分重叠、切线接触、引力靠近
- 使用虚线、点线等多样化线条
- 体现代码中类与对象的交互关系`,
  };

  return baseGuides[style];
}

/**
 * 解析 DeepSeek 的文本响应，提取 SVG 和艺术家陈述
 */
function parseResponse(content: string): { svg: string; statement: string } {
  let svg = '';
  let statement = '';

  // 提取 SVG 代码块
  const svgMatch = content.match(
    /```svg\s*([\s\S]*?)```/
  );

  if (svgMatch) {
    svg = svgMatch[1].trim();
  } else {
    // 尝试匹配任何 <svg> 标签
    const svgTagMatch = content.match(
      /<svg[\s\S]*?<\/svg>/i
    );
    if (svgTagMatch) {
      svg = svgTagMatch[0];
    }
  }

  // 提取艺术家陈述
  const statementMatch = content.match(
    /(?:##\s*)?艺术家陈述[：:]\s*\n([\s\S]*?)(?:\n##|\n\`\`\`|$)/
  );
  if (statementMatch) {
    statement = statementMatch[1].trim();
  } else {
    // Fallback: 提取 SVG 之后的所有中文文本
    const afterSvg = content.replace(/```svg[\s\S]*?```/, '').trim();
    statement = afterSvg.slice(0, 500);
  }

  if (!svg) {
    throw new Error('DeepSeek 未返回有效的 SVG。请重试。\n\n原始响应：' + content.slice(0, 500));
  }

  return { svg, statement };
}
