"use client"

import * as React from "react"
import debounce from "lodash.debounce"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, RefreshCw } from "lucide-react"

export function DataTableToolbar({
  table,
  searchPlaceholder = "Search…",
  children,
  loading,
  handleRefresh,
  onSearchChange,
  searchValue,
  searchDelay = 450,
} ) {
  const [raw, setRaw] = React.useState(searchValue ?? "");

  React.useEffect(() => {
    if (searchValue !== undefined) {
      setRaw(searchValue);
    }
  }, [searchValue]);

  const debouncedSearch = React.useMemo(() => {
    return debounce((value) => {
      if (onSearchChange) {
        onSearchChange(value);
      } else {
        table.setGlobalFilter(value);
      }
      table.setPageIndex(0);
    }, searchDelay);
  }, [onSearchChange, searchDelay, table]);

  React.useEffect(() => {
    debouncedSearch(raw);
    return () => debouncedSearch.cancel();
  }, [debouncedSearch, raw]);

  const isFiltered =
    raw || table.getState().globalFilter || table.getState().columnFilters?.length > 0;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex w-full flex-col gap-2  ">
        <Input
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={searchPlaceholder}
          className="sm:w-[320px]"
          variant={"outline"}
        />
        <div className="flex flex-wrap items-center gap-2">
          {children}

          {isFiltered ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setRaw("");
                debouncedSearch.cancel();
                if (onSearchChange) {
                  onSearchChange("");
                } else {
                  table.resetGlobalFilter();
                }
                table.resetColumnFilters();
                table.resetSorting();
                table.setPageIndex(0);
              }}
            >
              Reset
            </Button>
          ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

    <Button className={'w-fit'} onClick={() => handleRefresh()} disabled={loading}> 
     Refresh <RefreshCw className={ loading && 'animate-spin'} />
    </Button>
        </div>
      </div>
    </div>
  );
}
