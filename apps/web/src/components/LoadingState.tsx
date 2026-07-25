export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center text-sm text-gray-500">
      {label}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center text-sm text-danger px-6 text-center">
      {message}
    </div>
  );
}
