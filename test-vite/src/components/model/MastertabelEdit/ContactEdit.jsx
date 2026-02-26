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

const ContactSchema = z.object({
    Salutation: z.string(),
    FirstName: z.string(),
    LastName: z.string(),
    Email: z.string(),
    PreferredLanguage: z.string(),
    Companys: z.object({
      SiteAccountID: z.number(),
      Company: z.string()
    }),
    Phone: z.string(),
    Mobile: z.string(),
    WorkPhone: z.string(),
    WorkExtension: z.string(),
    AddressLine1: z.string(),
    AddressLine2: z.string(),
    City: z.object({ City: z.string() }).nullable(),
    Province: z.object({ StateProvince: z.string()}).nullable(),
    Country: z.string(),
    ZipPostalCode: z.string(),
    PIC_Name: z.string(),
    PIC_Email: z.string(),
    PIC_Phone: z.string(),
})

export function ContactEdit({ contactID, onUpdate }) {
  const [open, setOpen] = React.useState(false)

  const contactQuery = useQuery({
    queryKey: ["contact", contactID],
    enabled: open && !!contactID,
    queryFn: async () => {
      const res = await ApiCustomer.get(`/api/contact-information/${contactID}`)
      return res.data.data
    },
  })
  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        Salutation: values?.Salutation,
        FirstName: values?.FirstName,
        LastName: values?.LastName,
        Email: values?.Email,
        PreferredLanguage: values?.PreferredLanguage,
        SiteAccountID: values?.Companys?.SiteAccountID,
        Phone: values?.Phone,
        Mobile: values?.Mobile,
        WorkPhone: values?.WorkPhone,
        WorkExtension: values?.WorkExtension,
        AddressLine1: values?.AddressLine1,
        AddressLine2: values?.AddressLine2,
        City: values?.City?.City,
        StateProvince: values?.Province?.StateProvince,
        Country: values?.Country,
        ZipPostalCode: values?.ZipPostalCode,
        PIC_Name: values?.PIC_Name,
        PIC_Email: values?.PIC_Email,
        PIC_Phone: values?.PIC_Phone,
      }
      await ApiCustomer.patch(`/api/contact-information/${contactID}`, payload)
    },
    onSuccess: () => {
      onUpdate?.()
      setOpen(false)
    },
  })
  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        Salutation: "",
        FirstName: "",
        LastName: "",
        Email: "",
        PreferredLanguage: "",
        Companys: null,
        Phone: "",
        Mobile: "",
        WorkPhone: "",
        WorkExtension: "",
        AddressLine1: "",
        AddressLine2: "",
        City: null,
        Province: null,
        Country: "",
        ZipPostalCode: "",
        PIC_Name: "",
        PIC_Email: "",
        PIC_Phone: "",
    },
    onSubmit: async ({ value }) => {
      const parsed = ContactSchema.safeParse(value)
      if (!parsed.success) {
        return
      }
      await updateMutation.mutateAsync(parsed.data)
    },
  })

  React.useEffect(() => {
    if (!contactQuery.data) return
    const data = contactQuery.data
    form.reset({
        Salutation: data?.Salutation ?? "",
        FirstName: data?.FirstName ?? "",
        LastName: data?.LastName ?? "",
        Email: data?.Email ?? "",
        PreferredLanguage: data?.PreferredLanguage ?? "",
        Companys: data?.SiteAccountID ? { Company: data.site_account.Company, SiteAccountID: data.SiteAccountID } : null,
        Phone: data?.Phone ?? "",
        Mobile: data?.Mobile ?? "",
        WorkPhone: data?.WorkPhone ?? "",
        WorkExtension: data?.WorkExtension ?? "",
        AddressLine1: data?.AddressLine1 ?? "",
        AddressLine2: data?.AddressLine2 ?? "",
        City: data?.City ? { City: data.City } : null,
        Province: data?.StateProvince ? { StateProvince: data.StateProvince } : null,
        Country: data?.Country ?? "",
        ZipPostalCode: data?.ZipPostalCode ?? "",
        PIC_Name: data?.PIC_Name ?? "",
        PIC_Email: data?.PIC_Email ?? "",
        PIC_Phone: data?.PIC_Phone ?? "",
    })
  }, [contactQuery.data])

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Edit Contact Information"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <form.Field name="Salutation">
            {(field) => (
              <TField label="Salutation"  field={field}>
                {({ value, onChange, onBlur }) => (
                    <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field 
            name="FirstName"
            validators={{onChange: ({ value }) => (!value ? "First Name is required" : undefined)}}
          >
            {(field) => (
              <TField label="First Name" required field={field}>
                {({ value, onChange, onBlur }) => (
                   <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field 
            name="LastName"
            validators={{onChange: ({ value }) => (!value ? "Last Name is required" : undefined)}}
          >
            {(field) => (
              <TField label="Last Name" required field={field}>
                {({ value, onChange, onBlur }) => (
                   <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field 
            name="Email"
            validators={{onChange: ({ value }) => (!value ? "Email is required" : undefined)}}
          >
            {(field) => (
              <TField label="Email" required field={field}>
                {({ value, onChange, onBlur }) => (
                   <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="PreferredLanguage">
            {(field) => (
              <TField label="Preferred Language"  field={field}>
                {({ value, onChange, onBlur }) => (
                   <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="Companys">
            {(field) => (
              <TField label="Company"  field={field}>
                {({ value, onChange, onBlur }) => (
                   <AsyncComboboxField
                    value={value}
                    onChange={onChange}
                    labelKey={"Company"}
                    valueKey={"SiteAccountID"}
                    fetcher={async (q) => {
                      const res = await ApiCustomer.get(`/api/site_account`,{params: {q}})
                      const FetchCompany = res.data.data
                      return FetchCompany.map((item) => ({
                        SiteAccountID: item.SiteAccountID,
                        Company: item.Company
                      }))
                    }}
                   
                   />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field 
            name="Phone"
            validators={{ onChange: ({ value }) => (!value ? "Phone is required" : undefined) }}
          >
            {(field) => (
              <TField label="Phone" required field={field}>
                {({ value, onChange, onBlur }) => (
                   <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>
          
          <form.Field name="Mobile">
            {(field) => (
              <TField label="Mobile"  field={field}>
                {({ value, onChange, onBlur }) => (
                   <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="WorkPhone">
            {(field) => (
              <TField label="Work Phone"  field={field}>
                {({ value, onChange, onBlur }) => (
                   <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="WorkExtension">
            {(field) => (
              <TField label="Work Extension"  field={field}>
                {({ value, onChange, onBlur }) => (
                   <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="AddressLine1">
            {(field) => (
              <TField label="Address Line 1"  field={field}>
                {({ value, onChange, onBlur }) => (
                   <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="AddressLine2">
            {(field) => (
              <TField label="Address Line 2"  field={field}>
                {({ value, onChange, onBlur }) => (
                   <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field 
            name="Province"
            validators={{ onChange: ({ value }) => (!value ? "State/Province is required" : undefined) }}
          >
            {(field) => (
              <TField label="State/Province" required field={field}>
                {({ value, onChange }) => (
                  <AsyncComboboxField
                    value={value}
                    onChange={onChange}
                    labelKey={"StateProvince"}
                    valueKey={"StateProvince"}
                    placeholder="Select state/province..."
                    fetcher={async (q) => {
                      const res = await fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json").then((res) => res.json());
                      return res.map((item) => ({ 
                        id: item.id,
                        StateProvince: item.name 
                      }));
                    }}
                  />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field 
            name="City"
            validators={{ onChange: ({ value }) => (!value ? "City is required" : undefined) }} 
          >
            {(field) => (
              <TField label="City" required field={field}>
                {({ value, onChange }) => (
                  <AsyncComboboxField
                    value={value}
                    onChange={onChange}
                    labelKey={"City"}
                    valueKey={"City"}
                    placeholder="Select city..."
                    fetcher={async (q) => {
                      const stateProvince = form.getFieldValue("Province");
                      if (!stateProvince || !stateProvince.id) return [];
                      const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${stateProvince.id}.json`).then((res) => res.json());
                      return res.map((item) => ({ 
                        id: item.id,
                        City: item.name 
                      }));
                    }}
                  />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field 
            name="Country"
            validators={{ onChange: ({ value }) => (!value ? "Country is required" : undefined) }}
          >
            {(field) => (
              <TField label="Country" required field={field}>
                {({ value, onChange, onBlur }) => (
                   <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="ZipPostalCode">
            {(field) => (
              <TField label="Zip/Postal Code"  field={field}>
                {({ value, onChange, onBlur }) => (
                   <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="PIC_Name">
            {(field) => (
              <TField label="PIC Name"  field={field}>
                {({ value, onChange, onBlur }) => (
                   <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="PIC_Email">
            {(field) => (
              <TField label="PIC Email"  field={field}>
                {({ value, onChange, onBlur }) => (
                   <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="PIC_Phone">
            {(field) => (
              <TField label="PIC Phone"  field={field}>
                {({ value, onChange, onBlur }) => (
                   <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>
        </div>

        {/* Optional: show form-level loading state */}
        {contactQuery.isFetching ? <p className="text-sm text-muted-foreground mt-2">Loading contact...</p> : null}
      </FormDialog>
    </>
  )
}
