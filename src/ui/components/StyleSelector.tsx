// ============================================================
// 艺术风格选择器
// ============================================================

import type { ArtStyle } from '../../core/types';
import { STYLE_LABELS } from '../../core/types';

interface Props {
  value: ArtStyle;
  onChange: (style: ArtStyle) => void;
}

const STYLES: ArtStyle[] = [
  'auto',
  'mondrian',
  'rothko',
  'pollock',
  'kandinsky',
  'zen',
];

export function StyleSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="text-xs text-gray-400 font-medium tracking-wide uppercase mb-2 block">
        艺术风格
      </label>
      <div className="flex gap-2 flex-wrap">
        {STYLES.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`style-chip ${value === s ? 'active' : ''}`}
          >
            {STYLE_LABELS[s]}
          </button>
        ))}
      </div>
    </div>
  );
}
