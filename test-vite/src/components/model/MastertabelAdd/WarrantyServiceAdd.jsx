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

const WarrantyServiceSchema = z.object({
        Service_offerID: z.string(),
        Service_description: z.string(),
        CTat_RTime: z.string(),
        Price: z.number(),
        Shipping_Fee: z.number(),
        qty_ws: z.number(),
        Tax: z.number(),
        Total: z.number(),
        WarrantyCondition: z.string(),   
        CaseTypeServices: z.string(),  
})

export function WarrantyServiceAdd() {
  const [open, setOpen] = React.useState(false)

  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        Service_offerID: values?.Service_offerID,
        Service_description: values?.Service_description,
        CTat_RTime: values?.CTat_RTime,
        Price: Number(values?.Price),
        Shipping_Fee: Number(values?.Shipping_Fee),
        qty_ws: Number(values?.qty_ws),
        Tax: Number(values?.Tax),
        Total: Number(values?.Total),
        WarrantyCondition: values?.WarrantyCondition,   
        CaseTypeServices: values?.CaseTypeServices,  
      }
      await ApiCustomer.post(`/api/warranty-services`, payload)
    },
    onSuccess: () => {
      setOpen(false)
    },
  })
  
  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        Service_offerID: "",
        Service_description: "",
        CTat_RTime: "",
        Price: "",
        Shipping_Fee: "",
        qty_ws: "",
        Tax: "",
        Total: "",
        WarrantyCondition: "",   
        CaseTypeServices: "",   
       
    },
    onSubmit: async ({ value }) => {
      const parsed = WarrantyServiceSchema.safeParse(value)
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
        title="Adding Warranty Service Information"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <form.Field name="Service_offerID" validators={{ required: "Service Offer ID is required" }}>
            {(field) => (
              <TField label="Service Offer ID" required field={field} >
                {({ value, onChange, onBlur }) => (
                 <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}/>
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="Service_description" validators={{ required: "Service Description is required" }}>
            {(field) => (
              <TField label="Service Description" required field={field} >
                {({ value, onChange, onBlur }) => (
                 <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}/>
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="CTat_RTime" validators={{ required: "CTat RTime is required" }}>
            {(field) => (
              <TField label="CTat RTime" required field={field} >
                {({ value, onChange, onBlur }) => (
                 <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}/>
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="Price" validators={{ required: "Price is required" }}>
            {(field) => (
              <TField label="Price" required field={field} >
                {({ value, onChange, onBlur }) => (
                 <Input type={"number"} value={value} onChange={(e) => onChange(Number(e.target.value))} onBlur={onBlur}/>
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="Shipping_Fee" validators={{ required: "Shipping Fee is required" }}>
            {(field) => (
              <TField label="Shipping Fee" required field={field} >
                {({ value, onChange, onBlur }) => (
                 <Input type={"number"} value={value} onChange={(e) => onChange(Number(e.target.value))} onBlur={onBlur}/>
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="qty_ws" validators={{ required: "Qty WS is required" }}>
            {(field) => (
              <TField label="Qty WS" required field={field} >
                {({ value, onChange, onBlur }) => (
                 <Input type={"number"} value={value} onChange={(e) => onChange(Number(e.target.value))} onBlur={onBlur}/>
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="Tax" validators={{ required: "Tax is required" }}>
            {(field) => (
              <TField label="Tax" required field={field} >
                {({ value, onChange, onBlur }) => (
                 <Input type={"number"} value={value} onChange={(e) => onChange(Number(e.target.value))} onBlur={onBlur}/>
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="Total" validators={{ required: "Total is required" }}>
            {(field) => (
              <TField label="Total" required field={field} >
                {({ value, onChange, onBlur }) => (
                 <Input type={"number"} value={value} onChange={(e) => onChange(Number(e.target.value))} onBlur={onBlur}/>
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="WarrantyCondition" validators={{ required: "Total is required" }}>
            {(field) => (
              <TField label="Total" required field={field} span={3}>
                {({ value, onChange, onBlur }) => (
                    <SearchCommandBlock
                        value={value}
                        onChange={onChange}
                        placeholder="Search Warranty Condition"
                        options={[
                            {label: "In Warranty", value: "InWarranty"},
                            {label: "Out Of Warranty", value: "OutWarranty"}
                        ]}
                    />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="CaseTypeServices" validators={{ required: "Case Type Services is required" }}>
            {(field) => (
              <TField label="Case Type Services" required field={field} span={3}>
                {({ value, onChange, onBlur }) => (
                 <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}/>
                )}
              </TField>
            )}
          </form.Field>

        </div>
      </FormDialog>
    </>
  )
}
