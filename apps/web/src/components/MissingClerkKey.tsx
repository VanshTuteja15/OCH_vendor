export function MissingClerkKey() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md text-center">
        <div className="font-display text-xl font-bold text-och-blue mb-2">Clerk not configured</div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Add{' '}
          <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
            VITE_CLERK_PUBLISHABLE_KEY
          </code>{' '}
          to{' '}
          <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
            apps/web/.env
          </code>
          , then restart the web dev server.
        </p>
      </div>
    </div>
  );
}
