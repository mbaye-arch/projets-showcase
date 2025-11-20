import { cn } from '@/lib/cn';

function buildPageItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index);
  }

  const pages = [0];
  const start = Math.max(currentPage - 1, 1);
  const end = Math.min(currentPage + 1, totalPages - 2);

  if (start > 1) {
    pages.push('left-ellipsis');
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < totalPages - 2) {
    pages.push('right-ellipsis');
  }

  pages.push(totalPages - 1);

  return pages;
}

export default function Pagination({
  page = 0,
  totalPages = 0,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
  className
}) {
  if (totalPages <= 0) {
    return null;
  }

  const currentPage = Math.min(Math.max(page, 0), totalPages - 1);
  const pageItems = buildPageItems(currentPage, totalPages);

  const from = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const to = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className={cn('flex flex-col gap-3 md:flex-row md:items-center md:justify-between', className)}>
      <p className="text-sm text-slate-500">
        Affichage de <span className="font-semibold text-slate-700">{from}</span> a{' '}
        <span className="font-semibold text-slate-700">{to}</span> sur{' '}
        <span className="font-semibold text-slate-700">{totalElements}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage === 0}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Precedent
        </button>

        {pageItems.map((item) => {
          if (typeof item !== 'number') {
            return (
              <span key={item} className="px-2 text-slate-400">
                ...
              </span>
            );
          }

          const isActive = item === currentPage;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange?.(item)}
              className={cn(
                'min-w-9 rounded-md border px-3 py-1.5 text-sm transition',
                isActive
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              {item + 1}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
