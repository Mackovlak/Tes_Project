"use client";

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  DATA TABLE HOOKS  (stable v2 — infinite loop fixed)                    │
 * │                                                                         │
 * │  ROOT CAUSE OF INFINITE FETCH                                           │
 * │  filtersToParams and sortToParams were in the fetch useEffect dep array.│
 * │  Any caller that passes them as inline arrow functions (a new reference  │
 * │  is created on every render) caused:                                    │
 * │    render → new fn ref → effect fires → setData → render → repeat       │
 * │                                                                         │
 * │  FIX                                                                    │
 * │  Assign all callback/object props to refs synchronously each render     │
 * │  (ref.current = value at the top of the hook body, no useEffect needed).│
 * │  Read them via ref inside effects and async functions.                  │
 * │  Callers now work correctly whether they pass stable refs, useCallback, │
 * │  or plain inline arrow functions.                                       │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

import * as React from "react";
import axios from "axios";
import ApiCustomer from "@/api";

// ── Shared utility ──────────────────────────────────────────────────────────

export function useDebouncedValue(value, delay = 300) {
  const [dv, setDv] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. useClientTable
// ─────────────────────────────────────────────────────────────────────────────

export function useClientTable({ fetchFn, deps = [] }) {
  const [data,    setData]    = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error,   setError]   = React.useState(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchFn());
    } catch (e) {
      setError(e.message ?? "Fetch failed");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  React.useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, error, refresh };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. useServerPageTable
// ─────────────────────────────────────────────────────────────────────────────

