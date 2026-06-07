import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner" // Or your specific toast import (e.g., from "@/components/ui/use-toast")

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

import { FormDialog } from "../config/form-dialog"
import { TField } from "../config/tfield"
import ApiCustomer from "@/api"
import { SearchCommandBlock } from "@/components/sc-select"

// 1. FIX: Add .min(1) so empty strings trigger validation errors
const ProductTypeSchema = z.object({
     ProductGroup: z.string().min(1, "Product Group is required"),
     ProductTower: z.string().min(1, "Product Tower is required"),
     ProductType: z.string().min(1, "Product Type is required"),
})

export function ProductTypeAdd() {
  const [open, setOpen] = React.useState(false)

  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        ProductGroup: values?.ProductGroup,
        ProductTower: values?.ProductTower,
        ProductType: values?.ProductType,
      }
      await ApiCustomer.post(`/api/product-type`, payload)
    },
    onSuccess: () => {
      // 2. NEW: Trigger success toast
      toast.success("Success", {
        description: "Product Type has been added successfully."
      })
      setOpen(false)
      form.reset() // Clear form data so it's fresh for the next entry
    },
    onError: (error) => {
      // NEW: Trigger error toast just in case the API fails
      toast.error("Error", {
        description: error?.message || "Failed to add Product Type."
      })
    }
  })
  
  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        ProductGroup: "",
        ProductTower: "",
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

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={(isOpen) => {
            setOpen(isOpen)
            if (!isOpen) form.reset() // 3. FIX: Reset errors if user closes and reopens the dialog
        }}
        title="Adding Product Type Information"
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
          
          {/* 4. FIX: Use Zod validation via 'onChange' instead of 'required' */}
          <form.Field name="ProductGroup" validators={{ onChange: ProductTypeSchema.shape.ProductGroup }}>
            {(field) => (
              <TField label="Product Group" required field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                    <SearchCommandBlock
                        value={value}
                        onChange={onChange}
                        placeholder="Search Product Group"
                        options={[
                            "Commercial",
                            "Consumer"
                        ]}
                    />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="ProductTower" validators={{ onChange: ProductTypeSchema.shape.ProductTower }}>
            {(field) => (
              <TField label="Product Tower" required field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                    <SearchCommandBlock
                        value={value}
                        onChange={onChange}
                        placeholder="Search Product Tower"
                        options={[
                            "PSG",
                            "IPG"
                        ]}
                    />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="ProductType" validators={{ onChange: ProductTypeSchema.shape.ProductType }}>
            {(field) => (
              <TField label="Product Type" required field={field} span={2}>
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
