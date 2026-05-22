function PostCardSkeleton() {
  return (
    <article
      aria-busy="true"
      aria-label="loading post"
      className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white"
    >
      <div className="px-5 pt-5">
        <div className="flex items-center justify-between">
          <div className="h-5 w-16 rounded bg-gray-200" />
          <div className="h-3 w-20 rounded bg-gray-100" />
        </div>
        <div className="mt-3 h-5 w-3/4 rounded bg-gray-200" />
      </div>

      <div className="mt-4 aspect-video bg-gray-100" />

      <div className="px-5 pb-5 pt-4">
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-gray-100" />
          <div className="h-3 w-5/6 rounded bg-gray-100" />
          <div className="h-3 w-2/3 rounded bg-gray-100" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="h-9 rounded-md bg-gray-200" />
          <div className="h-9 rounded-md bg-gray-200" />
        </div>
      </div>
    </article>
  );
}

export default PostCardSkeleton;
