// ============================================================
// 调色板引擎 — 代码美学的色彩基础
//
// 我们不信任 LLM 的色彩判断，而是提供精心策划的调色板。
// 每个调色板灵感来自艺术史上的经典配色。
// ============================================================

export interface Palette {
  name: string;
  /** 源流 — 艺术史参考 */
  reference: string;
  /** 主色 — 画面中最突出的颜色 */
  primary: string;
  /** 辅色 — 2-4个辅助色 */
  secondary: string[];
  /** 强调色 — 小面积使用的对比色 */
  accent: string;
  /** 背景色 */
  background: string;
  /** 适用于什么代码类型 */
  bestFor: string[];
}

/**
 * 精选调色板库
 * 每个都经过艺术史验证，不依赖 LLM 的随机选择
 */
export const PALETTES: Palette[] = [
  // ═══════════════════════════════════════════
  // 冷色调 — 理性、秩序、几何
  // ═══════════════════════════════════════════
  {
    name: '包豪斯蓝',
    reference: '约瑟夫·阿尔伯斯《向正方形致敬》系列',
    primary: '#1a3a5c',
    secondary: ['#2d5f8a', '#4a85bb', '#87b9e0'],
    accent: '#e8a840',
    background: '#f4f1ea',
    bestFor: ['function-library', '递归', '类型定义'],
  },
  {
    name: '深夜暗流',
    reference: '罗斯科 1958 年西格拉姆壁画',
    primary: '#1c1c2e',
    secondary: ['#2a2a4a', '#3d3d6b', '#554488'],
    accent: '#c4a35a',
    background: '#f5f3ef',
    bestFor: ['深层嵌套', '复杂逻辑', 'class-module'],
  },
  {
    name: '薄暮灰',
    reference: '艾格尼丝·马丁的网格绘画',
    primary: '#5a5a5a',
    secondary: ['#8a8a8a', '#b0b0b0', '#d4d4d4'],
    accent: '#c17767',
    background: '#fafaf8',
    bestFor: ['interface-definition', 'config', '极简代码'],
  },

  // ═══════════════════════════════════════════
  // 暖色调 — 情感、温度、人性
  // ═══════════════════════════════════════════
  {
    name: '托斯卡纳土',
    reference: '文艺复兴湿壁画底色',
    primary: '#8b5e3c',
    secondary: ['#c4956a', '#ddb892', '#e8d5b7'],
    accent: '#2d5a4b',
    background: '#fdfaf5',
    bestFor: ['class-module', '面向对象', 'pipeline'],
  },
  {
    name: '普罗旺斯落日',
    reference: '塞尚的圣维克多山系列',
    primary: '#c47a4a',
    secondary: ['#e0a97a', '#ecc8a0', '#d4a08a'],
    accent: '#4a6fa5',
    background: '#fef9f3',
    bestFor: ['script', '数据处理', '回调'],
  },
  {
    name: '胭脂金',
    reference: '古斯塔夫·克里姆特《吻》',
    primary: '#8b2942',
    secondary: ['#c47a5a', '#d4a080', '#e8c8a0'],
    accent: '#c9a84c',
    background: '#fdf8f3',
    bestFor: ['核心算法', '递归', 'pattern-matching'],
  },

  // ═══════════════════════════════════════════
  // 自然色调 — 平衡、呼吸、有机
  // ═══════════════════════════════════════════
  {
    name: '苔藓森林',
    reference: '莫奈的睡莲系列',
    primary: '#3d5a40',
    secondary: ['#5c8a60', '#7faa80', '#b5d0b0'],
    accent: '#c49a3c',
    background: '#f8faf5',
    bestFor: ['递归', '树形结构', 'function-library'],
  },
  {
    name: '矿石灰绿',
    reference: '日本侘寂美学',
    primary: '#5a6a5a',
    secondary: ['#7a8a7a', '#a0b0a0', '#c8d4c8'],
    accent: '#b87040',
    background: '#f7f5f0',
    bestFor: ['接口', '类型定义', 'config'],
  },
  {
    name: '深海珊瑚',
    reference: '葛饰北斋《神奈川冲浪里》',
    primary: '#2a4a5a',
    secondary: ['#3d6a7a', '#5a8a9a', '#a0c8d4'],
    accent: '#d4705a',
    background: '#f5f6f5',
    bestFor: ['事件驱动', '异步代码', 'pipeline'],
  },

  // ═══════════════════════════════════════════
  // 高对比 — 戏剧性、张力、冲突
  // ═══════════════════════════════════════════
  {
    name: '极夜白昼',
    reference: '马列维奇《白上白》 / 克莱因《蓝》',
    primary: '#0a0a14',
    secondary: ['#2a2a3a', '#4a4a5a', '#8a8a90'],
    accent: '#e8e0d0',
    background: '#fafafa',
    bestFor: ['极简函数', '核心逻辑', 'algorithm'],
  },
  {
    name: '深红密码',
    reference: '罗斯科 1950 年代红色系列',
    primary: '#7a2020',
    secondary: ['#a04040', '#c46060', '#d8a0a0'],
    accent: '#c4a840',
    background: '#fcf7f5',
    bestFor: ['错误处理', '状态机', 'pattern-matching'],
  },
  {
    name: '紫雾凌晨',
    reference: '马克·罗斯科 1950 No.14',
    primary: '#3a3050',
    secondary: ['#5a5080', '#7a70a0', '#b0a8c8'],
    accent: '#d4a040',
    background: '#f6f4f8',
    bestFor: ['元编程', '装饰器', '高阶函数'],
  },
];

