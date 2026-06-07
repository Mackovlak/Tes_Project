"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"


export function DataTableColumnHeader({
  column,
  title,
  className,
  children,
  ableToSort = true,
}) {
  const sorted = column.getIsSorted() // false | "asc" | "desc"

  return (
    <div className="flex flex-col p-2">
     {ableToSort ?
      (
        <Button
        type="button"
        variant="ghost"
        className={className}
        onClick={() => column.toggleSorting(sorted === "asc")}
      >
        {title}
        {sorted === "asc" ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : sorted === "desc" ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4 opacity-60" />
        )}
      </Button>
      )
       :
      (
        <Button
        type="button"
        variant="ghost"
        className={className}
      >
        {title}
      </Button>
      )}
      {children &&
      <span className="flex items-center mt-1">
       {children}
      </span>
      }
    </div>
  );
}

