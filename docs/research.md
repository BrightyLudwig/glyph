# 同类项目调研报告

> 2026-05-31 · Glyph 项目前期调研

---

## 调研方法

在 GitHub 上搜索以下关键词组合，逐一审查匹配项目：
- `code to art` / `code2art` / `code as art`
- `source code visualization abstract art`
- `programming aesthetics visualization`
- `AST visual art generator`

共发现 **7 个** 相关开源项目，按与 Glyph 理念的接近程度分级。

---

## 第一梯队：理念相近，路径不同

### SHAde
- **仓库**: [LalwaniPalash/SHAde](https://github.com/LalwaniPalash/SHAde)
- **语言**: Python
- **核心思路**: 将每个 Git commit 的 SHA 哈希值映射为一张确定性抽象画，支持多种渲染模式（柱状、螺旋、海报），使用 LAB/LCH 色彩空间保证视觉和谐
- **亮点**:
  - 色彩科学扎实（LAB/LCH 而非简单的 RGB/HSL）
  - 多渲染模式，像一个"画廊"
  - 确定性映射——同一个 hash 永远生成同一幅画
- **与 Glyph 的差异**:
  - 输入是 **commit hash**，不是代码内容本身
  - 它画的是"仓库的历史"，不是"代码的结构"
  - 哈希→视觉的映射是任意的，缺少语义锚点

### Syntaxesia
- **来源**: [Devpost](https://devpost.com/software/syntaxesia)
- **核心思路**: "代码即展览"——分析 GitHub 仓库的结构信号（循环、递归、嵌套深度），用 Gemini AI + Imagen 生成后现代艺术品，呈现在虚拟美术馆中
- **亮点**:
  - 概念完整——从分析到生成到展示是一条完整链路
  - 结构信号驱动（loops, recursion, nesting）
  - 美术馆的呈现方式很有仪式感
- **与 Glyph 的差异**:
  - 重度依赖 AI 生成（Gemini + Imagen），输出不可控
  - 黑盒——你无法解释"为什么这里出现了这个颜色"
  - 更像是"AI 看了你的代码后的感想"，而非"代码本身的视觉化"

### CodeMorpheus
- **仓库**: [opendilab/CodeMorpheus](https://github.com/opendilab/CodeMorpheus)
- **核心思路**: 粘贴代码 → 一键生成"代码自画像"，使用决策 AI + 生成式 AI
- **亮点**:
  - 体验简洁（一键出图）
  - 有 GitHub 年度总结版（场景化做得好）
- **与 Glyph 的差异**:
  - 完全的 AI 黑盒
  - 更像"代码的 Instagram 滤镜"而非"代码的视觉翻译"
  - 缺少对代码结构的尊重——AI 可能生成任何东西

---

## 第二梯队：技术参考价值

### code2art
- **仓库**: [philipaconrad/code2art](https://github.com/philipaconrad/code2art)
- **语言**: F#
- **核心思路**: 将文本/代码文件的字节直接映射为像素颜色，生成 PNG
- **技术参考**: 极简的映射管道设计
- **局限**: 没有 AST 分析，没有语义理解，字节→颜色的映射是纯机械的

### GitAura
- **来源**: [Devpost](https://devpost.com/software/gitaura-iyhuge)
- **核心思路**: 分析仓库的"氛围"（Cyberpunk / Zen / Chaotic），渲染交互式 3D WebGL 场景 + Tone.js 生成音频
- **亮点**:
  - 多感官（视觉 + 听觉）
  - "氛围"的概念很有意思——不是分析结构而是感受气息
  - 技术栈现代（Next.js 16, React Three Fiber, Pinecone）
- **与 Glyph 的差异**:
  - 偏重"氛围"的感受而非"结构"的翻译
  - 3D 场景和二进制的关联较弱

### JetBrains Radiant / Origami
- **仓库**: [davtstew/open-radiant](https://github.com/davtstew/open-radiant) (社区镜像)
- **语言**: Elm + Webpack
- **核心思路**: JetBrains 官方的品牌动画和艺术生成器，生成动态品牌视觉、生物形态、色彩图案
- **技术参考**: Elm 的函数式渲染管道设计、动画系统
- **局限**: 面向品牌视觉，输入不是代码

---

## 第三梯队：概念有趣，规模较小

### sudorandom/art
- **仓库**: [sudorandom/art](https://github.com/sudorandom/art)
- **语言**: Python
- **核心思路**: 自指涉（quine）实验——脚本读取自己的源码，生成将源码编码为十六进制/二进制的图像，隐藏文字
- **有趣之处**: "代码画自己"的元概念
- **局限**: 实验性质，不成体系

---

## 市场空白分析

```
                    简单映射               AI 黑盒
                    ────────              ────────
                    │                          │
  code2art ─────────┤                          ├─── CodeMorpheus
  sudorandom/art ───┤                          ├─── Syntaxesia
                    │        ⬆ GLYPH          │
                    │      在这里              │
                    │                          │
                    │    • AST 结构分析         │
                    │    • 确定性 + 可解释      │
                    │    • 有艺术理论支撑       │
                    │    • 语义锚点清晰         │
                    └──────────────────────────┘
```

### Glyph 的独特定位

所有现有项目都落在光谱的两端：
- **太简单**：字节→像素的直接映射，没有语义理解，产出缺乏艺术性
- **太黑盒**：丢给 AI 生成，结果无法追溯，和代码本身的关联断裂

**中间地带完全空白**——基于 AST 的确定性结构分析 + 有艺术理论支撑的视觉映射。

这意味着：
1. 每个视觉元素都可以追溯到具体的代码结构（不是魔法）
2. 映射规则有美学依据，不是拍脑袋（有理论）
3. 同样的代码永远生成同样的画（确定性）
4. 用户理解"为什么我的代码长这样"（可解释）

---

## 关键洞察

### 1. SHAde 的"确定性"是正确方向
同一段代码应该永远生成同一幅画。这不仅是一个技术选择，更是一个**哲学立场**——代码的美是内在的、客观存在的，不是 AI "觉得"它美。

### 2. Syntaxesia 的"美术馆"概念值得借鉴
将输出组织成"展览"而非单张图片，增加了仪式感。Glyph 可以考虑支持批量处理——一个仓库生成一组作品，构成一次"个展"。

### 3. GitAura 的"多感官"提醒我们不要自我设限
虽然 Phase 1 聚焦视觉，但声音维度（代码的节奏 → 音乐的节奏）是天然的第二感官。

### 4. 所有竞品都没有回答"为什么"
为什么这个颜色？为什么这个形状？为什么这个构图？——没有一个项目能回答。Glyph 必须能回答。**可解释性是我们的护城河。**

---

*本报告将随项目进展持续更新。*
