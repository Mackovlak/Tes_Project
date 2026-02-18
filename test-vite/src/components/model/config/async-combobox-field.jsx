import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ChevronsUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"


function useDebounced(value , delay = 250) {
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
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const debounced = useDebounced(query, 250)

  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    let cancelled = false

    setLoading(true)
    fetcher(debounced)
      .then((res) => {
        if (!cancelled) setItems(res ?? [])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [debounced, open, fetcher])

  const selectedLabel = value ? String(value[labelKey]) : ""

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between"
        >
          <span className={cn("truncate", !selectedLabel && "text-muted-foreground")}>
            {selectedLabel || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={searchPlaceholder}
          />
          <CommandList>
            {loading ? <CommandEmpty>Loading...</CommandEmpty> : null}
            {!loading && items.length === 0 ? <CommandEmpty>No results.</CommandEmpty> : null}

            <CommandGroup>
              {items.map((it) => {
                const isSelected =
                  value && String(value[valueKey]) === String(it[valueKey])

                return (
                  <CommandItem
                    key={String(it[valueKey])}
                    value={String(it[labelKey])}
                    onSelect={() => {
                      onChange(it)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                    {String(it[labelKey])}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
