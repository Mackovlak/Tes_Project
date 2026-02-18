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

const RepairClassCodeSchema = z.object({
 Code: z.string().min(1,"Code is required"),
 Description: z.string().min(1, "Description is required"),
 Definition: z.string().min(1, "Definitation is required"),
 PaymentEligibility: z.string().min(1, "PaymentEligibility is required"),
})

export function RepairClassCodeAdd() {
  const [open, setOpen] = React.useState(false)

  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        Code: values?.Code,
        Description: values?.Description,
        Definition: values?.Definition,
        PaymentEligibility: values?.PaymentEligibility,
      }
      await ApiCustomer.post(`/api/repairClassCode`, payload)
    },
    onSuccess: () => {
      setOpen(false)
    },
  })
  
  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        Code: "",
        Description: "",
        Definition: "",
        PaymentEligibility: "",
    },
    onSubmit: async ({ value }) => {
      const parsed = RepairClassCodeSchema.safeParse(value)
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
        title="Adding Repair Class Code Information"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form.Field name="Code" validators={{ required: "Code is required" }}>
            {(field) => (
            <TField label="Code" required field={field}>
                {({ value, onChange, onBlur }) => (
                    <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
            </TField>
            )}
        </form.Field>

        <form.Field name="Description" validators={{ required: "Description is required" }}>
            {(field) => (
            <TField label="Description" required field={field}>
                {({ value, onChange, onBlur }) => (
                    <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
            </TField>
            )}
        </form.Field>

        <form.Field name="Definition" validators={{ required: "Definition is required" }}>
            {(field) => (
            <TField label="Definition" required field={field}>
                {({ value, onChange, onBlur }) => (
                    <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
            </TField>
            )}
        </form.Field>

           <form.Field name="PaymentEligibility" validators={{ required: "PaymentEligibility is required" }}>
                {(field) => (
                    <TField label="Payment Eligibility" required field={field}>
                    {({ value, onChange }) => (
                        <SearchCommandBlock
                            value={value}
                            onChange={onChange}
                            options={[
                                {label: "Eligible", value: "Eligible"},
                                {label: "Not Eligible", value: "Not_Eligible"}
                            ]}
                            placeholder="search Payment Eligibility.."
                        />
                    )}
                    </TField>
                )}
            </form.Field>
        </div>
      </FormDialog>
    </>
  )
}
