// ============================================================
// SVG 渲染工具
// 验证、清理、增强 DeepSeek 返回的 SVG
// ============================================================

/**
 * 验证并清理 SVG，确保安全渲染
 */
export function sanitizeSvg(svg: string): string {
  let cleaned = svg.trim();

  // 确保有正确的 xmlns
  if (!cleaned.includes('xmlns')) {
    cleaned = cleaned.replace(
      '<svg',
      '<svg xmlns="http://www.w3.org/2000/svg"'
    );
  }

  // 确保有 viewBox
  if (!cleaned.includes('viewBox')) {
    cleaned = cleaned.replace(
      '<svg',
      '<svg viewBox="0 0 800 600"'
    );
  }

  // 移除可能的 HTML 注释（但保留 CSS 注释）
  // 移除 script 标签（安全）
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  return cleaned;
}

/**
 * 生成 SVG 的 Data URL（用于下载）
 */
export function svgToDataUrl(svg: string): string {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

/**
 * 将 SVG 转换为 PNG 并触发下载
 */
export async function downloadAsPng(svg: string, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const dataUrl = svgToDataUrl(svg);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      // 2x 分辨率用于高清输出
      canvas.width = 1600;
      canvas.height = 1200;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('无法创建 Canvas 上下文'));
        return;
      }

      // 白色背景（SVG 可能是透明的）
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas 导出失败'));
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        resolve();
      }, 'image/png');
    };

    img.onerror = () => reject(new Error('SVG 加载失败'));
    img.src = dataUrl;
  });
}

/**
 * 下载 SVG 文件
 */
export function downloadAsSvg(svg: string, filename: string): void {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 生成默认 SVG（当 API 不可用时的回退）
 */
export function generateFallbackSvg(): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#faf8f5"/>
      <stop offset="100%" style="stop-color:#f0ebe3"/>
    </linearGradient>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#16213e"/>
    </linearGradient>
  </defs>

  <!-- 背景 -->
  <rect width="800" height="600" fill="url(#bg)"/>

  <!-- 中央构图 —— 函数调用的几何映射 -->
  <rect x="250" y="150" width="300" height="300" rx="4"
        fill="none" stroke="url(#g1)" stroke-width="2" opacity="0.8"/>

  <rect x="280" y="180" width="240" height="80" rx="2"
        fill="url(#g1)" opacity="0.9"/>

  <rect x="280" y="280" width="110" height="60" rx="2"
        fill="url(#g1)" opacity="0.6"/>
  <rect x="410" y="280" width="110" height="60" rx="2"
        fill="url(#g1)" opacity="0.6"/>

  <rect x="280" y="360" width="50" height="60" rx="2"
        fill="url(#g1)" opacity="0.3"/>

  <!-- 连线：调用关系 -->
  <line x1="400" y1="260" x2="335" y2="280" stroke="#16213e" stroke-width="1" opacity="0.5"/>
  <line x1="400" y1="260" x2="465" y2="280" stroke="#16213e" stroke-width="1" opacity="0.5"/>
  <line x1="335" y1="340" x2="305" y2="360" stroke="#16213e" stroke-width="1" opacity="0.3"/>

  <!-- 签名 -->
  <text x="760" y="580" text-anchor="end"
        font-family="Georgia, serif" font-size="14"
        fill="#999" opacity="0.5">glyph</text>
</svg>`;
}
