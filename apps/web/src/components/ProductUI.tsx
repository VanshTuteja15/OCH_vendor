import type { ReactNode } from 'react';
import { LockKeyhole } from 'lucide-react';

export function PageIntro({
  eyebrow = 'Vendor workspace',
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-intro">
      <div>
        <div className="page-kicker">{eyebrow}</div>
        <h1 className="page-heading">{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  trailing,
}: {
  title: string;
  description?: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="section-header">
      <div>
        <h2 className="section-title">{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {trailing}
    </div>
  );
}

export function LockedCaption({ children }: { children?: ReactNode }) {
  return (
    <div className="locked-note">
      <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{children ?? 'Locked — changes require review and approval from OCH Procurement.'}</span>
    </div>
  );
}
