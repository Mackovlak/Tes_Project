import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner" // Assuming you use sonner for toasts

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogTrigger } from "@/components/ui/dialog"
import { Pencil, Plus } from "lucide-react"

import { FormDialog } from "../config/form-dialog"
import { TField } from "../config/tfield"
import { AsyncComboboxField } from "../config/async-combobox-field"
import ApiCustomer from "@/api"
import { SearchCommandBlock } from "@/components/sc-select"

// 1. ZOD SCHEMA FIXES: Added .min() for strings and z.coerce for numbers
const WarrantyServiceSchema = z.object({
        Service_offerID: z.string().min(1, "Service Offer ID is required"),
        Service_description: z.string().min(1, "Service Description is required"),
        CTat_RTime: z.string().min(1, "CTat RTime is required"),
        Price: z.coerce.number({ invalid_type_error: "Price is required" }),
        Shipping_Fee: z.coerce.number({ invalid_type_error: "Shipping Fee is required" }),
        qty_ws: z.coerce.number({ invalid_type_error: "Quantity is required" }).min(1, "Must be at least 1"),
        Tax: z.coerce.number({ invalid_type_error: "Tax is required" }),
        Total: z.coerce.number({ invalid_type_error: "Total is required" }),
        WarrantyCondition: z.string().min(1, "Warranty Condition is required"),   
        CaseTypeServices: z.string().min(1, "Case Type Services is required"),  
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
      // 2. TOAST NOTIFICATION: Success feedback
      toast.success("Success", { description: "Warranty Service has been added." })
      setOpen(false)
      form.reset() // Clear form on success
    },
    onError: (error) => {
      toast.error("Error", { description: error?.message || "Failed to add service." })
    }
  })
  
  const form = useForm({
    validatorAdapter: zodValidator,
    // Note: Numbers can start as empty strings here because z.coerce handles the conversion later
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
        onOpenChange={(isOpen) => {
            setOpen(isOpen)
            if (!isOpen) form.reset() // Clear errors if closed mid-typing
        }}
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
          
          {/* 3. FIELD VALIDATOR FIXES: Connected Zod shape to the onChange event */}
          <form.Field name="Service_offerID" validators={{ onChange: WarrantyServiceSchema.shape.Service_offerID }}>
            {(field) => (
              <TField label="Service Offer ID" required field={field} >
                {({ value, onChange, onBlur }) => (
                 <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}/>
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="Service_description" validators={{ onChange: WarrantyServiceSchema.shape.Service_description }}>
            {(field) => (
              <TField label="Service Description" required field={field} >
                {({ value, onChange, onBlur }) => (
                 <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}/>
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="CTat_RTime" validators={{ onChange: WarrantyServiceSchema.shape.CTat_RTime }}>
            {(field) => (
              <TField label="CTat RTime" required field={field} >
                {({ value, onChange, onBlur }) => (
                 <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}/>
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="Price" validators={{ onChange: WarrantyServiceSchema.shape.Price }}>
            {(field) => (
              <TField label="Price" required field={field} >
                {({ value, onChange, onBlur }) => (
                 <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}/>
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="Shipping_Fee" validators={{ onChange: WarrantyServiceSchema.shape.Shipping_Fee }}>
            {(field) => (
              <TField label="Shipping Fee" required field={field} >
                {({ value, onChange, onBlur }) => (
                 <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}/>
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="qty_ws" validators={{ onChange: WarrantyServiceSchema.shape.qty_ws }}>
            {(field) => (
              <TField label="Qty WS" required field={field} >
                {({ value, onChange, onBlur }) => (
                 <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}/>
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="Tax" validators={{ onChange: WarrantyServiceSchema.shape.Tax }}>
            {(field) => (
              <TField label="Tax" required field={field} >
                {({ value, onChange, onBlur }) => (
                 <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}/>
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="Total" validators={{ onChange: WarrantyServiceSchema.shape.Total }}>
            {(field) => (
              <TField label="Total" required field={field} >
                {({ value, onChange, onBlur }) => (
                 <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}/>
                )}
              </TField>
            )}
          </form.Field>

          {/* 4. TYPO FIX: Changed label from "Total" to "Warranty Condition" */}
          <form.Field name="WarrantyCondition" validators={{ onChange: WarrantyServiceSchema.shape.WarrantyCondition }}>
            {(field) => (
              <TField label="Warranty Condition" required field={field} span={3}>
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

          <form.Field name="CaseTypeServices" validators={{ onChange: WarrantyServiceSchema.shape.CaseTypeServices }}>
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
