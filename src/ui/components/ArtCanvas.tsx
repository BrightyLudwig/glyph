// ============================================================
// 艺术画布组件
// 使用 <img> + data URL 渲染 SVG — 最可靠的方式
// ============================================================

import { useState, useMemo } from 'react';

interface Props {
  svg: string;
}

export function ArtCanvas({ svg }: Props) {
  const [zoomed, setZoomed] = useState(false);
  const [imgError, setImgError] = useState(false);

  // 将 SVG 转为 data URL，让浏览器原生渲染
  const svgDataUrl = useMemo(() => {
    try {
      // 确保 SVG 有正确的命名空间声明
      let svgStr = svg.trim();
      if (!svgStr.includes('xmlns')) {
        svgStr = svgStr.replace(
          /<svg/i,
          '<svg xmlns="http://www.w3.org/2000/svg"'
        );
      }
      const encoded = encodeURIComponent(svgStr)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22');
      return `data:image/svg+xml;charset=utf-8,${encoded}`;
    } catch {
      return '';
    }
  }, [svg]);

  return (
    <div className="art-frame overflow-hidden">
      {/* 顶部工具栏 */}
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-light tracking-wider uppercase">
          作品预览
        </span>
        <button
          onClick={() => setZoomed(!zoomed)}
          className="text-xs px-2 py-1 rounded border border-gray-200
                     text-gray-500 hover:border-gray-400 hover:text-gray-700
                     transition-colors"
        >
          {zoomed ? '⊟ 适合窗口' : '⊕ 放大查看'}
        </button>
      </div>

      {/* 画作展示区 */}
      <div
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
        {imgError ? (
          <div className="text-center text-gray-400">
            <p className="text-lg mb-2">⚠️</p>
            <p className="text-sm">SVG 渲染失败</p>
            <p className="text-xs mt-1">请尝试重新生成</p>
          </div>
        ) : (
          <img
            src={svgDataUrl}
            alt="代码艺术品"
            onError={() => setImgError(true)}
            className={`
              transition-transform duration-500 ease-out
              ${zoomed ? 'scale-150' : 'scale-100'}
            `}
            style={{
              maxWidth: zoomed ? 'none' : '100%',
              height: 'auto',
              display: 'block',
              boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
            }}
          />
        )}
      </div>
    </div>
  );
}
