// ============================================================
// 艺术画布组件
// 安全渲染 SVG，支持缩放查看细节
// ============================================================

import { useState, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';

interface Props {
  svg: string;
}

export function ArtCanvas({ svg }: Props) {
  const [zoomed, setZoomed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 使用 DOMPurify 清理 SVG 防止 XSS
  const cleanSvg = DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['use', 'defs', 'linearGradient', 'radialGradient', 'stop', 'filter'],
    ADD_ATTR: [
      'viewBox', 'preserveAspectRatio', 'xmlns',
      'cx', 'cy', 'r', 'rx', 'ry',
      'x1', 'y1', 'x2', 'y2',
      'd', 'points', 'transform',
      'stroke-width', 'stroke-dasharray', 'stroke-linecap',
      'fill-opacity', 'stroke-opacity', 'opacity',
      'offset', 'stop-color', 'stop-opacity',
      'stdDeviation', 'result', 'in', 'in2', 'mode',
      'filterUnits', 'gradientUnits', 'gradientTransform',
      'spreadMethod',
    ],
  });

  return (
    <div className="art-frame overflow-hidden">
      {/* 画框顶部装饰条 */}
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-light tracking-wider uppercase">
          作品预览
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setZoomed(!zoomed)}
            className="text-xs px-2 py-1 rounded border border-gray-200
                       text-gray-500 hover:border-gray-400 hover:text-gray-700
                       transition-colors"
          >
            {zoomed ? '⊟ 适合窗口' : '⊕ 放大查看'}
          </button>
        </div>
      </div>

      {/* 画作展示区 */}
      <div
        ref={containerRef}
        className={`
          art-canvas flex items-center justify-center
          bg-[#faf8f5] p-4 min-h-[400px]
          transition-all duration-500
          ${zoomed ? 'overflow-auto' : 'overflow-hidden'}
        `}
        style={{
          backgroundImage: `
            linear-gradient(45deg, #f0ebe3 25%, transparent 25%),
            linear-gradient(-45deg, #f0ebe3 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #f0ebe3 75%),
            linear-gradient(-45deg, transparent 75%, #f0ebe3 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }}
      >
        <div
          className={`
            transition-transform duration-500 ease-out
            ${zoomed ? 'scale-150' : 'scale-100'}
          `}
          style={{
            maxWidth: zoomed ? 'none' : '100%',
          }}
          dangerouslySetInnerHTML={{ __html: cleanSvg }}
        />
      </div>
    </div>
  );
}
