
import { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/admin/dashboard/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    ChevronDown,
    MoreHorizontal,
    ArrowUpDown,
    Search,
    Filter,
    Download,
    Plus,
    Phone,
    Mail,
    Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// --- Types ---
export type Lead = {
    id: string;
    customerName: string;
    contact: string;
    email: string;
    status: 'New' | 'Contacted' | 'Proposal Sent' | 'Follow Up' | 'Converted' | 'Lost';
    source: 'Website' | 'WhatsApp' | 'Referral' | 'Manual';
    pax: number;
    budget: number;
    travelDate: Date;
    assignedTo: string;
    lastAction: string;
};

// --- Mock Data ---
const MOCK_LEADS: Lead[] = [
    {
        id: "L-1001",
        customerName: "Rahul Sharma",
        contact: "+91 98765 43210",
        email: "rahul.s@example.com",
        status: "New",
        source: "Website",
        pax: 4,
        budget: 45000,
        travelDate: new Date("2024-05-15"),
        assignedTo: "Amit",
        lastAction: "Just joined",
    },
    {
        id: "L-1002",
        customerName: "Priya Patel",
        contact: "+91 99887 76655",
        email: "priya.p@example.com",
        status: "Contacted",
        source: "WhatsApp",
        pax: 2,
        budget: 28000,
        travelDate: new Date("2024-05-20"),
        assignedTo: "Sneha",
        lastAction: "Call scheduled",
    },
    {
        id: "L-1003",
        customerName: "Vikram Singh",
        contact: "+91 88776 65544",
        email: "vikram.s@example.com",
        status: "Proposal Sent",
        source: "Referral",
        pax: 6,
        budget: 85000,
        travelDate: new Date("2024-06-01"),
        assignedTo: "Amit",
        lastAction: "Quote #Q-204 sent",
    },
    {
        id: "L-1004",
        customerName: "Anjali Gupta",
        contact: "+91 77665 54433",
        email: "anjali.g@example.com",
        status: "Converted",
        source: "Website",
        pax: 3,
        budget: 32000,
        travelDate: new Date("2024-05-18"),
        assignedTo: "Sneha",
        lastAction: "Booking #BK-902",
    },
    {
        id: "L-1005",
        customerName: "Rohan Mehta",
        contact: "+91 66554 43322",
        email: "rohan.m@example.com",
        status: "Follow Up",
        source: "Manual",
        pax: 12,
        budget: 150000,
        travelDate: new Date("2024-06-10"),
        assignedTo: "Amit",
        lastAction: "Needs custom itinerary",
    },
];

export function LeadMasterTable() {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const columns: ColumnDef<Lead>[] = [
        {
            accessorKey: "customerName",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="text-slate-400 hover:text-white pl-0"
                    >
                        Customer
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="font-medium text-white">{row.getValue("customerName")}</div>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                let colorClass = "bg-slate-500/10 text-slate-400 border-slate-500/20"; // Default

                if (status === "New") colorClass = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                if (status === "Contacted") colorClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                if (status === "Proposal Sent") colorClass = "bg-purple-500/10 text-purple-400 border-purple-500/20";
                if (status === "Converted") colorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                if (status === "Lost") colorClass = "bg-rose-500/10 text-rose-400 border-rose-500/20";

                return (
                    <Badge variant="outline" className={cn("border", colorClass)}>
                        {status}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "contact",
            header: "Contact",
            cell: ({ row }) => (
                <div className="flex flex-col text-xs">
                    <span className="text-slate-300 flex items-center gap-1"><Phone className="w-3 h-3" /> {row.original.contact}</span>
                    <span className="text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {row.original.email}</span>
                </div>
            ),
        },
        {
            accessorKey: "travelDate",
            header: "Travel Date",
            cell: ({ row }) => <div className="text-slate-300 text-sm">{format(row.getValue("travelDate"), "dd MMM yyyy")}</div>,
        },
        {
            accessorKey: "pax",
            header: "Pax",
            cell: ({ row }) => <div className="text-slate-300 text-sm">{row.getValue("pax")}<span className="text-slate-500 text-xs ml-1">PPL</span></div>,
        },
        {
            accessorKey: "budget",
            header: "Budget",
            cell: ({ row }) => {
                return <div className="text-emerald-400 font-medium">₹{row.getValue<number>("budget").toLocaleString()}</div>
            },
        },
        {
            accessorKey: "assignedTo",
            header: "Assignee",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-slate-700 text-xs text-white">{row.original.assignedTo[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-slate-300 text-sm hidden md:inline-block">{row.original.assignedTo}</span>
                </div>
            )
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const lead = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">
                                Log Activity
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-800" />
                            <DropdownMenuItem className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer text-emerald-400">
                                Create Booking
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ];

    const table = useReactTable({
        data: MOCK_LEADS,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div className="w-full space-y-4">
            {/* TOOLBAR */}
            <GlassCard className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search leads..."
                        value={(table.getColumn("customerName")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("customerName")?.setFilterValue(event.target.value)
                        }
                        className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:ring-blue-500/50"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button variant="outline" className="ml-auto bg-transparent border-white/10 text-slate-300 hover:bg-white/5 hover:text-white">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="bg-transparent border-white/10 text-slate-300 hover:bg-white/5 hover:text-white">
                                Columns <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize hover:bg-slate-800 focus:bg-slate-800 cursor-pointer"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                        <Plus className="mr-2 h-4 w-4" /> Add Lead
                    </Button>
                </div>
            </GlassCard>

            {/* TABLE */}
            <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20 backdrop-blur-sm">
                <Table>
                    <TableHeader className="bg-white/5">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-white/5 hover:bg-transparent">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="text-slate-400">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="border-white/5 hover:bg-white/5 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-slate-500"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-slate-500">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="bg-transparent border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="bg-transparent border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
