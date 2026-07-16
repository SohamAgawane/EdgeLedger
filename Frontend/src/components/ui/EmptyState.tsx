import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "var(--brand-bg)" }}
      >
        <Icon size={24} style={{ color: "var(--brand)" }} />
      </div>

      <h3
        className="text-[15px] font-semibold mb-1"
        style={{ color: "var(--text)" }}
      >
        {title}
      </h3>

      <p
        className="text-[13px] mb-5 max-w-xs"
        style={{ color: "var(--text3)" }}
      >
        {description}
      </p>

      {action}
    </div>
  );
}