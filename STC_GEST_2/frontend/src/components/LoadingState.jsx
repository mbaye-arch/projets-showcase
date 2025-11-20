function LoadingState({ message = 'Chargement...' }) {
  return (
    <div className="card flex items-center gap-3 text-slate-600">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-accent" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

export default LoadingState;
