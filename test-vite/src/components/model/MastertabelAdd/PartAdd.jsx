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

const PartSchema = z.object({
    PartNumber: z.string().min(1, "Part Number is Required"),
    Keyword: z.string().min(1, "Keyword is Required"),
    PartDescription: z.string().min(1, "PartDescription is Required"),
    RestrictionReason: z.string(),
    Orderability: z.boolean(),
    CSR_Flag: z.boolean(),
    ROHS_Flag: z.boolean(),
    Returnable_Flag: z.boolean(),
    HardRoll_Flag: z.boolean(),
    DangerousGoods_Flag: z.boolean(),
    LithiumBattery_Flag: z.boolean(),
    Oversize_Flag: z.boolean(),
    Heavy_Flag: z.boolean(),
    Price: z.number(),
    FreightPrice: z.number(),
    Shipping_Fee: z.number(),
    Tax: z.number(),
    Total: z.number(),
})

export function PartAdd() {
  const [open, setOpen] = React.useState(false)

  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        PartNumber: values?.PartNumber,
        Keyword: values?.Keyword,
        PartDescription: values?.PartDescription,
        RestrictionReason: values?.RestrictionReason,
        Orderability: Boolean(values?.Orderability),
        CSR_Flag: Boolean(values?.CSR_Flag),
        ROHS_Flag: Boolean(values?.ROHS_Flag),
        Returnable_Flag: Boolean(values?.Returnable_Flag),
        HardRoll_Flag: Boolean(values?.HardRoll_Flag),
        DangerousGoods_Flag: Boolean(values?.DangerousGoods_Flag),
        LithiumBattery_Flag: Boolean(values?.LithiumBattery_Flag),
        Oversize_Flag: Boolean(values?.Oversize_Flag),
        Heavy_Flag: Boolean(values?.Heavy_Flag),
        Price: Number(values?.Price),
        FreightPrice: Number(values?.FreightPrice),
        Shipping_Fee: Number(values?.Shipping_Fee),
        Tax: Number(values?.Tax),
        Total: Number(values?.Total),
      }
      await ApiCustomer.post(`/api/service-log/parts-catalog`, payload)
    },
    onSuccess: () => {
      setOpen(false)
    },
  })
  
  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        PartNumber: "",
        Keyword: "",
        PartDescription: "",
        RestrictionReason: "",
        Orderability: false,
        CSR_Flag: false,
        ROHS_Flag: false,
        Returnable_Flag: false,
        HardRoll_Flag: false,
        DangerousGoods_Flag: false,
        LithiumBattery_Flag: false,
        Oversize_Flag: false,
        Heavy_Flag: false,
        Price: 0,
        FreightPrice: 0,
        Shipping_Fee: 0,
        Tax: 0,
        Total: 0,
    },
    onSubmit: async ({ value }) => {
      const parsed = PartSchema.safeParse(value)
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
        title="Adding Part Information"
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
            <form.Field name="PartNumber" validators={{ required: "Part Number is required" }}>
            {(field) => (
            <TField label="Part Number" required field={field}>
                {({ value, onChange, onBlur }) => (
                    <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
            </TField>
            )}
        </form.Field>

            <form.Field name="Keyword" validators={{ required: "Keyword is required" }}>
            {(field) => (
            <TField label="Keyword" required field={field}>
                {({ value, onChange, onBlur }) => (
                    <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
            </TField>
            )}
        </form.Field>

        <form.Field name="PartDescription" validators={{ required: "Part Description is required" }}>
            {(field) => (
            <TField label="Part Description" required field={field}>
                {({ value, onChange, onBlur }) => (
                    <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
            </TField>
            )}
        </form.Field>

        <form.Field name="RestrictionReason" >
            {(field) => (
            <TField label="Restriction Reason" field={field}>
                {({ value, onChange, onBlur }) => (
                    <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
            </TField>
            )}
        </form.Field>

        <form.Field name="Price" >
            {(field) => (
            <TField label="Price" field={field}>
                {({ value, onChange, onBlur }) => (
                    <Input type={"number"} value={value} onChange={(e) => onChange(Number(e.target.value))} onBlur={onBlur} />
                )}
            </TField>
            )}
        </form.Field>

        <form.Field name="FreightPrice">
            {(field) => (
            <TField label="Freight Price" field={field}>
                {({ value, onChange, onBlur }) => (
                    <Input type={"number"} value={value} onChange={(e) => onChange(Number(e.target.value))} onBlur={onBlur} />
                )}
            </TField>
            )}
        </form.Field>

        <form.Field name="Shipping_Fee">
            {(field) => (
            <TField label="Shipping Fee" field={field}>
                {({ value, onChange, onBlur }) => (
                    <Input type={"number"} value={value} onChange={(e) => onChange(Number(e.target.value))} onBlur={onBlur} />
                )}
            </TField>
            )}
        </form.Field>

        <form.Field name="Tax" >
            {(field) => (
            <TField label="Tax" field={field}>
                {({ value, onChange, onBlur }) => (
                    <Input type={"number"} value={value} onChange={(e) => onChange(Number(e.target.value))} onBlur={onBlur} />
                )}
            </TField>
            )}
        </form.Field>

        <form.Field name="Total">
            {(field) => (
            <TField label="Total" field={field}>
                {({ value, onChange, onBlur }) => (
                    <Input type={"number"} value={value} onChange={(e) => onChange(Number(e.target.value))} onBlur={onBlur} />
                )}
            </TField>
            )}
        </form.Field>

        {[ "Orderability", "CSR_Flag", "ROHS_Flag", "Returnable_Flag", "HardRoll_Flag",
            "DangerousGoods_Flag", "LithiumBattery_Flag", "Oversize_Flag", "Heavy_Flag"
        ].map((flag) => (
            <form.Field name={flag} key={flag}>
            {(field) => (
            <TField label={flag} field={field}>
                {({ value, onChange}) => (
                    <Input type={"checkbox"} checked={value} onChange={(e) => onChange(e.target.checked)} className={"h-4 ml-15"}/>
                )}
            </TField>
            )}
        </form.Field>
        ))
    }
        </div>
      </FormDialog>
    </>
  )
}
