import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/cn';

function resolveRowKey(row, index, rowKey) {
  if (typeof rowKey === 'function') {
    return rowKey(row, index);
  }

  if (typeof rowKey === 'string' && row?.[rowKey] !== undefined) {
    return row[rowKey];
  }

  return index;
}

export default function Table({
  columns = [],
  data = [],
  rowKey = 'id',
  isLoading = false,
  emptyTitle,
  emptyDescription,
  className,
  rowClassName,
  headClassName,
  bodyClassName,
  onRowClick
}) {
  if (!isLoading && data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} className={className} />;
  }

  return (
    <div className={cn('overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-soft', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className={cn('bg-slate-100/80', headClassName)}>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key ?? `${column.header}-${index}`}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
                    column.headerClassName
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className={cn('divide-y divide-slate-100 bg-white', bodyClassName)}>
            {isLoading ? (
              <tr>
                <td colSpan={Math.max(columns.length, 1)} className="px-4 py-10 text-center">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={resolveRowKey(row, rowIndex, rowKey)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'transition hover:bg-brand-50/70',
                    onRowClick ? 'cursor-pointer' : null,
                    rowClassName
                  )}
                >
                  {columns.map((column, colIndex) => {
                    const value = column.key ? row?.[column.key] : undefined;
                    const content = column.render ? column.render(value, row, rowIndex) : value;

                    return (
                      <td
                        key={`${column.key ?? column.header ?? colIndex}-${rowIndex}`}
                        className={cn('px-4 py-3 text-sm text-slate-700', column.cellClassName)}
                      >
                        {content ?? '-'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
