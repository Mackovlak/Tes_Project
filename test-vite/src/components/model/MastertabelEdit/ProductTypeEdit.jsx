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
import { SearchCommandBlock } from "@/components/sc-select"

const ProductTypeSchema = z.object({
    ProductTower: z.string().min(1, "Product Tower is required"),
    ProductGroup: z.string().min(1, "Product Group is required"),
    ProductType: z.string().min(1, "Product Type is required"),
})

export function ProductTypeEdit({ productTypeID, onUpdate }) {
  const [open, setOpen] = React.useState(false)

  const productTypeQuery = useQuery({
    queryKey: ["productType", productTypeID],
    enabled: open && !!productTypeID,
    queryFn: async () => {
      const res = await ApiCustomer.get(`/api/product-type/${productTypeID}`)
      return res.data.data
    },
  })
  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        ProductTower: values?.ProductTower || "",
        ProductGroup: values?.ProductGroup || "",
        ProductType: values?.ProductType || "",
      }
      await ApiCustomer.patch(`/api/product-type/${productTypeID}`, payload)
    },
    onSuccess: () => {
      onUpdate?.()
      setOpen(false)
    },
  })

  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        ProductTower: "",
        ProductGroup: "",
        ProductType: "",
    },
    onSubmit: async ({ value }) => {
      const parsed = ProductTypeSchema.safeParse(value)
      if (!parsed.success) {
        return
      }
      await updateMutation.mutateAsync(parsed.data)
    },
  })

  React.useEffect(() => {
    if (!productTypeQuery.data) return
    const data = productTypeQuery.data
    form.reset({
        ProductTower: data?.ProductTower ?? "",
        ProductGroup: data?.ProductGroup ?? "",
        ProductType: data?.ProductType ?? "",
    })
  }, [productTypeQuery.data])

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Edit Product Type Information"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form.Field
            name="ProductTower"
            validators={{ onChange: ({ value }) => (!value ? "Product Tower is required" : undefined) }}
          >
            {(field) => (
              <TField label="Product Tower" required field={field}>
                {({ value, onChange }) => (
                    <SearchCommandBlock
                        onChange={onChange}
                        value={value}
                        placeholder="Search Product Tower"
                        options={[
                            "PSG",
                            "IPG",
                        ]}
                    />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="ProductGroup"
            validators={{ onChange: ({ value }) => (!value ? "Product Group is required" : undefined) }}
          >
            {(field) => (
              <TField label="Product Group" required field={field}>
                {({ value, onChange }) => (
                    <SearchCommandBlock
                        onChange={onChange}
                        value={value}
                        placeholder="Search Product Group"
                        options={[
                            "Commercial",
                            "Consumer",
                        ]}
                    />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="ProductType"
            validators={{ onChange: ({ value }) => (!value ? "Product Type is required" : undefined) }}
          >
            {(field) => (
              <TField label="Product Type" required field={field}>
                {({ value, onChange, onBlur }) => (
                    <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>
        </div>

        {/* Optional: show form-level loading state */}
        {productTypeQuery.isFetching ? <p className="text-sm text-muted-foreground mt-2">Loading product type...</p> : null}
      </FormDialog>
    </>
  )
}
