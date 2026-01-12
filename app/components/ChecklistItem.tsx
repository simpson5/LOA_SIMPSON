import type { ReactNode } from "react";

interface ChecklistItemProps {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ChecklistItem({ label, checked, onChange, disabled }: ChecklistItemProps) {
  return (
    <label className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
      checked ? "bg-green-900/30" : "bg-gray-700/50 hover:bg-gray-700"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
      />
      <span className={checked ? "line-through text-gray-400" : ""}>{label}</span>
    </label>
  );
}

interface CounterItemProps {
  label: string;
  count: number;
  maxCount: number;
  onChange: (count: number) => void;
}

export function CounterItem({ label, count, maxCount, onChange }: CounterItemProps) {
  const isComplete = count >= maxCount;

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${
      isComplete ? "bg-green-900/30" : "bg-gray-700/50"
    }`}>
      <span className={isComplete ? "line-through text-gray-400" : ""}>{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(0, count - 1))}
          className="w-8 h-8 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
          disabled={count === 0}
        >
          -
        </button>
        <span className="w-12 text-center font-mono">
          {count}/{maxCount}
        </span>
        <button
          onClick={() => onChange(Math.min(maxCount, count + 1))}
          className="w-8 h-8 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
          disabled={count >= maxCount}
        >
          +
        </button>
      </div>
    </div>
  );
}
