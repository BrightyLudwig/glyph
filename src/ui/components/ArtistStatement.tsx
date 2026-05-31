// ============================================================
// 艺术家陈述组件
// 展示 LLM 对艺术选择的解释，以及代码特征数据
// ============================================================

import type { ArtStyle, CodeFeatures } from '../../core/types';
import { STYLE_LABELS } from '../../core/types';

interface Props {
  statement: string;
  features: CodeFeatures;
  style: ArtStyle;
}

export function ArtistStatement({ statement, features, style }: Props) {
  const patternLabels: Record<string, string> = {
    recursion: '递归',
    pipeline: '管道链',
    callback: '回调/事件',
    'class-hierarchy': '类继承',
    'pattern-matching': '模式匹配',
    'event-driven': '事件驱动',
    declarative: '声明式',
    'imperative-loop': '命令式',
  };

  return (
    <div className="art-frame p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 艺术家陈述 */}
        <div className="md:col-span-2">
          <h3 className="text-sm font-medium text-gray-500 mb-3 tracking-wide uppercase">
            📝 艺术家陈述
          </h3>
          <blockquote className="text-gray-700 leading-relaxed font-light italic border-l-2 border-gray-200 pl-4">
            {statement || 'DeepSeek 未提供艺术家陈述。'}
          </blockquote>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <span>风格：{STYLE_LABELS[style]}</span>
            <span>·</span>
            <span>由 DeepSeek 创作</span>
          </div>
        </div>

        {/* 代码特征卡片 */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3 tracking-wide uppercase">
            🔍 代码特征
          </h3>
          <div className="space-y-2 text-sm">
            <FeatureRow label="语言" value={features.language} />
            <FeatureRow
              label="行数"
              value={`${features.totalLines} 行`}
            />
            <FeatureRow
              label="最大嵌套深度"
              value={`${features.maxNestingDepth} 层`}
            />
            <FeatureRow
              label="平均行长度"
              value={`${features.avgLineLength} 字符`}
            />
            <FeatureRow
              label="空行比例"
              value={`${Math.round(features.blankLineRatio * 100)}%`}
            />
            <FeatureRow
              label="注释比例"
              value={`${Math.round(features.commentRatio * 100)}%`}
            />
            <FeatureRow
              label="函数数量"
              value={`${features.functions.length} 个`}
            />
            <FeatureRow
              label="代码模式"
              value={features.dominantPatterns
                .map((p) => patternLabels[p] || p)
                .join(' · ')}
            />
            {features.functionNames.length > 0 && (
              <div className="pt-1">
                <span className="text-gray-400 text-xs">函数名</span>
                <p className="text-gray-600 text-xs mt-0.5 leading-relaxed">
                  {features.functionNames.slice(0, 8).join(', ')}
                  {features.functionNames.length > 8 ? '...' : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-700 font-medium text-right">{value}</span>
    </div>
  );
}
