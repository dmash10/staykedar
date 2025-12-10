import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ==========================================
// TYPES
// ==========================================
export interface Column<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    render?: (row: T) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
}

interface DataGridProps<T> {
    data: T[];
    columns: Column<T>[];
    pageSize?: number;
    selectable?: boolean;
    onRowClick?: (row: T) => void;
    actions?: (row: T) => React.ReactNode;
    searchable?: boolean;
    searchKeys?: (keyof T)[];
    onExport?: () => void;
    title?: string;
    icon?: React.ReactNode;
}

// ==========================================
// COMPONENT
// ==========================================
export function DataGrid<T extends { id: string | number }>({
    data,
    columns,
    pageSize = 10,
    selectable = false,
    onRowClick,
    actions,
    searchable = true,
    searchKeys,
    onExport,
    title,
    icon
}: DataGridProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

    // Default Export Handler (CSV)
    const handleExport = () => {
        if (onExport) {
            onExport();
            return;
        }
        // Generic CSV Export
        if (!data.length) return;
        const headers = columns.map(c => c.label).join(',');
        const rows = data.map(row => columns.map(c => {
            // @ts-ignore
            const val = row[c.key];
            return typeof val === 'string' ? `"${val}"` : val;
        }).join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${title || 'data'}_export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Sorting Logic
    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Filter & Sort Data
    const filteredData = React.useMemo(() => {
        let processed = [...data];

        // Search
        if (searchTerm && searchKeys) {
            const lowerSearch = searchTerm.toLowerCase();
            processed = processed.filter(row =>
                searchKeys.some(key => String(row[key]).toLowerCase().includes(lowerSearch))
            );
        }

        // Sort
        if (sortConfig) {
            processed.sort((a, b) => {
                // @ts-ignore - dynamic key access
                const valA = a[sortConfig.key];
                // @ts-ignore - dynamic key access
                const valB = b[sortConfig.key];

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return processed;
    }, [data, searchTerm, sortConfig, searchKeys]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Selection Logic
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRows(new Set(paginatedData.map(r => r.id)));
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleSelectRow = (id: string | number, checked: boolean) => {
        const newSelected = new Set(selectedRows);
        if (checked) newSelected.add(id);
        else newSelected.delete(id);
        setSelectedRows(newSelected);
    };

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <div className="w-full space-y-4">
            {/* HEADER BAR (Search & Title) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/40 border border-white/10 p-4 rounded-xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                    {icon && <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">{icon}</div>}
                    {title && <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {searchable && (
                        <div className="relative w-full sm:w-[250px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                                placeholder="Search data..."
                                className="pl-9 bg-black/20 border-white/10 text-slate-200 focus:bg-black/40 transition-all h-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 h-9 gap-2"
                            onClick={handleExport}
                        >
                            <ArrowUp className="w-3.5 h-3.5 rotate-45" /> Export
                        </Button>
                        {/* 
                        <Button variant="outline" size="sm" className="bg-white/5 border-white/10 h-9 gap-2 text-slate-300 hover:text-white hover:bg-white/10">
                            <Filter className="w-3.5 h-3.5" /> Filter
                        </Button> 
                        */}
                    </div>
                </div>
            </div>

            {/* DATA TABLE */}
            <div className="rounded-xl border border-white/10 overflow-hidden bg-black/30 backdrop-blur-sm shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        {/* TABLE HEADER */}
                        <thead className="text-xs font-semibold uppercase bg-white/5 text-slate-400 border-b border-white/10">
                            <tr>
                                {selectable && (
                                    <th className="p-4 w-4">
                                        <Checkbox
                                            checked={paginatedData.length > 0 && selectedRows.size === paginatedData.length}
                                            onCheckedChange={handleSelectAll}
                                            className="border-slate-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                        />
                                    </th>
                                )}
                                {columns.map((col, idx) => (
                                    <th
                                        key={idx}
                                        className={cn(
                                            "p-4 whitespace-nowrap transition-colors",
                                            col.sortable ? "cursor-pointer hover:text-blue-400 hover:bg-white/5 select-none" : ""
                                        )}
                                        onClick={() => col.sortable && handleSort(col.key as string)}
                                        style={{ width: col.width, textAlign: col.align || 'left' }}
                                    >
                                        <div className={cn("flex items-center gap-2", col.align === 'center' && "justify-center", col.align === 'right' && "justify-end")}>
                                            {col.label}
                                            {col.sortable && sortConfig?.key === col.key && (
                                                sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-500" /> : <ArrowDown className="w-3 h-3 text-blue-500" />
                                            )}
                                            {col.sortable && sortConfig?.key !== col.key && (
                                                <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                                            )}
                                        </div>
                                    </th>
                                ))}
                                {actions && <th className="p-4 text-right">Actions</th>}
                            </tr>
                        </thead>

                        {/* TABLE BODY */}
                        <tbody className="divide-y divide-white/5">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((row) => (
                                    <tr
                                        key={row.id}
                                        className={cn(
                                            "group hover:bg-white/[0.02] transition-colors",
                                            selectedRows.has(row.id) && "bg-blue-500/[0.03]"
                                        )}
                                        onClick={() => onRowClick?.(row)}
                                    >
                                        {selectable && (
                                            <td className="p-4">
                                                <Checkbox
                                                    checked={selectedRows.has(row.id)}
                                                    onCheckedChange={(c) => handleSelectRow(row.id, c as boolean)}
                                                    onClick={(e) => e.stopPropagation()} // Prevent row click
                                                    className="border-slate-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                                />
                                            </td>
                                        )}
                                        {columns.map((col, idx) => (
                                            <td
                                                key={idx}
                                                className={cn(
                                                    "p-4 text-slate-300 font-medium",
                                                    onRowClick && "cursor-pointer"
                                                )}
                                                style={{ textAlign: col.align || 'left' }}
                                            >
                                                {col.render ? col.render(row) : (row[col.key as keyof T] as React.ReactNode)}
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="p-4 text-right">
                                                <div onClick={(e) => e.stopPropagation()}>{actions(row)}</div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="p-8 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="w-8 h-8 opacity-20" />
                                            <p>No results found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER PAGINATION */}
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border-t border-white/5">
                    <div className="text-xs text-slate-500">
                        Showing <span className="text-white font-mono">{((currentPage - 1) * pageSize) + 1}</span> to <span className="text-white font-mono">{Math.min(currentPage * pageSize, filteredData.length)}</span> of <span className="text-white font-mono">{filteredData.length}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent border-white/10 text-slate-400 hover:text-white disabled:opacity-30"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <div className="px-3 py-1 bg-white/5 rounded text-xs text-slate-300 font-mono border border-white/5">
                            Page {currentPage} / {totalPages || 1}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent border-white/10 text-slate-400 hover:text-white disabled:opacity-30"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// NEO STATUS BADGE (Helper)
// ==========================================

export const NeonStatusBadge = ({ status, type = 'neutral', pulse = false }: { status: string, type?: 'success' | 'warning' | 'error' | 'info' | 'neutral', pulse?: boolean }) => {
    const styles = {
        success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_-4px_rgba(16,185,129,0.3)]",
        warning: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_-4px_rgba(245,158,11,0.3)]",
        error: "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_-4px_rgba(244,63,94,0.3)]",
        info: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_-4px_rgba(59,130,246,0.3)]",
        neutral: "bg-slate-500/10 text-slate-400 border-slate-500/20"
    };

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border tracking-wide uppercase",
            styles[type]
        )}>
            {pulse && <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse",
                type === 'success' ? 'bg-emerald-500' :
                    type === 'warning' ? 'bg-amber-500' :
                        type === 'error' ? 'bg-rose-500' :
                            type === 'info' ? 'bg-blue-500' : 'bg-slate-400'
            )} />}
            {status}
        </span>
    );
};
