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

const ServiceCatalogSchema = z.object({
    WarrantyService: z.object({
        Service_offerID: z.string()
    }),
    // AssetInfo: z.object({
    //     AssetID: z.string()
    // }),
    WarrantyStatus: z.string(),
    // CatalogParts: z.object({
    //     PartNumber: z.string()
    // }),
    Price: z.number(),
    Currency: z.string(),
    Tax: z.number(),
    Total: z.number()
})

export function ServiceCatalogEdit({ ServiceCatalogID, onUpdate }) {
  const [open, setOpen] = React.useState(false)

  const servicecatalogEditQuery = useQuery({
    queryKey: ["servicecatalog", ServiceCatalogID],
    enabled: open && !!ServiceCatalogID,
    queryFn: async () => {
      const res = await ApiCustomer.get(`/api/service-log/${ServiceCatalogID}`)
      return res.data.data
    },
  })
  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
          Service_offerID: values?.WarrantyService?.Service_offerID,
          AssetID: values?.AssetInfo?.AssetID,
          WarrantyStatus: values?.WarrantyStatus,
        //   PartNumber: values?.CatalogParts?.PartNumber,
          Price: Number(values?.Price),
          Currency: values?.Currency,
          Tax: Number(values?.Tax),
          Total: Number(values?.Total),
      }
      await ApiCustomer.patch(`/api/service-log/${ServiceCatalogID}`, payload)
    },
    onSuccess: () => {
      onUpdate?.()
      setOpen(false)
    },
  })
  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        WarrantyService: null,
        AssetInfo: null,
        // CatalogParts: null,
        WarrantyStatus: '',
        Currency: '',
        Price: 0,
        Tax: 0,
        Total: 0,
    },
    onSubmit: async ({ value }) => {
      const parsed = ServiceCatalogSchema.safeParse(value)
      if (!parsed.success) {
        return
      }
      await updateMutation.mutateAsync(parsed.data)
    },
  })

  React.useEffect(() => {
    if (!servicecatalogEditQuery.data) return
    const data = servicecatalogEditQuery.data
    form.reset({
        WarrantyService: data?.Service_offerID ? {Service_offerID: data.Service_offerID} : null,
        AssetInfo: data?.AssetID ? {AssetID: data.AssetID} : null,
        // CatalogParts: data?.PartNumber ? {PartNumber: data.PartNumber} : null,
        WarrantyStatus: data?.WarrantyStatus,
        Currency: data?.Currency,
        Price: data?.Price,
        Tax: data?.Tax,
        Total: data?.Total,
    })
  }, [servicecatalogEditQuery.data])


  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Edit Service Catalog Information"
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
          <form.Field name="WarrantyService" validators={{ required: "Service Offer ID is required" }}>
            {(field) => (
              <TField label="Service Offer ID" required field={field}>
                {({ value, onChange, onBlur }) => (
                    <AsyncComboboxField
                        value={value}
                        onChange={onChange}
                        labelKey={"Service_offerID"}
                        valueKey={"Service_offerID"}
                        fetcher={async (q) => {
                            const res = await ApiCustomer.get("/api/warranty-services", {params: {q}})
                            const data = res.data.data
                            return data.map((item) => ({
                                Service_offerID: item.Service_offerID
                            }))
                        }}
                    />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="AssetInfo" validators={{ required: "Asset ID is required" }}>
            {(field) => (
              <TField label="Asset ID" required field={field}>
                {({ value, onChange, onBlur }) => (
                    <AsyncComboboxField
                        value={value}
                        onChange={onChange}
                        labelKey={"AssetID"}
                        valueKey={"AssetID"}
                        fetcher={async (q) => {
                            const res = await ApiCustomer.get("/api/asset-information", {params: {q}})
                            const data = res.data.data
                            return data.map((item) => ({
                                AssetID: item.AssetID
                            }))
                        }}
                    />
                )}
              </TField>
            )}
          </form.Field>
          
          <form.Field name="WarrantyStatus">
            {(field) => (
              <TField label="Warranty Status" field={field}>
                {({ value, onChange, onBlur }) => (
                    <SearchCommandBlock
                        onChange={onChange}
                        value={value}
                        options={[
                            {label:"In Warranty", value: "InWarranty"},
                            {label:"Out Of Warranty", value: "OutWarranty"},
                        ]}
                    />
                )}
              </TField>
            )}
          </form.Field>
{/* 
           <form.Field name="CatalogParts">
            {(field) => (
              <TField label="Part Number" required field={field}>
                {({ value, onChange, onBlur }) => (
                    <AsyncComboboxField
                        value={value}
                        onChange={onChange}
                        labelKey={"PartNumber"}
                        valueKey={"PartNumber"}
                        fetcher={async (q) => {
                            const res = await ApiCustomer.get("/api/servicecatalog-parts", {params: {q}})
                            const data = res.data.data
                            return data.map((item) => ({
                                PartNumber: item.PartNumber
                            }))
                        }}
                    />
                )}
              </TField>
            )}
          </form.Field> */}

           <form.Field name="Price">
            {(field) => (
              <TField label="Price" field={field}>
                {({ value, onChange, onBlur }) => (
                   <Input type={"Number"} value={value} onChange={(e) => onChange(Number(e.target.value))} onBlur={onBlur}/>
                )}
              </TField>
            )}
          </form.Field>

           <form.Field name="Currency">
            {(field) => (
              <TField label="Currency" field={field}>
                {({ value, onChange, onBlur }) => (
                   <Input  value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}/>
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="Tax">
            {(field) => (
              <TField label="Tax" field={field}>
                {({ value, onChange, onBlur }) => (
                   <Input type={"Number"} value={value} onChange={(e) => onChange(Number(e.target.value))} onBlur={onBlur}/>
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="Total">
            {(field) => (
              <TField label="Total" field={field}>
                {({ value, onChange, onBlur }) => (
                   <Input type={"Number"} value={value} onChange={(e) => onChange(Number(e.target.value))} onBlur={onBlur}/>
                )}
              </TField>
            )}
          </form.Field>
          
        </div>

        {/* Optional: show form-level loading state */}
        {servicecatalogEditQuery.isFetching ? <p className="text-sm text-muted-foreground mt-2">Loading service catalog...</p> : null}
      </FormDialog>
    </>
  )
}
