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

const ProductTypeSchema = z.object({
     ProductGroup: z.string(),
     ProductTower: z.string(),
     ProductType: z.string(),
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
      setOpen(false)
    },
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
        onOpenChange={setOpen}
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
          <form.Field name="ProductGroup" validators={{ required: "Product Group is required" }}>
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

          <form.Field name="ProductTower" validators={{ required: "Product Tower is required" }}>
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

          <form.Field name="ProductType" validators={{ required: "Product TYpe is required" }}>
            {(field) => (
              <TField label="Product Type" required field={field} span={2}>
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
