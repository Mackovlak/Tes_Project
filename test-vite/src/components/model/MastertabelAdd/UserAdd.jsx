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
import { useRef, useState, useEffect } from "react"

// Fungsi pad canvas
function SignaturePad({ value, onChange }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)

  useEffect(() => {
    if (!value) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const img = new Image()
    img.onload = () => ctx.drawImage(img, 0, 0)
    img.src = value
  }, [value])

  const start = (e) => {
    drawing.current = true
    draw(e)
  }

  const end = () => {
    drawing.current = false
    const canvas = canvasRef.current
    onChange(canvas.toDataURL("image/png"))
  }

  const draw = (e) => {
    if (!drawing.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX || e.touches?.[0].clientX) - rect.left
    const y = (e.clientY || e.touches?.[0].clientY) - rect.top

    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.strokeStyle = "#000"

    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    onChange("")
  }

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={320}
        height={100}
        className="border rounded cursor-crosshair touch-none border-black"
        onMouseDown={start}
        onMouseMove={draw}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={draw}
        onTouchEnd={end}
      />
      <button
        type="button"
        onClick={clear}
        className="text-sm text-red-500"
      >
        Clear signature
      </button>
    </div>
  )
}

const UsersSchema = z.object({
    Email: z.string(),
    Username: z.string(),
    Password: z.string(),
    Name: z.string(),
    Role: z.string(),
    Phone: z.string(),
    Resource: z.object({
      ResourceId: z.string(),
      Name: z.string().optional(),
    }),
    ProfilePhoto: z.instanceof(File).optional(),
    Signature: z.string(),
})

export function UserAdd() {
  const [open, setOpen] = React.useState(false)

  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
          Email: values?.Email,
          Username: values?.Username,
          Password: values?.Password,
          Name: values?.Name,
          Role: values?.Role,
          ProfilePhoto: values?.ProfilePhoto,
          Phone: values?.Phone,
          ResourceId: values?.Resource?.ResourceId,
          Signature: values?.Signature,
      }
      await ApiCustomer.post(`/api/user`, payload, {
         headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    },
    onSuccess: () => {
      setOpen(false)
    },
  })
  
  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        Email: "",
        Username: "",
        Password: "",
        Name: "",
        Role: "",
        Resource: null,
        ProfilePhoto: undefined,
        Phone: "",
        Signature: "",
    },
    onSubmit: async ({ value }) => {
      const parsed = UsersSchema.safeParse(value)
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
        title="Adding Users Information"
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
               <form.Field
            name="Email"
            validators={{ onChange: ({ value }) => (!value ? "Email is required" : undefined) }}
          >
            {(field) => (
              <TField label="Email" required field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="Username"
            validators={{ onChange: ({ value }) => (!value ? "Username is required" : undefined) }}
          >
            {(field) => (
              <TField label="Username" required field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="Password"
          >
            {(field) => (
              <TField label="Password" field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input type="password" value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>
          
          <form.Field
            name="Name"
            validators={{ onChange: ({ value }) => (!value ? "Name is required" : undefined) }}
          >
            {(field) => (
              <TField label="Name" required field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="Role"
          >
            {(field) => (
              <TField label="Role" field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="Resource"
          >
            {(field) => (
              <TField label="Resource" field={field}>
                {({ value, onChange, onBlur }) => (
                  <AsyncComboboxField
                    value={value}
                    onChange={onChange}
                    labelKey={"Name"}
                    valueKey={"ResourceId"}
                    placeholder="Search resource..."
                    fetcher={async (q) => {
                      const res = await ApiCustomer.get("/api/resources", { params: { q } })
                      const data = res.data.data ?? []
                      return data.map((item) => ({
                        ResourceId: item.ResourceId,
                        Name: item.Name,
                      }))
                    }}
                />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="ProfilePhoto"
          >
            {(field) => (
              <TField label="Profile Photo"  field={field}>
                {({ onChange, onBlur }) => (
                  <Input type="file" onChange={(e) => {
                    const file = e.target.files?.[0]
                    onChange(file ?? undefined)
                  }} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>
          
          <form.Field
            name="Phone"
          >
            {(field) => (
              <TField label="Phone" field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="Signature"
          >
            {(field) => (
              <TField label="Signature" field={field}>
                {({ value, onChange, onBlur }) => (
                  <SignaturePad value={value} onChange={onChange} />
                )}
              </TField>
            )}
          </form.Field>
        </div>
      </FormDialog>
    </>
  )
}