export function useServerPageTable({
  url,
  mode             = "paginated",
  pageSize: initialPageSize = 20,
  defaultSorting   = [],
  defaultFilters   = [],
  filtersToParams  = (f) => Object.fromEntries(f.map((x) => [x.id, x.value])),
  sortToParams     = (s) => s[0] ? { sortBy: s[0].id, sortDir: s[0].desc ? "desc" : "asc" } : {},
  extraParams      = {},
  globalSearchParam    = "search",
  staleWhileRevalidate = true,
} = {}) {

  const [data,          setData]          = React.useState([]);
  const [total,         setTotal]         = React.useState(0);
  const [loading,       setLoading]       = React.useState(!!url);
  const [error,         setError]         = React.useState(null);
  const [pageIndex,     setPageIndex]     = React.useState(0);
  const [pageSize,      setPageSize]      = React.useState(initialPageSize);
  const [sorting,       setSorting]       = React.useState(defaultSorting);
  const [columnFilters, setColumnFilters] = React.useState(defaultFilters);
  const [globalSearch,  setGlobalSearch]  = React.useState("");
  const [filterVersion, setFilterVersion] = React.useState(0);

  const debouncedFilters = useDebouncedValue(columnFilters, 300);
  const debouncedSorting = useDebouncedValue(sorting, 150);
  const debouncedSearch  = useDebouncedValue(globalSearch, 400);

  // ── Synchronous ref assignment (the core fix) ──────────────────────────────
  // These run on every render BEFORE effects, so any effect that reads
  // .current always sees the latest value without needing them in dep arrays.
  const filtersToParamsRef = React.useRef(filtersToParams);
  filtersToParamsRef.current = filtersToParams;

  const sortToParamsRef = React.useRef(sortToParams);
  sortToParamsRef.current = sortToParams;

  const extraParamsRef = React.useRef(extraParams);
  extraParamsRef.current = extraParams;

  // A stable string that tells us when extraParams *content* changed.
  // Used only in the reset effect, never in the fetch effect.
  const extraParamsKey = JSON.stringify(extraParams);

  // ── Reset page + bump filterVersion ───────────────────────────────────────
  // Bumping filterVersion is the only signal the fetch effect needs.
  // It fires even when pageIndex is already 0 (date range change while on p0).
  const prevResetKey = React.useRef("");
  React.useEffect(() => {
    const key = JSON.stringify({
      f:  debouncedFilters,
      s:  debouncedSorting,
      ps: pageSize,
      q:  debouncedSearch,
      ep: extraParamsKey,
    });
    if (key !== prevResetKey.current) {
      prevResetKey.current = key;
      setPageIndex(0);
      setFilterVersion((v) => v + 1);
    }
  }, [debouncedFilters, debouncedSorting, pageSize, debouncedSearch, extraParamsKey]);

  const pageCount = total > 0 ? Math.ceil(total / pageSize) : 0;

  // ── Fetch effect ───────────────────────────────────────────────────────────
  // Dep array contains ONLY stable primitives and React state values.
  // filtersToParams / sortToParams / extraParams are read via .current —
  // they are intentionally absent from the array.
  React.useEffect(() => {
    if (!url) return;

    const controller = new AbortController();
    if (!staleWhileRevalidate) setData([]);
    setLoading(true);
    setError(null);

    ApiCustomer.get(url, {
      params: {
        mode,
        skip: pageIndex * pageSize,
        take: pageSize,
        ...sortToParamsRef.current(debouncedSorting),
        ...filtersToParamsRef.current(debouncedFilters),
        ...(debouncedSearch ? { [globalSearchParam]: debouncedSearch } : {}),
        ...extraParamsRef.current,
      },
      signal: controller.signal,
    })
      .then(({ data: json }) => {
        const rows  = json.data?.data ?? json.data ?? [];
        const count = json.data?.total ?? json.total ?? 0;
        setData(rows);
        setTotal(count);
        setLoading(false);
      })
      .catch((e) => {
        if (axios.isCancel?.(e) || e.name === "CanceledError") return;
        setError(e.response?.data?.message ?? e.message ?? "Fetch failed");
        setLoading(false);
      })

    return () => controller.abort();
  }, [
    url,
    mode,
    pageIndex,
    pageSize,
    filterVersion,
    debouncedFilters,
    debouncedSorting,
    debouncedSearch,
    globalSearchParam,
    staleWhileRevalidate,
    // filtersToParams, sortToParams, extraParams — NOT here, read via refs
  ]);

  // Stable refresh: bumps filterVersion → fetch effect fires once
  const refresh = React.useCallback(() => setFilterVersion((v) => v + 1), []);
  return {
    data,
    total,
    pageCount,
    loading,
    error,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalSearch,
    setGlobalSearch,
    refresh,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. useServerVirtual
// ─────────────────────────────────────────────────────────────────────────────

export function useServerVirtual({
  url,
  mode             = "virtual",
  windowSize       = 100,
  defaultSorting   = [],
  defaultFilters   = [],
  filtersToParams  = (f) => Object.fromEntries(f.map((x) => [x.id, x.value])),
  sortToParams     = (s) => s[0] ? { sortBy: s[0].id, sortDir: s[0].desc ? "desc" : "asc" } : {},
  extraParams      = {},
  globalSearchParam = "search",
  sentinelOffset    = 30,
} = {}) {

  const [sorting,       setSorting]       = React.useState(defaultSorting);
  const [columnFilters, setColumnFilters] = React.useState(defaultFilters);
  const [globalSearch,  setGlobalSearch]  = React.useState("");
  const [data,          setData]          = React.useState([]);
  const [total,         setTotal]         = React.useState(0);
  const [loading,       setLoading]       = React.useState(false);
  const [error,         setError]         = React.useState(null);
  const [allLoaded,     setAllLoaded]     = React.useState(false);

  const debouncedFilters = useDebouncedValue(columnFilters, 300);
  const debouncedSearch  = useDebouncedValue(globalSearch, 400);

  // Synchronous ref assignment — same pattern as useServerPageTable
  const filtersToParamsRef = React.useRef(filtersToParams);
  filtersToParamsRef.current = filtersToParams;

  const sortToParamsRef = React.useRef(sortToParams);
  sortToParamsRef.current = sortToParams;

  const extraParamsRef = React.useRef(extraParams);
  extraParamsRef.current = extraParams;

  // Sorting ref for fetchMore (which can't depend on sorting state directly)
  const sortingRef = React.useRef(sorting);
  sortingRef.current = sorting;

  // Mutable counters for append-only state management
  const fetchedRef    = React.useRef(0);
  const totalRef      = React.useRef(0);
  const isFetchingRef = React.useRef(false);

  // Epoch: incremented on every reset; fetchMore checks before applying results
  const resetEpoch = React.useRef(0);

  const extraParamsKey = JSON.stringify(extraParams);

  // ── Reset + initial fetch ──────────────────────────────────────────────────
  React.useEffect(() => {
    if (!url) return;

    const controller = new AbortController();
    const thisEpoch  = ++resetEpoch.current;

    fetchedRef.current    = 0;
    totalRef.current      = 0;
    isFetchingRef.current = false;

    setData([]);
    setTotal(0);
    setError(null);
    setAllLoaded(false);
    setLoading(true);

    ApiCustomer.get(url, {
      params: {
        mode,
        skip: 0,
        take: windowSize,
        ...sortToParamsRef.current(sorting),
        ...filtersToParamsRef.current(debouncedFilters),
        ...(debouncedSearch ? { [globalSearchParam]: debouncedSearch } : {}),
        ...extraParamsRef.current,
      },
      signal: controller.signal,
    })
      .then(({ data: json }) => {
        if (thisEpoch !== resetEpoch.current) return;
        const rows  = json.data?.data ?? json.data ?? [];
        const count = json.data?.total ?? json.total ?? 0;
        setData(rows);
        setTotal(count);
        totalRef.current   = count;
        fetchedRef.current = rows.length;
        if (rows.length >= count) setAllLoaded(true);
      })
      .catch((e) => {
        if (axios.isCancel?.(e) || e.name === "CanceledError") return;
        setError(e.response?.data?.message ?? e.message ?? "Fetch failed");
      })
      .finally(() => {
        if (thisEpoch === resetEpoch.current) setLoading(false);
      });

    return () => {
      controller.abort();
      isFetchingRef.current = false;
    };
    // filtersToParams / sortToParams / extraParams intentionally excluded (refs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, mode, windowSize, debouncedFilters, sorting, debouncedSearch, extraParamsKey, globalSearchParam]);

  // ── fetchMore — stable callback ────────────────────────────────────────────
  const fetchMore = React.useCallback(async () => {
    if (isFetchingRef.current) return;
    if (totalRef.current > 0 && fetchedRef.current >= totalRef.current) return;

    const thisEpoch = resetEpoch.current;
    isFetchingRef.current = true;
    setLoading(true);

    try {
      const { data: json } = await ApiCustomer.get(url, {
        params: {
          mode,
          skip: fetchedRef.current,
          take: windowSize,
          ...sortToParamsRef.current(sortingRef.current),
          ...filtersToParamsRef.current(columnFilters),
          ...(globalSearch ? { [globalSearchParam]: globalSearch } : {}),
          ...extraParamsRef.current,
        },
      });

      if (thisEpoch !== resetEpoch.current) return; // reset happened mid-flight

      const rows  = json.data?.data ?? json.data ?? [];
      const count = json.data?.total ?? json.total ?? 0;

      setData((prev) => {
        const next = [...prev, ...rows];
        fetchedRef.current = next.length;
        return next;
      });
      setTotal(count);
      totalRef.current = count;
      if (fetchedRef.current >= count) setAllLoaded(true);
    } catch (e) {
      if (!axios.isCancel?.(e) && e.name !== "CanceledError") {
        setError(e.response?.data?.message ?? e.message ?? "Fetch more failed");
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, mode, windowSize]);

  return {
    data,
    total,
    loading,
    error,
    allLoaded,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalSearch,
    setGlobalSearch,
    fetchMore,
    sentinelOffset,
  };
}
