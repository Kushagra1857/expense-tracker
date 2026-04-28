export default function SkeletonLoader() {
  return (
    <div className="skeleton-list" aria-label="Loading expenses">
      {[1, 2, 3, 4, 5].map((i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton-line skeleton-line--short" />
          <div className="skeleton-line skeleton-line--long" />
          <div className="skeleton-line skeleton-line--medium" />
        </div>
      ))}
    </div>
  );
}
