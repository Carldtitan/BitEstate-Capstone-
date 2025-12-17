export function CardSkeleton() {
  return (
    <div className="card skeleton">
      <div className="skeleton-image"></div>
      <div className="card-body">
        <div className="skeleton-text skeleton-title"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text skeleton-short"></div>
      </div>
    </div>
  );
}

export function ListingSkeleton({ count = 4 }) {
  return (
    <div className="grid">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i}>
          <div className="skeleton-text"></div>
        </td>
      ))}
    </tr>
  );
}
