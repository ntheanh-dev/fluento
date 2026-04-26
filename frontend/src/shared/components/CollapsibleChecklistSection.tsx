import { useState, type ReactNode } from "react";
import { CheckSquare, ChevronDown, Square } from "lucide-react";

type ChecklistItem = {
  key: string;
  label: ReactNode;
  selected: boolean;
  onClick: () => void;
};

type CollapsibleChecklistSectionProps = {
  title: ReactNode;
  items: ChecklistItem[];
  defaultExpanded?: boolean;
  collapsible?: boolean;
  renderIndicator?: (selected: boolean) => ReactNode;
};

export function CollapsibleChecklistSection({
  title,
  items,
  defaultExpanded = true,
  collapsible = true,
  renderIndicator,
}: CollapsibleChecklistSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const showItems = collapsible ? expanded : true;

  return (
    <section className="space-y-2.5">
      <button
        type="button"
        onClick={() => {
          if (!collapsible) return;
          setExpanded((prev) => !prev);
        }}
        className="w-full flex items-center justify-between text-left"
        aria-expanded={showItems}
      >
        <h3 className="text-slate-800 dark:text-slate-100 font-semibold uppercase tracking-wide text-xs">
          {title}
        </h3>
        {collapsible && (
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {showItems && (
        <div className="space-y-1.5">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              className="w-full pl-2 py-1.5 flex items-center justify-between text-left rounded-lg hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-colors"
            >
              <span className="text-sm leading-tight text-slate-700 dark:text-slate-200 font-medium">
                {item.label}
              </span>
              {renderIndicator ? (
                renderIndicator(item.selected)
              ) : item.selected ? (
                <CheckSquare className="w-4 h-4 text-blue-500" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
