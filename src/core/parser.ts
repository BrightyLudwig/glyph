// ============================================================
// 代码解析器 — 提取美学特征
// 从源码中提取结构、密度、语义三个维度的特征
// ============================================================

import type { CodeFeatures, CodeFileType, CodePattern, FunctionInfo } from './types';

/**
 * 解析源代码，提取美学相关的结构特征
 */
export function parseCode(source: string, language?: string): CodeFeatures {
  const lines = source.split('\n');
  const totalLines = lines.length;

  // 检测语言
  const detectedLang = language || detectLanguage(source);

  // 提取行级特征
  const lineLengths = lines.map((l) => l.length);
  const avgLineLength = Math.round(
    lineLengths.reduce((a, b) => a + b, 0) / totalLines
  );
  const lineLengthVariance = Math.round(
    lineLengths.reduce((sum, l) => sum + (l - avgLineLength) ** 2, 0) /
      totalLines
  );

  // 空行与注释
  const blankLines = lines.filter((l) => l.trim() === '').length;
  const commentLines = lines.filter((l) => {
    const t = l.trim();
    return (
      t.startsWith('//') ||
      t.startsWith('#') ||
      t.startsWith('/*') ||
      t.startsWith('*') ||
      t.startsWith('--')
    );
  }).length;

  const blankLineRatio = totalLines > 0 ? blankLines / totalLines : 0;
  const commentRatio = totalLines > 0 ? commentLines / totalLines : 0;

  // 嵌套深度分析（基于缩进）
  const nestingDepths = lines
    .filter((l) => l.trim() !== '')
    .map((l) => {
      const indent = l.match(/^(\s*)/)?.[1]?.length ?? 0;
      return Math.floor(indent / 2); // 假设 2 空格为一级缩进
    });

  const maxNestingDepth = Math.max(0, ...nestingDepths);
  const nestingDistribution = buildNestingDistribution(nestingDepths, maxNestingDepth);

  // 提取函数
  const functions = extractFunctions(source, detectedLang);

  // 提取名称
  const variableNames = extractVariableNames(source, detectedLang);
  const functionNames = functions.map((f) => f.name).filter(Boolean);

  // 检测代码模式
  const dominantPatterns = detectPatterns(source, functions);

  // 分类文件类型
  const fileType = classifyFile(source, functions, detectedLang);

  return {
    functions,
    maxNestingDepth,
    nestingDistribution,
    avgLineLength,
    lineLengthVariance,
    commentRatio,
    blankLineRatio,
    totalLines,
    variableNames,
    functionNames,
    dominantPatterns,
    language: detectedLang,
    fileType,
  };
}

// ═══════════════════════════════════════════
// 内部工具函数
// ═══════════════════════════════════════════

function detectLanguage(source: string): string {
  // 启发式语言检测
  const signatures: [string, RegExp][] = [
    ['typescript', /:\s*(string|number|boolean|void|any)\b/],
    ['typescript', /interface\s+\w+/],
    ['python', /def\s+\w+\s*\(/],
    ['python', /import\s+\w+/],
    ['rust', /fn\s+\w+\s*[<(]/],
    ['rust', /let\s+mut\s+/],
    ['go', /func\s+\w+\s*\(/],
    ['go', /package\s+main/],
    ['javascript', /const\s+\w+\s*=\s*(\(\)|function)/],
    ['javascript', /export\s+(default\s+)?(function|class|const)/],
  ];

  for (const [lang, pattern] of signatures) {
    if (pattern.test(source)) return lang;
  }
  return 'unknown';
}

function buildNestingDistribution(
  depths: number[],
  maxDepth: number
): number[] {
  const dist = new Array(maxDepth + 1).fill(0);
  for (const d of depths) {
    if (d >= 0 && d <= maxDepth) dist[d]++;
  }
  return dist;
}

function extractFunctions(
  source: string,
  lang: string
): FunctionInfo[] {
  const functions: FunctionInfo[] = [];
  const lines = source.split('\n');

  // 多语言函数匹配
  const patterns: Record<string, RegExp> = {
    typescript: /(?:function\s+(\w+)|(\w+)\s*[:=]\s*(?:\([^)]*\)\s*=>|\([^)]*\)\s*\{|async\s*\([^)]*\)))/g,
    javascript: /(?:function\s+(\w+)|(\w+)\s*=\s*(?:\([^)]*\)\s*=>|\([^)]*\)\s*\{|async\s*\([^)]*\)))/g,
    python: /def\s+(\w+)/g,
    rust: /fn\s+(\w+)/g,
    go: /func\s+(?:\([^)]*\)\s+)?(\w+)/g,
    unknown: /(?:function\s+(\w+)|def\s+(\w+)|fn\s+(\w+)|func\s+\w+\s+(\w+))/g,
  };

  const pattern = patterns[lang] || patterns.unknown;

  // 逐行扫描，记录函数位置和嵌套深度
  let braceDepth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 跟踪大括号深度
    braceDepth += (line.match(/\{/g) || []).length;
    braceDepth -= (line.match(/\}/g) || []).length;

    // 匹配函数定义
    const match = pattern.exec(line);
    if (match) {
      pattern.lastIndex = 0; // 重置
      const name = match[1] || match[2];
      if (name && name !== 'if' && name !== 'for' && name !== 'while') {
        functions.push({
          name,
          lineStart: i,
          lineEnd: i,
          length: 1,
          depth: Math.max(0, braceDepth),
        });
      }
    }
  }

  // 估算函数体长度（找到匹配的闭合大括号）
  // 简化实现：下一个同深度的 } 就是函数结束
  // 完整实现需要真正的 AST

  return functions;
}

