import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { useMutation } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

import { FormDialog } from "../config/form-dialog"
import { TField } from "../config/tfield"
import { AsyncComboboxField } from "../config/async-combobox-field"
import ApiCustomer from "@/api"

// 1. Enforce minimum length for required strings so empty strings fail validation
const ProductSchema = z.object({
    ProductNumber: z.string().min(1, "Product Number is required"),
    ProductLine: z.string().min(1, "Product Line is required"),
    ProductName: z.string().min(1, "Product Name is required"),
    ProductType: z.object({
        ProductTypeID: z.number(),
        ProductType: z.string()
    }).nullable().refine((val) => val !== null, { message: "Product Type is required" }),
    HWPC: z.string().optional(), 
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
      form.reset() // Reset form on success
    },
  })

  const fetchProductTypes = React.useCallback(async (q) => {
    const res = await ApiCustomer.get("/api/product-type", { params: { q } })
    const data = res.data.data
    return data.map((item) => ({
      ProductTypeID: item.ProductTypeID,
      ProductType: item.ProductType,
    }))
  }, [])

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
      // The form will auto-validate based on the field validators before hitting onSubmit
      const parsed = ProductSchema.safeParse(value)
      if (!parsed.success) return;
      
      await updateMutation.mutateAsync(parsed.data)
    },
  })

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={(isOpen) => {
            setOpen(isOpen)
            if (!isOpen) form.reset() // Clear errors if user closes the modal
        }}
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
          
          {/* 2. Use Zod directly in the field validator for instant UI feedback */}
          <form.Field 
            name="ProductNumber" 
            validators={{ onChange: ProductSchema.shape.ProductNumber }}
          >
            {(field) => (
              <TField label="Product Number" required field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />  
                )}
              </TField>
            )}
          </form.Field>

          <form.Field 
            name="ProductLine" 
            validators={{ onChange: ProductSchema.shape.ProductLine }}
          >
            {(field) => (
              <TField label="Product Line" required field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />  
                )}
              </TField>
            )}
          </form.Field>

          <form.Field 
            name="ProductName" 
            validators={{ onChange: ProductSchema.shape.ProductName }}
          >
            {(field) => (
              <TField label="Product Name" required field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />  
                )}
              </TField>
            )}
          </form.Field>

          <form.Field 
            name="ProductType" 
            validators={{ onChange: ProductSchema.shape.ProductType }}
          >
            {(field) => (
              <TField label="Product Type" required field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                    <AsyncComboboxField
                        onChange={onChange}
                        value={value}
                        labelKey={"ProductType"}
                        valueKey={"ProductTypeID"}
                        fetcher={fetchProductTypes}
                    />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="HWPC">
            {(field) => (
              <TField label="HWPC" field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />  
                )}
              </TField>
            )}
          </form.Field>
        </div>
      </FormDialog>
    </>
  )
}
