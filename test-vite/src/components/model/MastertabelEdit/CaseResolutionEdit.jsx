import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { date, z } from "zod"
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
import DatePicker from "@/components/date-picker"

const CrsSchema = z.object({
    caseResolutionCode: z.string(),
    autoClose: z.string(),
    caseReadyForClosure: z.string(),
    readyForCloseDays: z.number(),
    readyForClosureDate: z.date(),
    pendingCustomerAction: z.date(),
    customerRequestedCloseDate: z.date(),
})

export function CrsEdit({ id_csr, onUpdate }) {
  const [open, setOpen] = React.useState(false)

  const crsEditQuery = useQuery({
    queryKey: ["crs", id_csr],
    enabled: open && !!id_csr,
    queryFn: async () => {
      const res = await ApiCustomer.get(`/api/caseResolution/${id_csr}`)
      return res.data.data
    },
  })
  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
         caseResolutionCode: values?.caseResolutionCode,
         autoClose: values?.autoClose,
         caseReadyForClosure: values?.caseReadyForClosure,
         readyForCloseDays: Number(values?.readyForCloseDays),
         readyForClosureDate: values?.readyForClosureDate,
         pendingCustomerAction: values?.pendingCustomerAction,
         customerRequestedCloseDate: values?.customerRequestedCloseDate,
      }
      await ApiCustomer.patch(`/api/caseResolution/${id_csr}`, payload)
    },
    onSuccess: () => {
      onUpdate?.()
      setOpen(false)
    },
  })
  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        caseResolutionCode: "",
        autoClose: "",
        caseReadyForClosure: "",
        readyForCloseDays: 0,
        readyForClosureDate: "",
        pendingCustomerAction: "",
        customerRequestedCloseDate: "",
    },
    onSubmit: async ({ value }) => {
      const parsed = CrsSchema.safeParse(value)
      if (!parsed.success) {
        return
      }
      await updateMutation.mutateAsync(parsed.data)
    },
  })

  React.useEffect(() => {
    if (!crsEditQuery.data) return
    const data = crsEditQuery.data
    form.reset({
        caseResolutionCode: data?.caseResolutionCode,
        autoClose: data?.autoClose,
        caseReadyForClosure: data?.caseReadyForClosure,
        readyForCloseDays: data?.readyForCloseDays,
        readyForClosureDate:  data?.readyForClosureDate ? new Date(data.readyForClosureDate) : null,
        pendingCustomerAction: data?.pendingCustomerAction ? new Date(data.pendingCustomerAction) : null,
        customerRequestedCloseDate: data?.customerRequestedCloseDate ? new Date(data.customerRequestedCloseDate) : null,
    })
  }, [crsEditQuery.data])


  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Edit Case Resolution Information"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <form.Field name="caseResolutionCode" validators={{ required: "Case Resolution Code is required" }}>
            {(field) => (
              <TField label="Case Resolution Code" required field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                  <Input  value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />  
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="autoClose" validators={{ required: "Auto Close is required" }}>
            {(field) => (
              <TField label="Auto Close" required field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                    <SearchCommandBlock
                        value={value}
                        onChange={onChange}
                        options={[
                            "Yes",
                            "No"
                        ]}
                    />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="caseReadyForClosure" validators={{ required: "Case Ready For Closure is required" }}>
            {(field) => (
              <TField label="Case Ready For Closure" required field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                    <SearchCommandBlock
                        value={value}
                        onChange={onChange}
                        options={[
                            "Yes",
                            "No"
                        ]}
                    />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="readyForCloseDays">
            {(field) => (
              <TField label="Ready For Close Days" field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                  <Input type={"number"} value={value} onChange={(e) => onChange(Number(e.target.value))} onBlur={onBlur} /> 
                   
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="readyForClosureDate">
            {(field) => (
              <TField label="Ready For Closure Date"  field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                    <DatePicker
                        onChange={onChange}
                        value={value}
                    />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="pendingCustomerAction">
            {(field) => (
              <TField label="Pending Customer Action" field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                <DatePicker
                    onChange={onChange}
                    value={value}
                        
                    />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="customerRequestedCloseDate">
            {(field) => (
              <TField label="Customer Requested Close Date" required field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                  <DatePicker
                        onChange={onChange}
                      value={value}
                    />
                )}
              </TField>
            )}
          </form.Field>
        </div>

        {/* Optional: show form-level loading state */}
        {crsEditQuery.isFetching ? <p className="text-sm text-muted-foreground mt-2">Loading Case Resolution...</p> : null}
      </FormDialog>
    </>
  )
}
