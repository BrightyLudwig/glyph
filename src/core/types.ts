// ============================================================
// Glyph 核心类型定义
// 代码 → 美学特征 → 艺术参数 → SVG 艺术品
// ============================================================

/** 从源码中提取的结构特征 */
export interface CodeFeatures {
  // 结构特征
  functions: FunctionInfo[];
  maxNestingDepth: number;
  nestingDistribution: number[];

  // 密度特征
  avgLineLength: number;
  lineLengthVariance: number;
  commentRatio: number;
  blankLineRatio: number;
  totalLines: number;

  // 语义特征
  variableNames: string[];
  functionNames: string[];
  dominantPatterns: CodePattern[];

  // 元特征
  language: string;
  fileType: CodeFileType;
}

export interface FunctionInfo {
  name: string;
  lineStart: number;
  lineEnd: number;
  length: number;
  depth: number;
}

export type CodePattern =
  | 'recursion'
  | 'pipeline'
  | 'callback'
  | 'class-hierarchy'
  | 'pattern-matching'
  | 'event-driven'
  | 'declarative'
  | 'imperative-loop';

export type CodeFileType =
  | 'function-library'
  | 'class-module'
  | 'script'
  | 'config'
  | 'interface-definition';

/** DeepSeek 返回的艺术参数 */
export interface ArtParameters {
  palette: ColorPalette;
  composition: Composition;
  elements: ArtElement[];
  artistStatement: string;
  rawSvg?: string;
}

export interface ColorPalette {
  primary: string;
  secondary: string[];
  accent: string;
  background: string;
}

export interface Composition {
  type: 'grid' | 'radial' | 'diagonal' | 'organic' | 'field';
  negativeSpacePercent: number;
  dominantDirection: 'horizontal' | 'vertical' | 'diagonal' | 'omnidirectional';
}

export interface ArtElement {
  type: 'rect' | 'circle' | 'line' | 'polygon' | 'path' | 'text';
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  opacity: number;
  meaning: string;
  extra?: Record<string, string | number>;
}

/** 生成结果 */
export interface GlyphResult {
  svg: string;
  statement: string;
  features: CodeFeatures;
  styleUsed: ArtStyle;
  modelUsed: string;
  timestamp: number;
}

/** 预设艺术风格 */
export type ArtStyle =
  | 'auto'
  | 'mondrian'
  | 'rothko'
  | 'pollock'
  | 'zen'
  | 'kandinsky';

export const STYLE_LABELS: Record<ArtStyle, string> = {
  auto: '🤖 自动识别',
  mondrian: '🔲 蒙德里安 — 几何构成',
  rothko: '🎨 罗斯科 — 色域绘画',
  pollock: '💥 波洛克 — 行动绘画',
  zen: '🍃 极简禅意 — 留白美学',
  kandinsky: '🎯 康定斯基 — 有机互动',
};

/** API 请求 */
export interface GenerateRequest {
  code: string;
  style: ArtStyle;
  language?: string;
}

/** API 响应 */
export interface GenerateResponse {
  success: boolean;
  result?: GlyphResult;
  error?: string;
}
