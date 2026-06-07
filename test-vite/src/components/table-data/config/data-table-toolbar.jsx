"use client";

/**
 * DataTableToolbar  (improved)
 *
 * CLIENT MODE:
 *   Calls table.setGlobalFilter(value) — TanStack filters in-memory.
 *
 * SERVER MODE:
 *   Calls onGlobalSearchChange(value) — value is debounced HERE, so the hook
 *   receives the final value directly without a second debounce layer.
 *   The original had a 450ms debounce in the toolbar PLUS a 400ms debounce
 *   in useServerPageTable = 850ms total lag before the request fired.
 *   Now: toolbar debounces at 400ms, hook uses the value immediately.
 *
 * RESET FIX:
 *   table.resetColumnFilters() works for both modes because the table's
 *   onColumnFiltersChange is wired to the hook's setColumnFilters.
 *   table.resetSorting() similarly propagates. No special casing needed.
 *   The only mode-specific branch is the global search clear.
 */

import * as React from "react";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, RefreshCw, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

function useDebounced(value, delay = 400) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function DataTableToolbar({
  table,
  searchPlaceholder = "Search…",
  children,
  loading,
  handleRefresh,
  noGlobalSearch = false,
  excelExport,
  total,

  // Server-mode props — spread from DataTable's toolbar render-prop second arg
  isServerMode         = false,
  globalSearch:          controlledSearch,     // controlled value from hook
  onGlobalSearchChange,                        // (value: string) => void
}) {
  const [raw, setRaw] = React.useState(controlledSearch ?? "");
  // Sync when the parent resets the search externally (e.g. full filter reset)
  const prevControlled = React.useRef(controlledSearch);
  React.useEffect(() => {
    if (
      controlledSearch !== undefined &&
      controlledSearch !== prevControlled.current &&
      controlledSearch !== raw
    ) {
      setRaw(controlledSearch ?? "");
    }
    prevControlled.current = controlledSearch;
    // Only sync on parent change, not every raw keystroke
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledSearch]);

  // Single debounce layer (400ms).
  // BUG FIX: the original had a 450ms debounce here AND the hook had a 400ms
  // debounce on globalSearch — 850ms total. Now only one layer.
  const debounced = useDebounced(raw, 400);

  React.useEffect(() => {
    if (isServerMode && onGlobalSearchChange) {
      onGlobalSearchChange(debounced);
    } else {
      table.setGlobalFilter(debounced || undefined);
      // Reset to page 0 only in client mode — server hook handles its own reset
      if (!isServerMode) table.setPageIndex?.(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, isServerMode]);

  const isFiltered =
    !!raw ||
    !!table.getState().globalFilter ||
    (table.getState().columnFilters?.length ?? 0) > 0;
  const filterCount = table.getState().columnFilters?.length ?? 0

  const handleReset = () => {
    setRaw("");
    if (isServerMode && onGlobalSearchChange) {
      onGlobalSearchChange("");
    } else {
      table.resetGlobalFilter();
      table.setPageIndex?.(0);
    }
    // resetColumnFilters and resetSorting work in both modes because
    // onColumnFiltersChange / onSortingChange are wired to the hook's setters.
    table.resetColumnFilters();
    table.resetSorting();
  };

  const totalFoundCase = total || table.getFilteredRowModel().rows.length;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex w-full flex-col gap-1">
          <div className="relative flex flex-wrap gap-2 items-center justify-evenly">
           <p className="text-xs font-mono "> {totalFoundCase} Case Found </p>
          <Separator orientation="vertical" className={"border-2 border-amber-200"}/>
           <p className="text-xs font-mono font-bold"> {filterCount} Filter Applied </p>
          {isFiltered && (
            <Button variant="secondary" size="sm" onClick={handleReset}>
              Reset
            </Button>
          )}
        {!noGlobalSearch && (
            <Input
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder={searchPlaceholder}
              className="text-sm h-8 sm:w-[320px] pr-8"
              variant="outline"
            />
        )}
            {/* {raw && ( */}
            {/*   <button */}
            {/*     type="button" */}
            {/*     onClick={() => setRaw("")} */}
            {/*     className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" */}
            {/*     aria-label="Clear search" */}
            {/*   > */}
            {/*     <X className="h-3.5 w-3.5" /> */}
            {/*   </button> */}
            {/* )} */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Columns <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      className="capitalize"
                      checked={col.getIsVisible()}
                      onCheckedChange={(v) => col.toggleVisibility(!!v)}
                    >
                      {typeof col.columnDef.header === "string"
                        ? col.columnDef.header
                        : col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {handleRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
              Refresh
            </Button>
          )}
          {excelExport}
          </div>

        <div className="flex flex-wrap items-center gap-2">
          {children}


        </div>
      </div>
    </div>
  );
}
