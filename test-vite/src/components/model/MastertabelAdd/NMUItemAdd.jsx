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

const NmuItemSchema = z.object({
    itemName: z.string().min(1, "Iten Name is required"),
    nmu: z.object({
        NMUId: z.number(),
        NMUDesc: z.string()
    }),
})

export function NmuItemAdd() {
  const [open, setOpen] = React.useState(false)

  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        itemName: values?.itemName,
        nmuId: values?.nmu?.NMUId,
      }
      await ApiCustomer.post(`/api/nmu/nmuitem`, payload)
    },
    onSuccess: () => {
      setOpen(false)
    },
  })
  
  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        itemName: "",
        nmu: undefined,
    },
    onSubmit: async ({ value }) => {
      const parsed = NmuItemSchema.safeParse(value)
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
        title="Adding NMU Item Information"
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
        <form.Field name="itemName" validators={{ required: "Item Name is required" }}>
            {(field) => (
              <TField label="Item Name" required field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                  <Input  value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />  
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="nmu" validators={{ required: "NMU Id is required" }}>
            {(field) => (
              <TField label="NMU Id" required field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                  <AsyncComboboxField
                    onChange={onChange}
                    labelKey={"NMUDesc"}
                    valueKey={"NMUId"}
                    value={value}
                    fetcher={async (q) => {
                        const res = await ApiCustomer.get("/api/nmu", {params: {q}})
                        const data = res.data.data
                        return data.map((item) => ({
                            NMUId: item.NMUId,
                            NMUDesc: item.NMUDesc
                        }))
                    }}
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
