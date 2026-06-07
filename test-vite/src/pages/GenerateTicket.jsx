import { useEffect, useMemo, useState, useCallback } from "react"
import { debounce } from "lodash-es"
import ApiCustomer from "../api"

// ─── tiny helpers ────────────────────────────────────────────────────────────
const cx = (...s) => s.filter(Boolean).join(" ")

const SALUTATIONS = ["Mr.", "Mrs.", "Ms.", "Dr."]
const TICKET_TYPES = [
  { value: "Perbaikan",        label: "Perbaikan (Repair)",        icon: "🔧" },
  { value: "PengambilanBarang",label: "Pengambilan Barang (Pick-up)", icon: "📦" },
  { value: "OnlineBooking",    label: "Online Booking",            icon: "🌐" },
  { value: "Premium",          label: "Premium / Gaming",          icon: "⭐" },
]

const INITIAL_CONTACT = {
  Salutation: "", FirstName: "", LastName: "",
  Email: "", Phone: "", Mobile: "",
  AddressLine1: "", Country: "Indonesia",
  City: "", StateProvince: "", ZipPostalCode: "",
}
const INITIAL_COMPANY = { Company: "", NPWP: "" }
const INITIAL_PRODUCT = { SerialNumber: "", ProductNumber: "", ProblemDescription: "" }

// ─── Reusable Tailwind Classes ─────────────────────────────────────────────────
const tw = {
  input: "w-full rounded-md border border-[#d1cfc7] bg-[#fafaf8] px-3 py-2 text-sm text-[#1a1a18] outline-none transition-all focus:border-[#0096d6] focus:bg-white focus:ring-[3px] focus:ring-[#0096d6]/10 disabled:cursor-not-allowed disabled:bg-[#f0eeea] disabled:text-gray-400 box-border",
  inputError: "!border-red-600 focus:!ring-red-600/10",
  mono: "font-mono text-[13px] tracking-wide",
  radioGroup: "flex flex-wrap gap-1.5",
  radioPill: "inline-flex cursor-pointer items-center rounded-full border border-[#d1cfc7] bg-[#fafaf8] px-3.5 py-1.5 text-[13px] transition-all hover:border-gray-400 hover:bg-[#f5f4f0]",
  radioPillActive: "!border-[#0096d6] !bg-[#e6f5fe] font-medium !text-[#0067a0]",
  btn: "inline-flex cursor-pointer items-center gap-1 rounded-md border border-transparent px-5 py-2 text-sm font-medium transition-all",
  btnGhost: "border-[#d1cfc7] bg-white text-gray-600 hover:bg-[#f5f4f0]",
  btnPrimary: "bg-[#0e1a2b] text-white hover:bg-[#1b2f47]",
  btnSubmit: "bg-[#0096d6] text-white hover:bg-[#007ab8] disabled:cursor-not-allowed disabled:opacity-60",
}

// ─── sub-components ──────────────────────────────────────────────────────────
const Field = ({ label, required, children, error }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-700">
      {label}
      {required && <span className="ml-0.5 text-red-600" aria-label="required">*</span>}
    </label>
    {children}
    {error && <p className="m-0 text-[11px] text-red-600" role="alert">{error}</p>}
  </div>
)

const StepIndicator = ({ current, total }) => (
  <div className="flex items-center gap-1.5" role="progressbar" aria-valuenow={current} aria-valuemax={total}>
    {Array.from({ length: total }, (_, i) => (
      <div key={i} className={cx(
        "h-2 w-2 rounded-full transition-colors",
        i + 1 === current ? "bg-[#0096d6]" : i + 1 < current ? "bg-[#0096d6] opacity-40" : "bg-[#d1cfc7]"
      )} />
    ))}
    <span className="ml-1 text-[11px] text-gray-400">Step {current} of {total}</span>
  </div>
)

