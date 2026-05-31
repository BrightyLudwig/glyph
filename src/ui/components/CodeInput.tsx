// ============================================================
// 代码输入组件
// 支持粘贴和拖放文件
// ============================================================

import { useState, useRef, useCallback, type DragEvent } from 'react';

interface Props {
  code: string;
  onChange: (code: string) => void;
  onGenerate: () => void;
  disabled: boolean;
}

export function CodeInput({ code, onChange, onGenerate, disabled }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        readFile(file);
      }
    },
    []
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        readFile(file);
      }
    },
    []
  );

  function readFile(file: File) {
    // 限制文件大小 500KB
    if (file.size > 500 * 1024) {
      alert('文件太大了，请选择小于 500KB 的文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      onChange(text);
      setFileName(file.name);
    };
    reader.onerror = () => {
      alert('文件读取失败，请重试');
    };
    reader.readAsText(file);
  }

  // 示例代码
  const examples: { name: string; code: string }[] = [
    {
      name: '递归函数',
      code: `function walk(node, visitor) {
  if (!node) return;
  visitor.enter(node);
  for (const child of node.children) {
    walk(child, visitor);
  }
  visitor.leave(node);
}

function printTree(root) {
  walk(root, {
    enter: (n) => console.log('→', n.name),
    leave: (n) => console.log('←', n.name),
  });
}`,
    },
    {
      name: '管道流',
      code: `const result = await fetchUsers()
  .then(filterActive)
  .then(enrichWithProfiles)
  .then(groupByDepartment)
  .then(calculateMetrics)
  .catch(handleError);`,
    },
    {
      name: '类定义',
      code: `class EventEmitter {
  private listeners = new Map();

  on(event: string, handler: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
    return () => this.off(event, handler);
  }

  emit(event: string, ...args: unknown[]) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const h of handlers) h(...args);
    }
  }

  private off(event: string, handler: Function) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      const idx = handlers.indexOf(handler);
      if (idx > -1) handlers.splice(idx, 1);
    }
  }
}`,
    },
  ];

  return (
    <div className="space-y-4">
      {/* 示例代码快速填入 */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs text-gray-400 self-center">快速尝试：</span>
        {examples.map((ex) => (
          <button
            key={ex.name}
            onClick={() => {
              onChange(ex.code);
              setFileName(null);
            }}
            className="text-xs px-3 py-1 rounded-full border border-gray-200
                       text-gray-500 hover:border-gray-400 hover:text-gray-700
                       transition-colors"
          >
            {ex.name}
          </button>
        ))}
      </div>

      {/* 输入区域 */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl transition-all duration-300
          ${isDragging
            ? 'border-gray-900 bg-gray-50'
            : 'border-gray-200 hover:border-gray-300'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!code && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-gray-300 text-lg font-light">
              拖入代码文件，或粘贴代码到下方
            </p>
            <p className="text-gray-200 text-sm mt-1">
              .ts .js .py .rs .go .java .html .css
            </p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".ts,.tsx,.js,.jsx,.py,.rs,.go,.java,.html,.css,.json,.yaml"
              onChange={handleFileSelect}
            />
            <button
              className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors pointer-events-auto"
              onClick={() => fileInputRef.current?.click()}
            >
              或点击选择文件
            </button>
          </div>
        )}

        <textarea
          value={code}
          onChange={(e) => {
            onChange(e.target.value);
            setFileName(null);
          }}
          placeholder=" "
          rows={14}
          className="w-full p-5 bg-transparent resize-none code-input-area text-sm
                     text-gray-800 placeholder-transparent focus:outline-none
                     leading-relaxed"
          spellCheck={false}
        />

        {fileName && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">
            {fileName}
          </div>
        )}
      </div>

      {/* 生成按钮 */}
      <div className="flex justify-center">
        <button
          onClick={onGenerate}
          disabled={disabled}
          className={`
            btn-glyph-primary text-base px-12 py-4
            ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          ✨ 生成艺术
        </button>
      </div>
    </div>
  );
}
