import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { date, z } from "zod"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { useMutation, useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogTrigger } from "@/components/ui/dialog"
import { Pencil, Plus } from "lucide-react"

import { FormDialog } from "../config/form-dialog"
import { TField } from "../config/tfield"
import { AsyncComboboxField } from "../config/async-combobox-field"
import ApiCustomer from "@/api"
import { SearchCommandBlock } from "@/components/sc-select"
import DatePicker from "@/components/date-picker"

const ProductSchema = z.object({
    ProductNumber: z.string(),
    ProductLine: z.string(),
    ProductName: z.string(),
    ProductType: z.object({
        ProductTypeID: z.number(),
        ProductType: z.string()
    }),
    HWPC: z.string(), 
})

export function ProductAdd() {
  const [open, setOpen] = React.useState(false)

  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        ProductNumber: values?.ProductNumber,
        ProductLine: values?.ProductLine,
        ProductName: values?.ProductName,
        ProductTypeID: values?.ProductType?.ProductTypeID,
        HWPC: values?.HWPC, 
      }
      await ApiCustomer.post(`/api/product-information`, payload)
    },
    onSuccess: () => {
      setOpen(false)
    },
  })
  
  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        ProductNumber: '',
        ProductLine: '',
        ProductName: '',
        ProductType: null,
        HWPC: '', 
       
    },
    onSubmit: async ({ value }) => {
      const parsed = ProductSchema.safeParse(value)
      if (!parsed.success) {
        return
      }
      await updateMutation.mutateAsync(parsed.data)
    },
  })

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Adding Product Information"
        description="Fields marked with * are required."
        submitting={updateMutation.isPending}
        submitLabel="Submit"
        onSubmit={() => form.handleSubmit()}
        trigger={
          <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4"/>
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <form.Field name="ProductNumber" validators={{ required: "Product Number is required" }}>
            {(field) => (
              <TField label="Product Number" required field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                  <Input  value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />  
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="ProductLine" validators={{ required: "Product Line is required" }}>
            {(field) => (
              <TField label="Product Line" required field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                  <Input  value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />  
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="ProductName" validators={{ required: "Product Name is required" }}>
            {(field) => (
              <TField label="Product Name" required field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                  <Input  value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />  
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="ProductType" validators={{ required: "Product Type is required" }}>
            {(field) => (
              <TField label="Product Type" required field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                    <AsyncComboboxField
                        onChange={onChange}
                        value={value}
                        labelKey={"ProductType"}
                        valueKey={"ProductTypeID"}
                        fetcher={async (q) => {
                            const res = await ApiCustomer.get("/api/product-type", {params: {q}})
                            const data = res.data.data
                            return data.map((item) => ({
                                ProductTypeID: item.ProductTypeID,
                                ProductType: item.ProductType
                            }))

                        }}
                    />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="HWPC">
            {(field) => (
              <TField label="HWPC" field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                  <Input  value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />  
                )}
              </TField>
            )}
          </form.Field>
        </div>
      </FormDialog>
    </>
  )
}
