import type { ComplianceDoc, DocStatus } from '../types';

export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function docStatus(doc: ComplianceDoc): DocStatus {
  const days = daysUntil(doc.expiryDate);
  if (days < 0) return 'expired';
  if (days <= 30) return 'expiring';
  return 'valid';
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
}

export function complianceScore(documents: ComplianceDoc[]): number {
  const required = documents.filter((d) => d.required);
  if (required.length === 0) return 100;
  let total = 0;
  for (const doc of required) {
    const status = docStatus(doc);
    if (status === 'valid') total += 100;
    else if (status === 'expiring') total += 60;
    else total += 0;
  }
  return Math.round(total / required.length);
}

export function hasExpiredRequiredDoc(documents: ComplianceDoc[]): boolean {
  return documents.some((d) => d.required && docStatus(d) === 'expired');
}

export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
