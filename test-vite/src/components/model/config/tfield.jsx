import * as React from "react"
import { FormItem, FormLabel, FormMessage } from "./tanstack-form"
import CaseField from "@/components/CaseField"

export function TField({ label, required, field, children, span }) {
  // const error = field.state.meta.errors?.length ? field.state.meta.errors[0] : null;
  const errors = field.state.meta.errors;
  return (
    <CaseField label={label} required={required} field={field} indent={true} span={span}
      star={required} 
      errors={errors}  
    >
      {children({
        value: field.state.value,
        onChange: field.handleChange,
        onBlur: field.handleBlur,
        name: field.name,
      })}
    </CaseField>
  )
}