/**
 * 根据代码特征自动选择调色板
 */
export function selectPalette(features: {
  fileType: string;
  dominantPatterns: string[];
  maxNestingDepth: number;
  commentRatio: number;
}): Palette {
  // 匹配规则
  for (const palette of PALETTES) {
    for (const bestFor of palette.bestFor) {
      if (features.fileType === bestFor) return palette;
      if (features.dominantPatterns.includes(bestFor)) return palette;
    }
  }

  // 根据嵌套深度选择
  if (features.maxNestingDepth >= 4) return PALETTES[1]; // 深夜暗流 — 复杂
  if (features.maxNestingDepth <= 1) return PALETTES[2]; // 薄暮灰 — 极简

  // 根据注释比例选择
  if (features.commentRatio > 0.2) return PALETTES[7]; // 矿石灰绿 — 沉思

  // 默认：包豪斯蓝（最通用的理性配色）
  return PALETTES[0];
}

/**
 * 生成调色板的 CSS 变量字符串，用于注入 SVG
 */
export function paletteToCssVars(p: Palette): string {
  return `
    --color-primary: ${p.primary};
    --color-secondary-1: ${p.secondary[0]};
    --color-secondary-2: ${p.secondary[1] || p.secondary[0]};
    --color-secondary-3: ${p.secondary[2] || p.secondary[1] || p.secondary[0]};
    --color-accent: ${p.accent};
    --color-background: ${p.background};
  `;
}

/**
 * 将调色板描述注入 prompt，指导 LLM 使用
 */
export function paletteToPrompt(p: Palette): string {
  return `
## 指定调色板：${p.name}
灵感：${p.reference}

必须严格使用以下颜色（仅在色值上可做 ±5% 微调）：

| 角色 | 色值 | 用途 |
|------|------|------|
| 主色 | \`${p.primary}\` | 大面积色块、主要形状填充 |
| 辅色1 | \`${p.secondary[0]}\` | 次要色块、嵌套内层 |
| 辅色2 | \`${p.secondary[1] || p.secondary[0]}\` | 背景层次变化 |
| 辅色3 | \`${p.secondary[2] || p.secondary[1] || p.secondary[0]}\` | 最淡色、背景过渡 |
| 强调色 | \`${p.accent}\` | 少量使用（<10%面积），连线、点缀 |
| 背景色 | \`${p.background}\` | 主背景 |

色彩和谐规则：
- 主色+辅色占画面 60-70%
- 背景色占 20-30%
- 强调色不超过 10%
- 避免使用以上调色板之外的颜色
- 可用 opacity 制造同色系的层次变化
- 不要使用纯黑 (#000) 或纯白 (#fff)，始终用调色板中的颜色
`;
}