const CustomerCard = ({ contact, isSelected, onClick }) => (
  <button
    type="button"
    className={cx(
      "relative flex w-full cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
      isSelected ? "border-[#0096d6] bg-[#e6f5fe]" : "border-[#e2e0d8] bg-[#fafaf8] hover:border-[#0096d6] hover:bg-[#f0f9ff]"
    )}
    onClick={onClick}
    aria-pressed={isSelected}
  >
    <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#0e1a2b] text-[13px] font-semibold text-white">
      {(contact.FirstName?.[0] ?? "?").toUpperCase()}
    </div>
    <div className="min-w-0 flex-1">
      <p className="m-0 truncate text-[13px] font-medium">{contact.FirstName} {contact.LastName}</p>
      <p className="mt-[1px] m-0 text-[11px] text-gray-500">{contact.Email || contact.Phone || "—"}</p>
      {contact.site_account?.Company && (
        <span className="mt-0.5 inline-block rounded-full bg-[#e6f5fe] px-1.5 py-[1px] text-[10px] font-medium text-[#0067a0]">
          {contact.site_account.Company}
        </span>
      )}
    </div>
    {isSelected && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-[#0096d6]" aria-hidden="true">✓</span>}
  </button>
)

const CompanyCard = ({ company, isSelected, onClick }) => (
  <button
    type="button"
    className={cx(
      "relative flex w-full cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
      isSelected ? "border-[#0096d6] bg-[#e6f5fe]" : "border-[#e2e0d8] bg-[#fafaf8] hover:border-[#0096d6] hover:bg-[#f0f9ff]"
    )}
    onClick={onClick}
    aria-pressed={isSelected}
  >
    <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-md bg-[#0096d6] text-[13px] font-semibold text-white">
      {(company.Company?.[0] ?? "C").toUpperCase()}
    </div>
    <div className="min-w-0 flex-1">
      <p className="m-0 truncate text-[13px] font-medium">{company.Company}</p>
      <p className="mt-[1px] m-0 text-[11px] text-gray-500">{[company.City, company.Country].filter(Boolean).join(", ") || "—"}</p>
    </div>
    {isSelected && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-[#0096d6]" aria-hidden="true">✓</span>}
  </button>
)

const TicketTypeCard = ({ type, isSelected, onClick }) => (
  <button
    type="button"
    className={cx(
      "relative flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border px-2.5 py-3.5 text-center transition-all",
      isSelected ? "border-[#0096d6] bg-[#e6f5fe]" : "border-[#d1cfc7] bg-[#fafaf8] hover:border-gray-400 hover:bg-[#f5f4f0]"
    )}
    onClick={onClick}
    aria-pressed={isSelected}
  >
    <span className="text-2xl" aria-hidden="true">{type.icon}</span>
    <span className="text-[11px] font-medium leading-[1.3] text-gray-800">{type.label}</span>
    {isSelected && <span className="absolute right-2 top-2 text-xs text-[#0096d6]" aria-hidden="true">✓</span>}
  </button>
)

const Alert = ({ type = "info", children }) => {
  const typeStyles = {
    warning: "border-[#f5d88c] bg-[#fff8e6] text-[#7a4f00]",
    error: "border-[#f5c5c5] bg-[#fdf0ef] text-[#8b1a1a]",
    info: "border-[#b3dcf5] bg-[#e6f5fe] text-[#00467a]",
  }
  return (
    <div className={cx("mt-2 rounded-lg border px-3 py-2 text-[13px]", typeStyles[type])} role="alert">
      {children}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────
export const GenerateTicket = () => {
  const [step, setStep] = useState(1)
  const TOTAL_STEPS = 3

  // search
  const [customerQuery, setCustomerQuery] = useState("")
  const [contacts, setContacts] = useState([])
  const [companys, setCompanys]   = useState([])
  const [searchStatus, setSearchStatus] = useState("idle") // idle | loading | notfound

  // selection
  const [selectedContact, setSelectedContact] = useState(null)
  const [selectedCompany, setSelectedCompany] = useState(null)

  // mode
  const [isNewContact, setIsNewContact] = useState(false)
  const [showCompany, setShowCompany]   = useState(false)

  // form
  const [contact, setContact] = useState(INITIAL_CONTACT)
  const [company, setCompany] = useState(INITIAL_COMPANY)
  const [product, setProduct] = useState(INITIAL_PRODUCT)
  const [ticketType, setTicketType] = useState(null)
  const [caseId, setCaseId]         = useState("")
  const [bookingNo, setBookingNo]   = useState("")

  // validation errors
  const [errors, setErrors] = useState({})

  // geo
  const [provinces, setProvinces] = useState([])
  const [cities, setCities]       = useState([])

  // submission
  const [submitStatus, setSubmitStatus] = useState("idle") // idle | loading | success | error
  const [ticketResult, setTicketResult] = useState(null)

  // ── helpers ──
  const patchContact = useCallback((field) => (e) =>
    setContact(p => ({ ...p, [field]: typeof e === "string" ? e : e.target.value })), [])
  const patchCompany = useCallback((field) => (e) =>
    setCompany(p => ({ ...p, [field]: typeof e === "string" ? e : e.target.value })), [])
  const patchProduct = useCallback((field) => (e) =>
    setProduct(p => ({ ...p, [field]: typeof e === "string" ? e : e.target.value })), [])

  // ── search ──
  const searchCustomer = useMemo(() => debounce(async (q) => {
    if (!q || q.length < 2) {
      setContacts([]); setCompanys([]); setSearchStatus("idle"); return
    }
    setSearchStatus("loading")
    try {
      const [{ data: cd }, { data: sd }] = await Promise.all([
        ApiCustomer.get("/api/contact-information", { params: { search: q } }),
        ApiCustomer.get("/api/site_account",         { params: { search: q } }),
      ])
      setContacts(cd.data ?? [])
      setCompanys(sd.data ?? [])
      setSearchStatus(cd.data?.length === 0 && sd.data?.length === 0 ? "notfound" : "found")
    } catch {
      setSearchStatus("notfound")
    }
  }, 400), [])

  // ── geo ──
  useEffect(() => {
    fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json")
      .then(r => r.json()).then(setProvinces).catch(() => {})
  }, [])

  useEffect(() => {
    const prov = provinces.find(p => p.name === contact.StateProvince)
    if (!prov?.id) { setCities([]); return }
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${prov.id}.json`)
      .then(r => r.json()).then(setCities).catch(() => {})
  }, [contact.StateProvince, provinces])

  // ── sync selected → form ──
  useEffect(() => {
    if (selectedContact) setContact(prev => ({ ...prev, ...selectedContact }))
  }, [selectedContact])

  useEffect(() => {
    if (selectedCompany) setCompany(prev => ({ ...prev, ...selectedCompany }))
  }, [selectedCompany])

  // ── auto-fetch company when contact selected ──
  useEffect(() => {
    if (!selectedContact?.SiteAccountID) {
      setShowCompany(false); setSelectedCompany(null)
      setCompany(INITIAL_COMPANY); return
    }
    setShowCompany(true)
    ApiCustomer.get(`/api/site_account/${selectedContact.SiteAccountID}`)
      .then(r => { if (r.data?.data) setSelectedCompany(r.data.data) })
      .catch(() => {})
  }, [selectedContact])

  // ── validation ──
  const validateStep = (s) => {
    const e = {}
    if (s === 1) {
      if (!contact.Salutation) e.Salutation = "Salutation is required"
      if (!contact.FirstName.trim()) e.FirstName = "First name is required"
      if (!contact.LastName.trim())  e.LastName  = "Last name is required"
      if (!contact.Phone.trim())     e.Phone     = "Phone number is required"
      if (showCompany && !company.Company.trim()) e.Company = "Company name is required"
    }
    if (s === 2) {
      if (!contact.Email.trim())        e.Email    = "Email is required"
      if (!/\S+@\S+\.\S+/.test(contact.Email)) e.Email = "Enter a valid email"
      if (!contact.AddressLine1.trim()) e.Address  = "Address is required"
      if (!contact.StateProvince)       e.Province = "Province is required"
      if (!contact.City)                e.City     = "City is required"
    }
    if (s === 3) {
      if (!product.SerialNumber.trim())        e.Serial  = "Serial number is required"
      if (!product.ProblemDescription.trim())  e.Problem = "Problem description is required"
      if (!ticketType)                         e.Type    = "Please select a ticket type"
      if (ticketType === "PengambilanBarang" && !caseId.trim())  e.CaseId    = "Case ID is required"
      if (ticketType === "OnlineBooking"     && !bookingNo.trim()) e.Booking  = "Booking number is required"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const goNext = () => { if (validateStep(step)) setStep(s => s + 1) }
  const goPrev = () => { setStep(s => s - 1); setErrors({}) }

  // ── submit ──
  const handleSubmit = async () => {
    if (!validateStep(3)) return
    setSubmitStatus("loading")
    try {
      const payload = {
        contact: isNewContact ? contact : { ContactID: selectedContact?.ContactID },
        company: (isNewContact && showCompany) ? company : { SiteAccountID: selectedCompany?.SiteAccountID },
        product,
        ticketType,
        ...(ticketType === "PengambilanBarang" && { caseId }),
        ...(ticketType === "OnlineBooking"     && { bookingNo }),
      }
      const res = await ApiCustomer.post("/api/tickets", payload)
      setTicketResult(res.data?.data)
      setSubmitStatus("success")
    } catch {
      setSubmitStatus("error")
    }
  }

  // ─── render ──────────────────────────────────────────────────────────────────
  if (submitStatus === "success") {
    return (
      <div className="min-h-screen bg-[#f5f4f0] font-sans text-[#1a1a18]">
        <div className="mx-auto my-16 max-w-[400px] rounded-2xl border border-[#e2e0d8] bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#0096d6] text-[28px] text-white" aria-hidden="true">✓</div>
          <h2 className="m-0 mb-2 text-xl font-semibold">Ticket Created!</h2>
          <p className="m-0 text-[15px] text-gray-800">Ticket ID: <strong>{ticketResult?.TicketNumber ?? "—"}</strong></p>
          <p className="mb-6 mt-1 text-[13px] text-gray-500">A confirmation will be sent to <strong>{contact.Email}</strong></p>
          <button className={tw.btnPrimary + " " + tw.btn} onClick={() => {
            setSubmitStatus("idle"); setStep(1)
            setContact(INITIAL_CONTACT); setCompany(INITIAL_COMPANY); setProduct(INITIAL_PRODUCT)
            setSelectedContact(null); setSelectedCompany(null)
            setTicketType(null); setCaseId(""); setBookingNo(""); setCustomerQuery("")
            setContacts([]); setCompanys([])
          }}>
            Create Another Ticket
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f4f0] font-sans text-[#1a1a18]">
      {/* ── header ── */}
      <header className="sticky top-0 z-10 flex items-center gap-4 bg-[#0e1a2b] px-6 py-4 text-white">
        <img src="/white_hp.png"
          className="w-3/4 max-w-[60px] object-contain " 
      />
        <div>
          <h1 className="m-0 text-base font-semibold">HP Service Center</h1>
          {/* <p className="m-0 text-xs opacity-60">Kota Kasablanka · Ticket Generation</p> */}
        </div>
      </header>

      <main className="mx-auto flex max-w-[720px] flex-col gap-4 px-4 pb-16 pt-6">

        {/* ── SECTION 1: search ── */}
        <section className="rounded-xl border border-[#e2e0d8] bg-white p-5" aria-label="Customer search">
          <h2 className="mb-4 text-[15px] font-semibold tracking-wide text-[#0e1a2b]">Find Customer</h2>

          <div className="relative mb-3 flex items-center">
            <span className="pointer-events-none absolute left-2.5 text-sm" aria-hidden="true">🔍</span>
            <input
              type="search"
              className={cx(tw.input, "pl-8")}
              placeholder="Search by name, email, phone, or company…"
              value={customerQuery}
              aria-label="Search customers"
              onChange={e => { setCustomerQuery(e.target.value); searchCustomer(e.target.value) }}
            />
            {searchStatus === "loading" && <span className="absolute right-2.5 h-4 w-4 animate-spin rounded-full border-2 border-[#d1cfc7] border-t-[#0096d6]" aria-label="Searching…" />}
          </div>

          {searchStatus === "notfound" && (
            <Alert type="warning">No customer found. Enable "New Customer" below to create one.</Alert>
          )}

          {/* results grid */}
          {(contacts.length > 0 || companys.length > 0) && (
            <div className="my-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {contacts.length > 0 && (
                <div className="flex flex-col gap-1">
                  <p className="m-0 mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Contacts</p>
                  <div className="flex max-h-[220px] flex-col gap-1 overflow-y-auto">
                    {contacts.map(c => (
                      <CustomerCard
                        key={c.ContactID} contact={c}
                        isSelected={selectedContact?.ContactID === c.ContactID}
                        onClick={() => setSelectedContact(c)}
                      />
                    ))}
                  </div>
                </div>
              )}
              {companys.length > 0 && (
                <div className="flex flex-col gap-1">
                  <p className="m-0 mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Companies</p>
                  <div className="flex max-h-[220px] flex-col gap-1 overflow-y-auto">
                    {companys.map(s => (
                      <CompanyCard
                        key={s.SiteAccountID} company={s}
                        isSelected={selectedCompany?.SiteAccountID === s.SiteAccountID}
                        onClick={() => setSelectedCompany(s)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <label className="mt-2 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isNewContact}
              className="h-4 w-4 cursor-pointer accent-[#0096d6]"
              onChange={e => setIsNewContact(e.target.checked)}
            />
            <span className="text-[13px] text-gray-600">New customer (if not found in search)</span>
          </label>
        </section>

        {/* ── SECTION 2: form ── */}
        <section className="rounded-xl border border-[#e2e0d8] bg-white p-5" aria-label="Customer details form">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="m-0 text-[15px] font-semibold tracking-wide text-[#0e1a2b]">Customer Details</h2>
            <StepIndicator current={step} total={TOTAL_STEPS} />
          </div>

          <label className="mb-5 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={showCompany}
              className="h-4 w-4 cursor-pointer accent-[#0096d6]"
              onChange={e => setShowCompany(e.target.checked)}
            />
            <span className="text-[13px] text-gray-600">Include Company / Perusahaan</span>
          </label>

          {/* ── Step 1: Basic Info ── */}
          {step === 1 && (
            <div className="flex flex-col gap-3.5">
              <Field label="Salutation" required error={errors.Salutation}>
                <div className={tw.radioGroup} role="group" aria-label="Salutation">
                  {SALUTATIONS.map(s => (
                    <label key={s} className={cx(tw.radioPill, contact.Salutation === s && tw.radioPillActive)}>
                      <input type="radio" name="salutation" value={s} className="hidden"
                        checked={contact.Salutation === s}
                        onChange={() => setContact(p => ({ ...p, Salutation: s }))} />
                      {s}
                    </label>
                  ))}
                </div>
              </Field>

              {showCompany && (
                <Field label="Company Name / Nama Perusahaan" required error={errors.Company}>
                  <input className={cx(tw.input, errors.Company && tw.inputError)}
                    value={company.Company} onChange={patchCompany("Company")}
                    placeholder="PT. Example Indonesia" />
                </Field>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="First Name" required error={errors.FirstName}>
                  <input className={cx(tw.input, errors.FirstName && tw.inputError)}
                    value={contact.FirstName} onChange={patchContact("FirstName")}
                    placeholder="Budi" autoComplete="given-name" />
                </Field>
                <Field label="Last Name" required error={errors.LastName}>
                  <input className={cx(tw.input, errors.LastName && tw.inputError)}
                    value={contact.LastName} onChange={patchContact("LastName")}
                    placeholder="Santoso" autoComplete="family-name" />
                </Field>
              </div>

              <Field label="Phone Number / No. Telepon" required error={errors.Phone}>
                <input className={cx(tw.input, errors.Phone && tw.inputError)}
                  type="tel" value={contact.Phone} onChange={patchContact("Phone")}
                  placeholder="+62 21 1234 5678" autoComplete="tel" />
              </Field>

              <Field label="Mobile / WhatsApp">
                <input className={tw.input} type="tel"
                  value={contact.Mobile} onChange={patchContact("Mobile")}
                  placeholder="+62 812 3456 7890" autoComplete="tel" />
              </Field>
            </div>
          )}

          {/* ── Step 2: Address ── */}
          {step === 2 && (
            <div className="flex flex-col gap-3.5">
              <Field label="Email" required error={errors.Email}>
                <input className={cx(tw.input, errors.Email && tw.inputError)}
                  type="email" value={contact.Email} onChange={patchContact("Email")}
                  placeholder="budi@example.com" autoComplete="email" />
              </Field>

              <Field label="Address / Alamat" required error={errors.Address}>
                <input className={cx(tw.input, errors.Address && tw.inputError)}
                  value={contact.AddressLine1} onChange={patchContact("AddressLine1")}
                  placeholder="Jl. Sudirman No. 10" autoComplete="street-address" />
              </Field>

              <Field label="Country / Negara" required>
                <div className={tw.radioGroup} role="group">
                  {["Indonesia", "Other"].map(c => {
                    const isIndo = c === "Indonesia"
                    const isActive = isIndo ? contact.Country === "Indonesia" : contact.Country !== "Indonesia"
                    return (
                      <label key={c} className={cx(tw.radioPill, isActive && tw.radioPillActive)}>
                        <input type="radio" name="country" value={c} className="hidden"
                          checked={isActive}
                          onChange={() => {
                            setContact(p => ({ ...p, Country: isIndo ? "Indonesia" : "", StateProvince: "", City: "" }))
                            setCities([])
                          }} />
                        {c}
                      </label>
                    )
                  })}
                </div>
                {contact.Country !== "Indonesia" && (
                  <input className={cx(tw.input, "mt-2")}
                    value={contact.Country === "Indonesia" ? "" : contact.Country}
                    onChange={patchContact("Country")} placeholder="Country name" />
                )}
              </Field>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Province / Provinsi" required error={errors.Province}>
                  {contact.Country === "Indonesia" ? (
                    <select className={cx(tw.input, "cursor-pointer", errors.Province && tw.inputError)}
                      value={contact.StateProvince}
                      onChange={e => setContact(p => ({ ...p, StateProvince: e.target.value, City: "" }))}>
                      <option value="">Select province…</option>
                      {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  ) : (
                    <input className={cx(tw.input, errors.Province && tw.inputError)}
                      value={contact.StateProvince} onChange={patchContact("StateProvince")}
                      placeholder="Province / State" />
                  )}
                </Field>

                <Field label="City / Kota" required error={errors.City}>
                  {contact.Country === "Indonesia" ? (
                    <select className={cx(tw.input, "cursor-pointer", errors.City && tw.inputError)}
                      value={contact.City}
                      onChange={e => setContact(p => ({ ...p, City: e.target.value }))}
                      disabled={!contact.StateProvince}>
                      <option value="">Select city…</option>
                      {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  ) : (
                    <input className={cx(tw.input, errors.City && tw.inputError)}
                      value={contact.City} onChange={patchContact("City")} placeholder="City" />
                  )}
                </Field>
              </div>

              <Field label="Zip / Postal Code">
                <input className={tw.input} value={contact.ZipPostalCode}
                  onChange={patchContact("ZipPostalCode")} placeholder="12345" autoComplete="postal-code" />
              </Field>
            </div>
          )}

          {/* ── Step 3: Product & Ticket ── */}
          {step === 3 && (
            <div className="flex flex-col gap-3.5">
              {showCompany && (
                <Field label="NPWP">
                  <input className={tw.input} value={company.NPWP}
                    onChange={patchCompany("NPWP")} placeholder="00.000.000.0-000.000" />
                </Field>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Serial Number" required error={errors.Serial}>
                  <input className={cx(tw.input, tw.mono, errors.Serial && tw.inputError)}
                    value={product.SerialNumber} onChange={patchProduct("SerialNumber")}
                    placeholder="5CD1234XYZ" />
                </Field>
                <Field label="Product Number">
                  <input className={cx(tw.input, tw.mono)}
                    value={product.ProductNumber} onChange={patchProduct("ProductNumber")}
                    placeholder="HP-ENVY-X360" />
                </Field>
              </div>

              <Field label="Problem Description / Jenis Kerusakan" required error={errors.Problem}>
                <textarea className={cx(tw.input, "min-h-[90px] resize-y", errors.Problem && tw.inputError)}
                  value={product.ProblemDescription} onChange={patchProduct("ProblemDescription")}
                  placeholder="Describe the issue in detail…" rows={4} />
              </Field>

              <Field label="Ticket Type" required error={errors.Type}>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {TICKET_TYPES.map(t => (
                    <TicketTypeCard key={t.value} type={t}
                      isSelected={ticketType === t.value}
                      onClick={() => setTicketType(t.value)} />
                  ))}
                </div>
              </Field>

              {ticketType === "PengambilanBarang" && (
                <Field label="Case ID" required error={errors.CaseId}>
                  <input className={cx(tw.input, tw.mono, errors.CaseId && tw.inputError)}
                    value={caseId} onChange={e => setCaseId(e.target.value)}
                    placeholder="CASE-00001" />
                </Field>
              )}

              {ticketType === "OnlineBooking" && (
                <Field label="Booking Number" required error={errors.Booking}>
                  <input className={cx(tw.input, tw.mono, errors.Booking && tw.inputError)}
                    value={bookingNo} onChange={e => setBookingNo(e.target.value)}
                    placeholder="BK-20240001" />
                </Field>
              )}
            </div>
          )}

          {/* ── nav ── */}
          <div className="mt-5 flex items-center gap-2 border-t border-[#e2e0d8] pt-4">
            {step > 1 && (
              <button type="button" className={cx(tw.btn, tw.btnGhost)} onClick={goPrev}>← Back</button>
            )}
            <div className="flex-1" />
            {step < TOTAL_STEPS ? (
              <button type="button" className={cx(tw.btn, tw.btnPrimary)} onClick={goNext}>Next →</button>
            ) : (
              <button type="button" className={cx(tw.btn, tw.btnSubmit)}
                onClick={handleSubmit} disabled={submitStatus === "loading"}>
                {submitStatus === "loading" ? "Submitting…" : "Generate Ticket ✓"}
              </button>
            )}
          </div>

          {submitStatus === "error" && (
            <Alert type="error">
              Submission failed. Please try again or contact IT support.
            </Alert>
          )}
        </section>

      </main>
    </div>
  )
}
