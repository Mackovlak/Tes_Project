import * as React from "react"
import { FormItem, FormLabel, FormMessage } from "./tanstack-form"
import CaseField from "@/components/CaseField"

export function TField({ label, required, field, children, span }) {
  return (
    <CaseField label={label} required={required} field={field} indent={true} span={span}>
      {children({
        value: field.state.value,
        onChange: field.handleChange,
        onBlur: field.handleBlur,
        name: field.name,
      })}
    </CaseField>
  )
}
