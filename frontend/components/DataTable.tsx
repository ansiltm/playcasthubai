import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  renderCell?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  itemsPerPage?: number;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchKeys = [],
  searchPlaceholder = 'Search...',
  itemsPerPage = 10,
  emptyMessage = 'No data found.'
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter Data based on search keys
  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || searchKeys.length === 0) return data;
    const lowerQuery = searchQuery.toLowerCase();
    
    return data.filter((item) => {
      return searchKeys.some((key) => {
        const val = item[key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(lowerQuery);
      });
    });
  }, [data, searchQuery, searchKeys]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Handle Search Change (reset page)
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Toolbar */}
      {searchKeys.length > 0 && (
        <div className="flex justify-end mb-4">
          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder={searchPlaceholder}
              className="bubble-input py-2 pl-10 w-full text-sm"
              value={searchQuery}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-2.5 text-text-muted" size={16} />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-[var(--radius-bubble-sm)] border border-border-main bg-bubble-surface shadow-sm">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-bubble-input">
            <tr className="border-b-2 border-border-main text-text-muted uppercase text-xs">
              {columns.map((col, idx) => (
                <th key={idx} className="py-4 px-6 font-bold">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-main">
            {currentData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-bubble-input/50 transition-colors">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="py-4 px-6 text-sm text-text-main">
                    {col.renderCell 
                      ? col.renderCell(row) 
                      : col.accessorKey 
                        ? String(row[col.accessorKey] ?? '') 
                        : null}
                  </td>
                ))}
              </tr>
            ))}
            {currentData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-text-muted font-bold">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <p className="text-sm text-text-muted">
            Showing <span className="font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-bold">{filteredData.length}</span> results
          </p>
          <div className="flex space-x-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-full border border-border-main bg-bubble-surface text-text-main hover:bg-bubble-input disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full border border-border-main bg-bubble-surface text-text-main hover:bg-bubble-input disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
