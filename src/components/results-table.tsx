"use client";

import * as React from "react";
import type { Result, User } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Table as ShadcnTable,
  type ColumnDef,
  type PaginationState,
} from "unstyled-table";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ColumnSort {
  id: string;
  desc: boolean;
}

type SortingState = ColumnSort[]

type ResultWithUser = Result & { user: User };

interface ResultsTableProps {
  data: ResultWithUser[];
  pageCount: number;
}

export function ResultsTable({ data, pageCount }: ResultsTableProps) {
  const [isPending, startTransition] = React.useTransition();

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const columns = React.useMemo<ColumnDef<Result, unknown>[]>(
    () => [
      {
        accessorKey: "user",
        header: "User",
        cell: ({ cell }) => {
          const user = cell.getValue() as User;

          return (
            <Link href={`${user.id}`}>
              <div className="flex items-center gap-2">
                <Image
                  className="rounded-full"
                  src={user.image ?? ""}
                  alt="user avatar"
                  height={30}
                  width={30}
                />
                <span>{user.name}</span>
              </div>
            </Link>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "takenTime",
        header: "Taken time",
      },
    ],
    []
  );

  const page = searchParams.get("page") ?? "1";
  const per_page = searchParams.get("per_page") ?? "5";
  const sort = searchParams?.get("sort");
  const [column, order] = sort?.split(".") ?? [];

  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: column ?? "takenTime",
      desc: order === "desc",
    },
  ]);

  React.useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        page,
        sort: sorting[0]?.id
          ? `${sorting[0]?.id}.${sorting[0]?.desc ? "desc" : "asc"}`
          : null,
      })}`
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting]);

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: Number(page) - 1,
    pageSize: Number(per_page),
  });

  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }

      return newSearchParams.toString();
    },
    [searchParams]
  );

  return (
    <ShadcnTable
      columns={columns}
      data={data ?? []}
      // Rows per page
      pageCount={pageCount ?? 0}
      state={{ sorting, pagination }}
      manualPagination
      manualSorting
      setSorting={setSorting}
      setPagination={setPagination}
      renders={{
        table: ({ children, tableInstance }) => {
          return (
            <div className="rounded-md border mt-8 mb-4">
              <Table>{children}</Table>
            </div>
          );
        },
        header: ({ children }) => <TableHeader>{children}</TableHeader>,
        headerRow: ({ children }) => <TableRow>{children}</TableRow>,
        headerCell: ({ children }) => (
          <TableHead className="whitespace-nowrap">{children}</TableHead>
        ),
        body: ({ children }) => (
          <TableBody>
            {data.length ? (
              children
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        ),
        bodyRow: ({ children }) => <TableRow>{children}</TableRow>,
        bodyCell: ({ children }) => (
          <TableCell>
            {isPending ? <Skeleton className="h-6 w-20" /> : children}
          </TableCell>
        ),
        filterInput: ({}) => null,
        paginationBar: ({ tableInstance }) => {
          return (
            <div className="flex justify-center flex-col-reverse items-center gap-4 py-2 md:flex-row">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
                <div className="flex flex-wrap items-center space-x-2">
                  <span className="text-sm font-medium">Rows per page</span>
                  <Select
                    value={per_page ?? "10"}
                    onValueChange={(value) => {
                      console.log(sort);
                      startTransition(() => {
                        router.push(
                          `${pathname}?${createQueryString({
                            page: 1,
                            per_page: value,
                            sort,
                          })}`
                        );
                      });
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger className="h-8 w-16">
                      <SelectValue placeholder={per_page} />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 15, 20].map((item) => (
                        <SelectItem key={item} value={item.toString()}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm font-medium">
                  {`Page ${page} of ${pageCount}`}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      startTransition(() => {
                        console.log(sort);
                        router.push(
                          `${pathname}?${createQueryString({
                            page: 1,
                            per_page,
                            sort,
                          })}`
                        );
                      });
                    }}
                    disabled={Number(page) === 1 || isPending}
                  >
                    <Icons.chevronsLeft
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                    <span className="sr-only">First page</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      startTransition(() => {
                        router.push(
                          `${pathname}?${createQueryString({
                            page: Number(page) - 1,
                            per_page,
                            sort,
                          })}`
                        );
                      });
                    }}
                    disabled={Number(page) === 1 || isPending}
                  >
                    <Icons.chevronLeft className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">Previous page</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      startTransition(() => {
                        router.push(
                          `${pathname}?${createQueryString({
                            page: Number(page) + 1,
                            per_page,
                            sort,
                          })}`
                        );
                      });
                    }}
                    disabled={Number(page) >= (pageCount ?? 1) || isPending}
                  >
                    <Icons.chevronRight
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                    <span className="sr-only">Next page</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      router.push(
                        `${pathname}?${createQueryString({
                          page: pageCount ?? 1,
                          per_page,
                          sort,
                        })}`
                      );
                    }}
                    disabled={Number(page) >= (pageCount ?? 1) || isPending}
                  >
                    <Icons.chevronsRight
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                    <span className="sr-only">Last page</span>
                  </Button>
                </div>
              </div>
            </div>
          );
        },
      }}
    />
  );
}
