export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-sm text-slate-500">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-och-teal-light border-t-och-teal" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center px-6 text-center">
      <div className="max-w-md rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-danger shadow-sm">
        {message}
      </div>
    </div>
  );
}