function extractVariableNames(
  source: string,
  lang: string
): string[] {
  const names: Set<string> = new Set();

  const patterns: Record<string, RegExp> = {
    typescript: /(?:const|let|var)\s+(\w+)/g,
    javascript: /(?:const|let|var)\s+(\w+)/g,
    python: /^(\w+)\s*[:=]/gm,
    rust: /let\s+(?:mut\s+)?(\w+)/g,
    go: /(\w+)\s*:=/g,
  };

  const pattern = patterns[lang] || patterns.typescript;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    if (match[1] && match[1].length > 1) {
      names.add(match[1]);
    }
  }

  return [...names].slice(0, 50); // 限制数量
}

function detectPatterns(
  source: string,
  functions: FunctionInfo[]
): CodePattern[] {
  const patterns: CodePattern[] = [];

  // 递归检测：函数名出现在函数体内
  for (const fn of functions) {
    if (source.includes(fn.name) && fn.name.length > 2) {
      if (!patterns.includes('recursion')) patterns.push('recursion');
      break;
    }
  }

  // 管道链检测
  if (/\.(map|filter|reduce|then|pipe|and_then|flat_map)\s*\(/.test(source)) {
    patterns.push('pipeline');
  }

  // 回调检测
  if (
    /\.then\s*\(/.test(source) ||
    /\.addEventListener\s*\(/.test(source) ||
    /\.on\s*\(['"]/.test(source) ||
    /callback/i.test(source) ||
    /=>\s*\{/.test(source)
  ) {
    patterns.push('callback');
  }

  // 类层级检测
  if (/class\s+\w+/.test(source) && /extends\s+\w+/.test(source)) {
    patterns.push('class-hierarchy');
  }

  // 模式匹配检测
  if (/match\s/.test(source) || /switch\s*\(/.test(source)) {
    patterns.push('pattern-matching');
  }

  // 事件驱动检测
  if (/\.(on|emit|dispatch|listen)\s*\(/.test(source)) {
    patterns.push('event-driven');
  }

  if (patterns.length === 0) {
    patterns.push('imperative-loop');
  }

  return patterns;
}

function classifyFile(
  source: string,
  functions: FunctionInfo[],
  lang: string
): CodeFileType {
  const codeOnly = source
    .split('\n')
    .filter((l) => l.trim() && !l.trim().startsWith('//'))
    .join('\n');

  // 接口/类型定义文件
  if (
    /^(interface|type|export\s+type)/m.test(source) &&
    functions.length === 0
  ) {
    return 'interface-definition';
  }

  // 配置文件
  if (/^\{[\s\S]*\}$/.test(source.trim()) && functions.length === 0) {
    return 'config';
  }

  // 类模块
  if (/class\s+\w+/.test(source) || /@Component|@Injectable/.test(source)) {
    return 'class-module';
  }

  // 函数库
  if (functions.length >= 3) {
    return 'function-library';
  }

  return 'script';
}

/**
 * 生成代码的文本摘要，用于 LLM prompt 中
 */
export function summarizeFeatures(features: CodeFeatures): string {
  const patternLabels: Record<CodePattern, string> = {
    recursion: '递归',
    pipeline: '管道链/流式处理',
    callback: '回调/事件驱动',
    'class-hierarchy': '类继承层级',
    'pattern-matching': '模式匹配/分支选择',
    'event-driven': '事件驱动架构',
    declarative: '声明式',
    'imperative-loop': '命令式循环',
  };

  const fileTypeLabels: Record<CodeFileType, string> = {
    'function-library': '函数库（功能集合）',
    'class-module': '类模块（面向对象）',
    script: '脚本/胶水代码',
    config: '配置文件',
    'interface-definition': '接口/类型定义',
  };

  return [
    `语言: ${features.language}`,
    `文件类型: ${fileTypeLabels[features.fileType]}`,
    `总行数: ${features.totalLines}`,
    `最大嵌套深度: ${features.maxNestingDepth}`,
    `空行比例: ${Math.round(features.blankLineRatio * 100)}%`,
    `注释比例: ${Math.round(features.commentRatio * 100)}%`,
    `平均行长度: ${features.avgLineLength} 字符`,
    `函数数量: ${features.functions.length}`,
    `函数名: [${features.functionNames.slice(0, 10).join(', ')}]`,
    `关键变量: [${features.variableNames.slice(0, 10).join(', ')}]`,
    `代码模式: ${features.dominantPatterns.map((p) => patternLabels[p]).join('、')}`,
    `嵌套分布: [${features.nestingDistribution.join(', ')}]`,
  ].join('\n');
}
