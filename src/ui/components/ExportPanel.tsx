// ============================================================
// 导出面板
// SVG / PNG 下载
// ============================================================

import { useState } from 'react';
import { downloadAsSvg, downloadAsPng } from '../../core/renderer';

interface Props {
  svg: string;
}

export function ExportPanel({ svg }: Props) {
  const [exporting, setExporting] = useState(false);
  const [exportedFormat, setExportedFormat] = useState<string | null>(null);

  const handleExportPng = async () => {
    setExporting(true);
    setExportedFormat('PNG');
    try {
      await downloadAsPng(svg, `glyph-${Date.now()}.png`);
    } catch (err) {
      console.error('PNG 导出失败:', err);
      alert('PNG 导出失败，请尝试 SVG 格式');
    } finally {
      setExporting(false);
      setTimeout(() => setExportedFormat(null), 2000);
    }
  };

  const handleExportSvg = () => {
    setExportedFormat('SVG');
    downloadAsSvg(svg, `glyph-${Date.now()}.svg`);
    setTimeout(() => setExportedFormat(null), 2000);
  };

  return (
    <div className="art-frame p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500 tracking-wide uppercase">
            📥 导出作品
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            SVG 可无损缩放编辑 · PNG 高清 1600×1200
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExportSvg}
            disabled={exporting}
            className="btn-glyph text-sm flex items-center gap-2"
          >
            {exportedFormat === 'SVG' ? (
              <>
                <span className="text-green-600">✓</span> 已下载
              </>
            ) : (
              <>
                <span>⬇</span> SVG
              </>
            )}
          </button>

          <button
            onClick={handleExportPng}
            disabled={exporting}
            className="btn-glyph text-sm flex items-center gap-2"
          >
            {exportedFormat === 'PNG' ? (
              <>
                <span className="text-green-600">✓</span> 已下载
              </>
            ) : (
              <>
                <span>🖼️</span> PNG
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
