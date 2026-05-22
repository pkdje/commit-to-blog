function CommitListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="space-y-3" aria-busy="true" aria-label="loading commits">
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="flex animate-pulse items-center gap-3 rounded-md border border-gray-200 bg-white p-4"
        >
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-3 w-32 rounded bg-gray-100" />
          </div>
          <div className="h-9 w-20 shrink-0 rounded-md bg-gray-200" />
        </li>
      ))}
    </ul>
  );
}

export default CommitListSkeleton;
