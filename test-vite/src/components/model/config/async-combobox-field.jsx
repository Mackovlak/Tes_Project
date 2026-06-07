import * as React from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, X, Loader2, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

function useDebounced(value, delay = 250) {
  const [v, setV] = React.useState(value)
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}

export function AsyncComboboxField({
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  labelKey,
  valueKey,
  fetcher,
  disabled,
  allowClear = true,
}) {
  const [open, setOpen] = React.useState(false)
  const [isSearching, setIsSearching] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const debounced = useDebounced(query, 250)

  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(false)

  const inputRef = React.useRef(null)
  const dropdownRef = React.useRef(null)

  const showSelectedPill = value && !isSearching

  React.useEffect(() => {
    if (!open) return
    let cancelled = false

    setLoading(true)
    fetcher(debounced)
      .then((res) => {

    console.log("We here righ",res)
        if (!cancelled) setItems(res ?? [])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [debounced, open, fetcher])

  const startSearchMode = () => {
    if (disabled) return
    setIsSearching(true)
    setOpen(true)
    setQuery("") 

    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  const handleBlur = () => {
    setTimeout(() => {
      const active = document.activeElement
      const insideDropdown = dropdownRef.current && dropdownRef.current.contains(active)
      const onInput = inputRef.current === active

      if (!insideDropdown && !onInput) {
        setOpen(false)
        setIsSearching(false)
      }
    }, 150)
  }

  const handleClear = () => {
    if (disabled) return
    onChange(null) 
    setOpen(false)
    setIsSearching(false)
    setQuery("")
  }

  const selectedLabel = value ? String(value[labelKey]) : ""

  return (
    <div className="relative w-full">
      {showSelectedPill ? (
        <div
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer",
            disabled && "cursor-not-allowed opacity-50"
          )}
          onClick={startSearchMode}
        >
          <span className="truncate">{selectedLabel}</span>
          <div className="flex items-center gap-2">
            {allowClear && !disabled && (
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full p-0.5 hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }}
              >
                <X className="h-3.5 w-3.5 opacity-50 hover:opacity-100" />
              </button>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </div>
      ) : (
        <Command 
          shouldFilter={false} 
          filter={() => 1} // FIX 1: Force cmdk to never filter items internally
          className={cn(
            "w-full overflow-visible bg-transparent border border-input rounded-md", 
            open && "ring-2 ring-ring ring-offset-2 ring-offset-background border-transparent"
          )}
        >
          <CommandInput
            ref={inputRef}
            value={query}
            onValueChange={setQuery}
            placeholder={value ? selectedLabel : placeholder}
            onFocus={() => {
              if (!disabled) setOpen(true)
            }}
            onBlur={handleBlur}
            disabled={disabled}
            className="h-9 border-none outline-none ring-0 shadow-none"
          />

          {open && !disabled && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 z-[9999] mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95"
            >
              <CommandList className="max-h-60 overflow-y-auto p-1">
                {loading && (
                  <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                )}
                
                {!loading && items.length === 0 && (
                  <CommandEmpty className="py-4 text-center text-sm">No results found.</CommandEmpty>
                )}

                <CommandGroup>
                  {/* FIX 2: Removed `!loading &&` so items stay mounted during searches to preserve cmdk state */}
                  {items.map((it) => {
                    // FIX 3: Force lowercase on the value string so cmdk's internal lookup doesn't fail
                    const itemValue = String(it[valueKey]).toLowerCase()
                    const isSelected = value && String(value[valueKey]).toLowerCase() === itemValue

                    return (
                      <CommandItem
                        key={itemValue}
                        value={itemValue}
                        onSelect={() => {
                          onChange(it)
                          setOpen(false)
                          setIsSearching(false) 
                        }}
                        className="cursor-pointer"
                      >
                        <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                        {String(it[labelKey])}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </div>
          )}
        </Command>
      )}
    </div>
  )
}
