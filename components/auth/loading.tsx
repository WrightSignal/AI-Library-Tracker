export function AuthLoading() {
  return (
    <div className="min-h-screen bg-warm-gray flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poppy-red mx-auto mb-4"></div>
        <p className="text-stone-gray">Authenticating...</p>
      </div>
    </div>
  );
} 