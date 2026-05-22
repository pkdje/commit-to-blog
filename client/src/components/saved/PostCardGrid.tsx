import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

function PostCardGrid({ children }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}

export default PostCardGrid;
