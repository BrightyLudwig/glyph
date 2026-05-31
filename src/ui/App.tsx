// ============================================================
// Glyph 主应用
// 管理全局状态，编排代码→艺术的转换流程
// ============================================================

import { useState, useCallback } from 'react';
import type { ArtStyle, CodeFeatures, GlyphResult } from '../core/types';
import { parseCode } from '../core/parser';
import { translateCodeToArt } from '../core/translator';
import { sanitizeSvg } from '../core/renderer';
import { CodeInput } from './components/CodeInput';
import { ArtCanvas } from './components/ArtCanvas';
import { ArtistStatement } from './components/ArtistStatement';
import { StyleSelector } from './components/StyleSelector';
import { ExportPanel } from './components/ExportPanel';

type AppPhase = 'empty' | 'generating' | 'done' | 'error';

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('empty');
  const [code, setCode] = useState('');
  const [style, setStyle] = useState<ArtStyle>('auto');
  const [result, setResult] = useState<GlyphResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!code.trim()) return;

    setPhase('generating');
    setError(null);

    try {
      // Step 1: 解析代码特征
      const features: CodeFeatures = parseCode(code);

      // Step 2: 调用 DeepSeek 生成艺术
      const { svg, statement } = await translateCodeToArt(
        code,
        features,
        style
      );

      // Step 3: 清理并渲染
      const cleanedSvg = sanitizeSvg(svg);

      const glyphResult: GlyphResult = {
        svg: cleanedSvg,
        statement,
        features,
        styleUsed: style,
        modelUsed: 'deepseek-chat',
        timestamp: Date.now(),
      };

      setResult(glyphResult);
      setPhase('done');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '生成失败，请重试';
      setError(message);
      setPhase('error');
    }
  }, [code, style]);

  const handleReset = useCallback(() => {
    setPhase('empty');
    setResult(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen">
      {/* 头部 */}
      <Header />

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 风格选择器 */}
        {phase !== 'done' && (
          <StyleSelector value={style} onChange={setStyle} />
        )}

        {/* 生成前的视图：代码输入 */}
        {(phase === 'empty' || phase === 'error') && (
          <div className="mt-6">
            <CodeInput
              code={code}
              onChange={setCode}
              onGenerate={handleGenerate}
              disabled={!code.trim()}
            />
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* 生成中 */}
        {phase === 'generating' && <GeneratingView code={code} />}

        {/* 生成完成：展示作品 */}
        {phase === 'done' && result && (
          <div className="mt-6 space-y-8">
            {/* 风格标签 + 重新生成按钮 */}
            <div className="flex items-center justify-between">
              <StyleSelector value={style} onChange={setStyle} />
              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  className="btn-glyph text-sm"
                >
                  🔄 重新生成
                </button>
                <button
                  onClick={handleReset}
                  className="btn-glyph text-sm"
                >
                  ✕ 新代码
                </button>
              </div>
            </div>

            {/* 画布 */}
            <ArtCanvas svg={result.svg} />

            {/* 艺术家陈述 */}
            <ArtistStatement
              statement={result.statement}
              features={result.features}
              style={result.styleUsed}
            />

            {/* 导出 */}
            <ExportPanel svg={result.svg} />
          </div>
        )}
      </main>

      {/* 页脚 */}
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎨</span>
          <h1 className="text-xl font-display font-semibold tracking-tight">
            Glyph
          </h1>
          <span className="hidden sm:inline text-sm text-gray-400 font-light">
            代码即艺术
          </span>
        </div>
        <a
          href="https://github.com/BrightyLudwig/glyph"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          GitHub ↗
        </a>
      </div>
    </header>
  );
}

function GeneratingView({ code }: { code: string }) {
  return (
    <div className="mt-6 space-y-6">
      {/* 展示正在处理的代码片段 */}
      <div className="art-frame p-6">
        <div className="text-sm text-gray-500 mb-2 font-medium">
          正在分析代码...
        </div>
        <pre className="text-xs text-gray-400 bg-gray-50 p-4 rounded overflow-auto max-h-48 whitespace-pre-wrap code-input-area">
          {code.slice(0, 500)}
          {code.length > 500 ? '\n...' : ''}
        </pre>
      </div>

      {/* 生成动画 */}
      <div className="art-frame p-12 flex flex-col items-center justify-center gap-4">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400 breathing-dot" />
          <div
            className="w-3 h-3 rounded-full bg-gray-500 breathing-dot"
            style={{ animationDelay: '0.3s' }}
          />
          <div
            className="w-3 h-3 rounded-full bg-gray-600 breathing-dot"
            style={{ animationDelay: '0.6s' }}
          />
        </div>
        <p className="text-sm text-gray-500 font-light mt-2">
          DeepSeek 正在为你的代码创作艺术肖像...
        </p>
        <p className="text-xs text-gray-400 font-light">
          这可能需要 10-30 秒
        </p>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-16 py-8 text-center">
      <p className="text-xs text-gray-400 font-light">
        Glyph · 代码即艺术 ·{' '}
        <a
          href="https://github.com/BrightyLudwig/glyph"
          className="hover:text-gray-600 transition-colors"
        >
          MIT License
        </a>
      </p>
    </footer>
  );
}
