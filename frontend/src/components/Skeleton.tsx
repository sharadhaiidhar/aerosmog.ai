// components/Skeleton.tsx
export function Skeleton({ style = {} }: { style?: React.CSSProperties }) {
  return <span className="skeleton" style={{ display: 'block', height: 20, ...style }} />;
}

export function CardSkeleton() {
  return (
    <div className="card space-y-sm">
      <Skeleton style={{ width: '35%', height: 16 }} />
      <Skeleton style={{ width: '55%', height: 40 }} />
      <Skeleton style={{ width: '100%', height: 14 }} />
      <Skeleton style={{ width: '75%', height: 14 }} />
    </div>
  );
}
