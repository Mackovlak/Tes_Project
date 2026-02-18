import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { useMutation, useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogTrigger } from "@/components/ui/dialog"
import { Pencil } from "lucide-react"

import { FormDialog } from "../config/form-dialog"
import { TField } from "../config/tfield"
import { AsyncComboboxField } from "../config/async-combobox-field"
import ApiCustomer from "@/api"

const ProductSchema = z.object({
    ProductNumber: z.string().min(1, "Product Number is required"),
    ProductLine: z.string().min(1, "Product Line is required"),
    ProductName: z.string().min(1, "Product Name is required"),
    Product: z.any().nullable(),
    HWPC: z.string(),
})

export function ProductEdit({ productNumber, onUpdate }) {
  const [open, setOpen] = React.useState(false)

  const productQuery = useQuery({
    queryKey: ["product", productNumber],
    enabled: open && !!productNumber,
    queryFn: async () => {
      const res = await ApiCustomer.get(`/api/product-information/${productNumber}`)
      return res.data.data
    },
  })
  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        newProductNumber: values?.ProductNumber || "",
        ProductLine: values?.ProductLine || "",
        ProductName: values?.ProductName || "",
        ProductTypeID: values?.Product?.ProductTypeID || null,
        HWPC: values?.HWPC || "",
      }
      await ApiCustomer.patch(`/api/product-information/${productNumber}`, payload)
    },
    onSuccess: () => {
      onUpdate?.()
      setOpen(false)
    },
  })

  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        ProductNumber: "",
        ProductLine: "",
        ProductName: "",
        Product: null,
        HWPC: "",
    },
    onSubmit: async ({ value }) => {
      const parsed = ProductSchema.safeParse(value)
      if (!parsed.success) {
        return
      }
      await updateMutation.mutateAsync(parsed.data)
    },
  })

  React.useEffect(() => {
    if (!productQuery.data) return
    const data = productQuery.data
    form.reset({
        ProductNumber: data?.ProductNumber ?? "",
        ProductLine: data?.ProductLine ?? "",
        ProductName: data?.ProductName ?? "",
        Product: data?.product_type ?? null,
        HWPC: data?.HWPC ?? "",
    })
  }, [productQuery.data])

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Edit Product Information"
        description="Fields marked with * are required."
        submitting={updateMutation.isPending}
        submitLabel="Update"
        onSubmit={() => form.handleSubmit()}
        trigger={
          <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
          <Pencil className="w-4 h-4" />
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <form.Field
            name="ProductNumber"
            validators={{ onChange: ({ value }) => (!value ? "Product Number is required" : undefined) }}
          >
            {(field) => (
              <TField label="Product Number" required field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="ProductLine"
            validators={{ onChange: ({ value }) => (!value ? "Product Line is required" : undefined) }}
          >
            {(field) => (
              <TField label="Product Line" required field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="ProductName"
            validators={{ onChange: ({ value }) => (!value ? "Product Name is required" : undefined) }}
          >
            {(field) => (
              <TField label="Product Name" required field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="Product"
            validators={{ onChange: ({ value }) => (!value ? "Product Type ID is required" : undefined) }}
          >
            {(field) => (
              <TField label="Product Type ID" required field={field}>
                {({ value, onChange }) => (
                <AsyncComboboxField
                    value={value}
                    onChange={onChange}
                    labelKey={"ProductType"}
                    valueKey={"ProductTypeID"}
                    placeholder="Select product type..."
                    fetcher={async (q) => {
                        const res = await ApiCustomer.get("/api/product-type", {params: {q}});
                        return res.data.data ?? []
                    }}
                />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="HWPC"
          >
            {(field) => (
              <TField label="HWPC" field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>
        </div>

        {/* Optional: show form-level loading state */}
        {productQuery.isFetching ? <p className="text-sm text-muted-foreground mt-2">Loading product...</p> : null}
      </FormDialog>
    </>
  )
}
