"use client"

import { useState } from "react"
import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconArrowUp,
    IconArrowDown,
} from "@tabler/icons-react"
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
} from "@tanstack/react-table"
import { CldUploadButton } from "next-cloudinary"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"

interface Report {
    id: string
    keyword: string
    category: string
    description: string
    latitude: number
    longitude: number
    severity: "low" | "medium" | "high"
    createdAt: string
    imageUrl?: string | null
    speechStressData?: {
        wordsPerSecond: number
        repeatedWords: number
        pauseCount: number
        averagePauseDuration: number
        confidence: number
        stressIndicators: string
    } | null
}

const columns: ColumnDef<Report>[] = [
    {
        accessorKey: "id",
        header: "Report ID",
        cell: ({ row }) => <span className="font-mono text-xs text-indigo-600">{row.getValue("id")}</span>,
    },
    {
        accessorKey: "imageUrl",
        header: "Image",
        cell: ({ row }) => {
            const report = row.original
            const [imageUrl, setImageUrl] = useState(report.imageUrl)

            const handleUpload = async (result: any) => {
                if (result.event === "success") {
                    const newUrl = result.info.secure_url
                    try {
                        const res = await fetch(`/api/reports/${report.id}/image`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ imageUrl: newUrl }),
                        })
                        if (!res.ok) throw new Error("Failed to update image")
                        setImageUrl(newUrl)
                        toast.success("Image uploaded successfully")
                    } catch (err) {
                        console.error(err)
                        toast.error("Failed to save image")
                    }
                }
            }

            if (imageUrl) {
                return (
                    <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="block w-16 h-12 relative overflow-hidden rounded bg-zinc-100 border border-zinc-200 hover:opacity-80 transition-opacity">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl} alt="Report" className="w-full h-full object-cover" />
                    </a>
                )
            }

            return (
                <CldUploadButton
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "unsigned_preset"}
                    onSuccess={handleUpload}
                    className="px-3 py-1.5 text-xs font-medium bg-zinc-100 text-zinc-900 rounded border border-zinc-200 hover:bg-zinc-200 transition-colors"
                >
                    Upload
                </CldUploadButton>
            )
        },
    },
    {
        accessorKey: "keyword",
        header: "Keyword",
        cell: ({ row }) => <span className="font-medium text-zinc-900">{row.getValue("keyword")}</span>,
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
            const category = row.getValue("category") as string
            const categoryColors: Record<string, string> = {
                Fire: "text-orange-600",
                Medical: "text-blue-600",
                Crime: "text-red-600",
                Accident: "text-yellow-600",
            }
            return <span className={`font-medium ${categoryColors[category] || "text-zinc-700"}`}>{category}</span>
        },
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
            <span className="text-sm text-zinc-500 max-w-xs truncate">{row.getValue("description")}</span>
        ),
    },
    {
        accessorKey: "latitude",
        header: "Latitude",
        cell: ({ row }) => (
            <span className="text-xs font-mono text-zinc-400">{(row.getValue("latitude") as number).toFixed(4)}</span>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Time",
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt") as string)
            return <span className="text-xs text-zinc-500">{date.toLocaleTimeString()}</span>
        },
    },
    {
        accessorKey: "severity",
        header: "Severity",
        cell: ({ row }) => {
            const severity = row.getValue("severity") as string
            const severityClass = {
                high: "px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100",
                medium:
                    "px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-600 border border-yellow-100",
                low: "px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600 border border-green-100",
            }[severity]

            return <div className={severityClass}>{severity.charAt(0).toUpperCase() + severity.slice(1)}</div>
        },
    },
    {
        accessorKey: "speechStressData",
        header: "Stress",
        cell: ({ row }) => {
            const stressData = row.getValue("speechStressData") as Report["speechStressData"]
            if (!stressData) {
                return <span className="text-xs text-zinc-400">N/A</span>
            }
            const confidence = stressData.confidence || 0
            const confidenceClass = confidence >= 60
                ? "px-2 py-1 rounded text-xs font-semibold bg-red-50 text-red-600 border border-red-100"
                : confidence >= 40
                    ? "px-2 py-1 rounded text-xs font-semibold bg-yellow-50 text-yellow-600 border border-yellow-100"
                    : "px-2 py-1 rounded text-xs font-semibold bg-green-50 text-green-600 border border-green-100"

            return <div className={confidenceClass}>{confidence}%</div>
        },
    },
]

interface AdminVoiceReportsTableProps {
    data: Report[]
    onRowClick?: (report: Report) => void
}

export function AdminVoiceReportsTable({ data, onRowClick }: AdminVoiceReportsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }])
    const [categoryFilter, setCategoryFilter] = useState<string>("all")

    const filteredData = categoryFilter !== "all" ? data.filter((row) => row.category === categoryFilter) : data

    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            sorting,
            columnVisibility: {
                category: false,
            },
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <div className="space-y-4 w-full">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">

                </div>
                <div className="text-xs text-zinc-500">
                    Showing {table.getRowModel().rows.length} of {data.length} reports
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 overflow-hidden bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-zinc-100 hover:bg-zinc-50/50 bg-zinc-50">
                            {table.getHeaderGroups().map((headerGroup) =>
                                headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] p-3">
                                        <div className="flex items-center gap-2">
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getCanSort() && (
                                                <button
                                                    onClick={() => header.column.toggleSorting()}
                                                    className="text-zinc-400 hover:text-zinc-600"
                                                >
                                                    {header.column.getIsSorted() ? (
                                                        header.column.getIsSorted() === "desc" ? (
                                                            <IconArrowDown className="w-3 h-3" />
                                                        ) : (
                                                            <IconArrowUp className="w-3 h-3" />
                                                        )
                                                    ) : (
                                                        "↕"
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </TableHead>
                                )),
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors"

                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3 pl-3 text-sm">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-zinc-500">
                                    No reports found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between gap-4 px-2">
                <div className="text-sm text-zinc-500">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8 bg-white border-zinc-200 hover:bg-zinc-100"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <IconChevronsLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8 bg-white border-zinc-200 hover:bg-zinc-100"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <IconChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8 bg-white border-zinc-200 hover:bg-zinc-100"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <IconChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8 bg-white border-zinc-200 hover:bg-zinc-100"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <IconChevronsRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
