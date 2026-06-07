"use client";

/**
 * DataTableFacetedFilter — combobox filter, two explicit modes
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  CLIENT MODE  (default — no `mode` prop needed)                         │
 * │  Uses TanStack's getFacetedUniqueValues() to build options from the     │
 * │  data already in memory. Works with client-side tables. Shows counts.   │
 * │                                                                         │
 * │  Usage:                                                                 │
 * │    <DataTableFacetedFilter                                              │
 * │      title="Status"                                                     │
 * │      column={table.getColumn("status")}                                 │
 * │    />                                                                   │
 * │                                                                         │
 * │  SERVER MODE  (pass mode="server")                                      │
 * │  Two sub-modes:                                                         │
 * │    • Static  → pass `options` array. cmdk filters locally.              │
 * │                Best for fixed enums (status, type…) even with 40 items. │
 * │    • Dynamic → pass `fetchOptions` async fn. Called on open + debounced │
 * │                query. Sends the selected value into columnFilters so    │
 * │                filtersToParams can forward it to the server as a WHERE  │
 * │                clause. Autocomplete is just for picking — filtering is  │
 * │                always server-side.                                      │
 * │                                                                         │
 * │  Usage (server static):                                                 │
 * │    <DataTableFacetedFilter                                              │
 * │      mode="server"                                                      │
 * │      title="Case Status"                                                │
 * │      column={table.getColumn("CaseStatus")}                             │
 * │      options={CASE_STATUS_OPTIONS}                                      │
 * │    />                                                                   │
 * │                                                                         │
 * │  Usage (server dynamic / high-cardinality):                             │
 * │    <DataTableFacetedFilter                                              │
 * │      mode="server"                                                      │
 * │      title="Serial No"                                                  │
 * │      column={table.getColumn("SerialNumber")}                           │
 * │      fetchOptions={(q) =>                                               │
 * │        ApiCustomer.get("/api/case-information", {                       │
 * │          params: { mode: "distinct", field: "SerialNumber", q }         │
 * │        }).then(r => (r.data.values ?? []).map(v => ({                   │
 * │          label: v, value: v                                             │
 * │        })))                                                             │
 * │      }                                                                  │
 * │    />                                                                   │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 */

import * as React from "react";
import { cn }     from "@/lib/utils";
import { Badge }  from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator }    from "@/components/ui/separator";
import { CheckIcon, ChevronDown, Loader2, X } from "lucide-react";

