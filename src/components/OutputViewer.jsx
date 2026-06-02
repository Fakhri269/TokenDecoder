import { useMemo } from 'react';
import { highlightJSON } from '../utils/highlight';
import { Code } from 'lucide-react';

export default function OutputViewer({ json, isEmpty }) {
  const highlighted = useMemo(() => json ? highlightJSON(json) : '', [json]);
  const lines = useMemo(() => json ? json.split('\n') : [], [json]);

  return (
    <div className="relative h-full w-full overflow-hidden flex bg-white">
      {isEmpty ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
          <div className="w-12 h-12 mb-4 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <Code size={20} strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">No Output</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Paste a Base64-encoded token and decrypt it to view the formatted JSON here.
          </p>
        </div>
      ) : (
        <div className="flex h-full w-full overflow-auto">
          {/* Line numbers */}
          <div className="flex-shrink-0 py-4 bg-gray-50 border-r border-gray-200 select-none sticky left-0 min-h-full">
            {lines.map((_, i) => (
              <div key={i} className="px-4 text-right text-xs leading-6 text-gray-400 font-mono">
                {i + 1}
              </div>
            ))}
          </div>
          {/* Code */}
          <pre
            className="flex-1 py-4 px-6 font-mono text-[13px] leading-6 whitespace-pre overflow-x-auto text-gray-800"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </div>
      )}
    </div>
  );
}