function useDebounced(value, delay = 300) {
  const [dv, setDv] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

export function DataTableFacetedFilter({
  column,
  title,
  // Mode: "client" (default) | "server"
  // "client" uses TanStack getFacetedUniqueValues — works out of the box for
  // client-side tables. "server" uses static options or fetchOptions for
  // server-paginated/virtual tables where TanStack has no local data to facet.
  mode = "client",
  // SERVER mode — static list (e.g. known enums)
  options: staticOptions,
  // SERVER mode — async autocomplete for high-cardinality fields
  fetchOptions,
  placeholder,
  portal,
}) {
  const isClientMode  = mode === "client";
  const isServerMode  = mode === "server";
  const isStaticServer  = isServerMode && Array.isArray(staticOptions);
  const isDynamicServer = isServerMode && !!fetchOptions;

  const [open, setOpen]       = React.useState(false);
  const [query, setQuery]     = React.useState("");
  const [dynOpts, setDynOpts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const debouncedQuery        = useDebounced(query, 300);

  // ── Active filter value ───────────────────────────────────────────────────
  const filterValue = column?.getFilterValue();
  const activeValue = React.useMemo(() => {
    if (!filterValue) return "";
    // Server mode stores [string], client mode stores string or Set
    if (Array.isArray(filterValue)) return filterValue[0] ?? "";
    if (filterValue instanceof Set)  return "";           // multi — not used here
    return String(filterValue);
  }, [filterValue]);

  // ── CLIENT MODE: build options from TanStack faceted unique values ─────────
  // getFacetedUniqueValues() returns a Map<value, count> from in-memory data.
  // This is the standard TanStack Table pattern for client-side filtering.
  const facetedMap   = isClientMode ? column?.getFacetedUniqueValues?.() : null;
  const clientOptions = React.useMemo(() => {
    if (!isClientMode || !facetedMap) return [];
    return Array.from(facetedMap.keys())
      .filter((v) => v != null && v !== "")
      .sort()
      .map((v) => ({ label: String(v), value: String(v), count: facetedMap.get(v) }));
  }, [isClientMode, facetedMap]);

  // ── SERVER DYNAMIC: fetch autocomplete options from API ───────────────────
  // This ONLY populates the picker list. The actual filtering happens server-
  // side via the value written into columnFilters → filtersToParams → WHERE.
  React.useEffect(() => {
    if (!isDynamicServer || !open) return;
    let live = true;
    setLoading(true);
    fetchOptions(debouncedQuery)
      .then((r) => { if (live) { setDynOpts(r ?? []); setLoading(false); } })
      .catch(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [isDynamicServer, open, debouncedQuery, fetchOptions]);

  // Reset query when popover closes
  React.useEffect(() => { if (!open) setQuery(""); }, [open]);

  // ── Merged options for rendering ──────────────────────────────────────────
  const options = isClientMode
    ? clientOptions
    : isStaticServer
      ? staticOptions
      : dynOpts;

  const selectedLabel = activeValue
    ? (options.find((o) => o.value === activeValue)?.label ?? activeValue)
    : null;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelect = React.useCallback((value) => {
    // Toggle off if already selected; otherwise set as single selection
    column?.setFilterValue(activeValue === value ? undefined : [value]);
    setOpen(false);
  }, [column, activeValue]);

  const handleClear = React.useCallback((e) => {
    e?.stopPropagation();
    column?.setFilterValue(undefined);
  }, [column]);

  // ── Determine whether cmdk should filter locally ──────────────────────────
  // Client mode: yes — cmdk filters by the input query against option labels.
  // Server static: yes — all options are in memory, local filtering is instant.
  // Server dynamic: NO — the server already returns pre-filtered results.
  const shouldFilter = isClientMode || isStaticServer;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-dashed gap-1 text-xs font-normal max-w-[220px]"
        >
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
          <span className={cn("truncate", !selectedLabel && "text-muted-foreground")}>{title}</span>

          {selectedLabel && (
            <>
              <Separator orientation="vertical" className="mx-0.5 h-4 shrink-0" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1.5 font-medium max-w-[100px] truncate text-xs shrink-0"
              >
                {selectedLabel}
              </Badge>
              <span
                role="button"
                aria-label="Clear filter"
                onClick={handleClear}
                className="ml-0.5 shrink-0 flex items-center justify-center w-4 h-4 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[250px] p-0" align="start" usePortal={portal}>
        <Command shouldFilter={shouldFilter}>
          <div className="relative">
            <CommandInput
              placeholder={placeholder ?? `Search ${title}…`}
              value={query}
              onValueChange={setQuery}
              className="text-xs"
            />
            {loading && (
              <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground pointer-events-none" />
            )}
          </div>

          <CommandList>
            {loading && options.length === 0 ? (
              <div className="py-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Searching…
              </div>
            ) : (
              <>
                <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
                  {query ? "No matches." : "No options."}
                </CommandEmpty>

                <CommandGroup>
                  {options.map((opt) => {
                    const isSel = activeValue === opt.value;
                    return (
                      <CommandItem
                        key={opt.value}
                        value={opt.value}
                        onSelect={() => handleSelect(opt.value)}
                        className="cursor-pointer text-xs gap-2"
                      >
                        {/* Single-select dot indicator */}
                        <div className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-primary transition-colors",
                          isSel
                            ? "bg-primary text-primary-foreground"
                            : "opacity-30 [&_svg]:invisible",
                        )}>
                          <CheckIcon className="h-2.5 w-2.5" />
                        </div>

                        {opt.icon && <opt.icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}

                        <span className="flex-1 truncate">{opt.label}</span>

                        {/* Count badge — only shown in client mode where counts are accurate */}
                        {isClientMode && opt.count != null && (
                          <span className="ml-auto text-[10px] font-mono text-muted-foreground/60 shrink-0">
                            {opt.count}
                          </span>
                        )}

                        {/* Show raw value in mono if it differs from display label */}
                        {!isClientMode && opt.label !== opt.value && (
                          <span className="text-[10px] font-mono text-muted-foreground/50 shrink-0">
                            {opt.value}
                          </span>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}

            {activeValue && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => { handleClear(); setOpen(false); }}
                    className="justify-center text-xs text-muted-foreground cursor-pointer hover:text-destructive"
                  >
                    Clear filter
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
