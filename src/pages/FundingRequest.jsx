import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  FileText,
  HeartHandshake,
  ImagePlus,
  Info,
  Link as LinkIcon,
  Lock,
  MapPin,
  PenLine,
  PlayCircle,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  Video,
  WalletCards,
} from "lucide-react"

const STEPS = [
  { id: 1, label: "Applicant", icon: UserRound },
  { id: 2, label: "Verification", icon: ShieldCheck },
  { id: 3, label: "Project", icon: FileText },
  { id: 4, label: "Budget & Video", icon: WalletCards },
  { id: 5, label: "Declaration", icon: FileCheck2 },
]

const APPLICANT_TYPES = [
  "NGO",
  "Government / Municipal Worker",
  "Student",
  "Community Group",
  "School / College",
  "MRF / Waste Worker",
  "Other",
]

const PROJECT_TYPES = [
  "Tree Plantation",
  "Urban Cleanup",
  "River Restoration",
  "Waste Management",
  "Recycling",
  "Other",
]

const ID_TYPES = [
  "Aadhaar Card",
  "Voter ID",
  "Driving Licence",
  "Passport",
  "PAN Card",
  "Other Government ID",
]

const INITIAL_FORM = {
  fullName: "",
  applicantType: "",
  email: "",
  mobile: "",
  alternateMobile1: "",
  alternateMobile2: "",
  alternateEmail: "",
  fullAddress: "",
  city: "",
  state: "",
  organizationName: "",
  organizationRegistration: "",

  idType: "",
  idNumber: "",

  projectType: "",
  projectTitle: "",
  amountRequested: "",
  expectedBeneficiaries: "",
  exactLocation: "",
  startDate: "",
  completionDate: "",
  detailedReason: "",
  fundUsage: "",

  previousWorkDetails: "",
  previousFundingReceived: "",
  previousResults: "",
  socialLinks: "",

  videoDriveLink: "",
  budgetItems: [
    { item: "", description: "", amount: "" },
  ],

  remainingAmountDeclaration: "",
  finalImpactPlan: "",

  declarationAccepted: false,
}

const REQUIRED_BY_STEP = {
  1: [
    ["fullName", "Full name"],
    ["applicantType", "Applicant type"],
    ["email", "Email"],
    ["mobile", "Mobile number"],
    ["fullAddress", "Full address"],
    ["city", "City"],
    ["state", "State"],
  ],
  2: [
    ["idType", "ID type"],
    ["idNumber", "ID number"],
  ],
  3: [
    ["projectType", "Project type"],
    ["projectTitle", "Project title"],
    ["amountRequested", "Amount requested"],
    ["expectedBeneficiaries", "Expected beneficiaries"],
    ["exactLocation", "Exact project location"],
    ["startDate", "Start date"],
    ["completionDate", "Expected completion date"],
    ["detailedReason", "Detailed reason"],
    ["fundUsage", "Fund usage details"],
  ],
  4: [
    ["videoDriveLink", "Project explanation video"],
  ],
}

const LOCAL_KEY = "eco_clean_hub_funding_requests"
const DRAFT_KEY = "eco_clean_hub_funding_request_draft"

function getCurrentUserKey() {
  try {
    const rawUser = localStorage.getItem("eco_clean_hub_user")

    if (rawUser) {
      const parsed = JSON.parse(rawUser)
      return parsed?.uid || parsed?.email || "guest"
    }
  } catch {
    // Ignore invalid local user data.
  }

  return "guest"
}

function createRequestId() {
  const date = new Date()
  const datePart = date
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "")

  const randomPart = Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()

  return `GFR-${datePart}-${randomPart}`
}

function FieldLabel({ children, required = false }) {
  return (
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {children}
      {required && (
        <span className="ml-1 text-red-500">*</span>
      )}
    </label>
  )
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <FieldLabel required={required}>
        {label}
      </FieldLabel>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0b8f4d] focus:ring-4 focus:ring-[#0b8f4d]/10"
      />
    </div>
  )
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 5,
}) {
  return (
    <div>
      <FieldLabel required={required}>
        {label}
      </FieldLabel>

      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0b8f4d] focus:ring-4 focus:ring-[#0b8f4d]/10"
      />
    </div>
  )
}

function SelectInput({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <FieldLabel required={required}>
        {label}
      </FieldLabel>

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition focus:border-[#0b8f4d] focus:ring-4 focus:ring-[#0b8f4d]/10"
        >
          <option value="">
            {placeholder || "Select an option"}
          </option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={17}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  )
}

function FileUpload({
  label,
  required = false,
  accept,
  file,
  onChange,
  hint,
}) {
  const inputRef = useRef(null)

  return (
    <div>
      <FieldLabel required={required}>
        {label}
      </FieldLabel>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-left transition hover:border-[#0b8f4d] hover:bg-[#f7fcf9]"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e9f7ef] text-[#0b8f4d]">
          {file ? (
            <Check size={20} />
          ) : (
            <Upload size={20} />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-slate-700">
            {file?.name || "Choose file"}
          </span>

          <span className="mt-1 block text-xs text-slate-400">
            {file
              ? `${Math.round(file.size / 1024)} KB selected`
              : hint || "Click to select a file"}
          </span>
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(event) =>
          onChange(event.target.files?.[0] || null)
        }
        className="hidden"
      />
    </div>
  )
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e9f7ef] text-[#0b8f4d]">
        <Icon size={21} />
      </div>

      <div>
        <h2 className="text-xl font-bold text-[#14231a]">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  )
}

function FundingRequest() {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState(INITIAL_FORM)
  const [files, setFiles] = useState({
    profilePhoto: null,
    identityCard: null,
    applicantPhoto: null,
    organizationProof: null,
    previousWorkProof: null,
    previousWorkPhotos: [],
    thumbImpression: null,
    projectVideo: null,
    invoices: [],
    beforeAfterPhotos: [],
    completionProof: null,
  })

  const [thumbSide, setThumbSide] = useState("Right")
  const [signature, setSignature] = useState("")
  const [drawing, setDrawing] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(null)

  const canvasRef = useRef(null)

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))

    setError("")
  }

  const updateFile = (field, file) => {
    setFiles((previous) => ({
      ...previous,
      [field]: file,
    }))

    setError("")
  }

  const updateMultipleFiles = (field, fileList) => {
    setFiles((previous) => ({
      ...previous,
      [field]: Array.from(fileList || []),
    }))

    setError("")
  }

  const updateBudgetItem = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      budgetItems: previous.budgetItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }))
  }

  const addBudgetItem = () => {
    setForm((previous) => ({
      ...previous,
      budgetItems: [
        ...previous.budgetItems,
        {
          item: "",
          description: "",
          amount: "",
        },
      ],
    }))
  }

  const removeBudgetItem = (index) => {
    setForm((previous) => ({
      ...previous,
      budgetItems:
        previous.budgetItems.length === 1
          ? previous.budgetItems
          : previous.budgetItems.filter(
              (_, itemIndex) => itemIndex !== index
            ),
    }))
  }

  const getCanvasPosition = (event) => {
    const canvas = canvasRef.current

    if (!canvas) {
      return null
    }

    const rect = canvas.getBoundingClientRect()

    const clientX =
      event.touches?.[0]?.clientX ??
      event.clientX

    const clientY =
      event.touches?.[0]?.clientY ??
      event.clientY

    return {
      x:
        ((clientX - rect.left) / rect.width) *
        canvas.width,
      y:
        ((clientY - rect.top) / rect.height) *
        canvas.height,
    }
  }

  const startSignature = (event) => {
    event.preventDefault()

    const canvas = canvasRef.current
    const position = getCanvasPosition(event)

    if (!canvas || !position) {
      return
    }

    const context = canvas.getContext("2d")

    context.beginPath()
    context.moveTo(position.x, position.y)

    setDrawing(true)
  }

  const drawSignature = (event) => {
    if (!drawing) {
      return
    }

    event.preventDefault()

    const canvas = canvasRef.current
    const position = getCanvasPosition(event)

    if (!canvas || !position) {
      return
    }

    const context = canvas.getContext("2d")

    context.lineWidth = 2.5
    context.lineCap = "round"
    context.lineJoin = "round"
    context.strokeStyle = "#14231a"

    context.lineTo(position.x, position.y)
    context.stroke()

    setSignature(canvas.toDataURL("image/png"))
  }

  const endSignature = () => {
    setDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const context = canvas.getContext("2d")

    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    )

    setSignature("")
  }

  const validateStep = (targetStep = step) => {
    const requiredFields =
      REQUIRED_BY_STEP[targetStep] || []

    for (const [field, label] of requiredFields) {
      if (!String(form[field] || "").trim()) {
        setError(`${label} is required.`)
        return false
      }
    }

    if (targetStep === 1) {
      if (
        !/^\S+@\S+\.\S+$/.test(
          form.email.trim()
        )
      ) {
        setError("Please enter a valid email address.")
        return false
      }

      if (
        form.mobile.replace(/\D/g, "").length < 10
      ) {
        setError("Please enter a valid mobile number.")
        return false
      }
    }

    if (targetStep === 2) {
      if (!files.identityCard) {
        setError("Identity-card upload is required.")
        return false
      }

      if (!files.applicantPhoto) {
        setError("Applicant photo is required.")
        return false
      }

      if (!signature) {
        setError("Digital signature is required.")
        return false
      }

      if (!files.thumbImpression) {
        setError("Thumb impression is required.")
        return false
      }
    }

    if (targetStep === 3) {
      if (
        Number(form.amountRequested) <= 0
      ) {
        setError("Enter a valid funding amount.")
        return false
      }

      if (
        new Date(form.completionDate) <
        new Date(form.startDate)
      ) {
        setError(
          "Expected completion date cannot be before the start date."
        )
        return false
      }
    }

    if (targetStep === 4) {
      if (
        !form.videoDriveLink.trim() &&
        !files.projectVideo
      ) {
        setError(
          "Add a Google Drive video link or upload a project video."
        )
        return false
      }
    }

    setError("")
    return true
  }

  const goNext = () => {
    if (!validateStep(step)) {
      return
    }

    setStep((previous) =>
      Math.min(previous + 1, STEPS.length)
    )

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const goBack = () => {
    setError("")

    setStep((previous) =>
      Math.max(previous - 1, 1)
    )

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const saveDraft = () => {
    try {
      const draft = {
        form,
        thumbSide,
        signature,
        files: {
          profilePhoto: files.profilePhoto?.name || "",
          identityCard: files.identityCard?.name || "",
          applicantPhoto: files.applicantPhoto?.name || "",
          organizationProof:
            files.organizationProof?.name || "",
          previousWorkProof:
            files.previousWorkProof?.name || "",
          previousWorkPhotos:
            files.previousWorkPhotos.map(
              (file) => file.name
            ),
          thumbImpression:
            files.thumbImpression?.name || "",
          projectVideo:
            files.projectVideo?.name || "",
        },
        savedAt: new Date().toISOString(),
      }

      localStorage.setItem(
        `${DRAFT_KEY}_${getCurrentUserKey()}`,
        JSON.stringify(draft)
      )

      setError("")
      window.alert(
        "Funding request draft saved on this device."
      )
    } catch {
      setError("Unable to save the draft.")
    }
  }

  const submitRequest = () => {
    if (!validateStep(4)) {
      return
    }

    if (!form.declarationAccepted) {
      setError(
        "You must accept the declaration before submitting."
      )
      return
    }

    if (!signature) {
      setError("Digital signature is required.")
      setStep(2)
      return
    }

    if (!files.thumbImpression) {
      setError("Thumb impression is required.")
      setStep(2)
      return
    }

    const requestId = createRequestId()

    const request = {
      requestId,
      status: "Pending",
      createdAt: new Date().toISOString(),
      applicant: {
        fullName: form.fullName,
        applicantType: form.applicantType,
        email: form.email,
        mobile: form.mobile,
        alternateMobile1:
          form.alternateMobile1,
        alternateMobile2:
          form.alternateMobile2,
        alternateEmail:
          form.alternateEmail,
        fullAddress: form.fullAddress,
        city: form.city,
        state: form.state,
        organizationName:
          form.organizationName,
        organizationRegistration:
          form.organizationRegistration,
      },
      verification: {
        idType: form.idType,
        idNumber: form.idNumber,
        thumbSide,
        signature,
        files: {
          profilePhoto:
            files.profilePhoto?.name || "",
          identityCard:
            files.identityCard?.name || "",
          applicantPhoto:
            files.applicantPhoto?.name || "",
          organizationProof:
            files.organizationProof?.name || "",
          previousWorkProof:
            files.previousWorkProof?.name || "",
          thumbImpression:
            files.thumbImpression?.name || "",
        },
      },
      project: {
        projectType: form.projectType,
        projectTitle: form.projectTitle,
        amountRequested:
          Number(form.amountRequested),
        expectedBeneficiaries:
          form.expectedBeneficiaries,
        exactLocation:
          form.exactLocation,
        startDate: form.startDate,
        completionDate:
          form.completionDate,
        detailedReason:
          form.detailedReason,
        fundUsage:
          form.fundUsage,
      },
      previousWork: {
        details: form.previousWorkDetails,
        fundingReceived:
          form.previousFundingReceived,
        results: form.previousResults,
        socialLinks: form.socialLinks,
        proofFiles:
          files.previousWorkPhotos.map(
            (file) => file.name
          ),
      },
      budget: form.budgetItems,
      video: {
        driveLink:
          form.videoDriveLink,
        uploadedFile:
          files.projectVideo?.name || "",
      },
      declaration: {
        accepted:
          form.declarationAccepted,
        remainingAmount:
          form.remainingAmountDeclaration,
        finalImpactPlan:
          form.finalImpactPlan,
      },
    }

    try {
      const existing = JSON.parse(
        localStorage.getItem(LOCAL_KEY) || "[]"
      )

      localStorage.setItem(
        LOCAL_KEY,
        JSON.stringify([
          ...existing,
          request,
        ])
      )

      localStorage.removeItem(
        `${DRAFT_KEY}_${getCurrentUserKey()}`
      )

      setSuccess(request)
      setError("")
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    } catch {
      setError(
        "Unable to submit the request on this device."
      )
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#f6faf7] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-3xl border border-green-100 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e9f7ef] text-[#0b8f4d]">
              <CheckCircle2 size={42} />
            </div>

            <p className="mt-7 text-sm font-bold uppercase tracking-[0.16em] text-[#0b8f4d]">
              Request Submitted
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#14231a] sm:text-4xl">
              Green Fund request received
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500">
              Your funding request has been saved with a
              Pending status. An authorized reviewer can
              verify the submitted information and documents.
            </p>

            <div className="mx-auto mt-7 max-w-sm rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Request ID
              </p>

              <p className="mt-2 text-xl font-black tracking-wide text-[#0b8f4d]">
                {success.requestId}
              </p>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-amber-600">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Pending Review
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl bg-[#0b8f4d] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#087b42]"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6faf7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-5 inline-flex items-center gap-3 text-base font-medium text-[#405775] transition hover:text-[#176b45]"
        >
          <ArrowLeft size={22} />
          <span>Back to Dashboard</span>
        </button>

        <div className="mb-8 overflow-hidden rounded-3xl bg-[#123d29] p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-green-100">
                <HeartHandshake size={15} />
                Green Fund
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Funding Request
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-green-50/80">
                Request environmental project funding by
                submitting your applicant details, verification
                documents, project plan, budget and impact
                information for admin review.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 lg:max-w-xs">
              <Lock
                size={22}
                className="shrink-0 text-green-200"
              />

              <p className="text-xs leading-5 text-green-50/80">
                Identity documents, signatures and thumb
                impressions should only be accessible to
                authorized reviewers.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-7 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex min-w-[680px] items-center">
            {STEPS.map((item, index) => {
              const Icon = item.icon
              const active = item.id === step
              const completed = item.id < step

              return (
                <div
                  key={item.id}
                  className="flex flex-1 items-center"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={[
                        "flex h-10 w-10 items-center justify-center rounded-xl transition",
                        active || completed
                          ? "bg-[#0b8f4d] text-white"
                          : "bg-slate-100 text-slate-400",
                      ].join(" ")}
                    >
                      {completed ? (
                        <Check size={18} />
                      ) : (
                        <Icon size={18} />
                      )}
                    </div>

                    <div className="hidden sm:block">
                      <p
                        className={[
                          "text-xs font-bold",
                          active
                            ? "text-[#0b8f4d]"
                            : "text-slate-400",
                        ].join(" ")}
                      >
                        STEP {item.id}
                      </p>

                      <p
                        className={[
                          "text-sm font-semibold",
                          active
                            ? "text-slate-800"
                            : "text-slate-500",
                        ].join(" ")}
                      >
                        {item.label}
                      </p>
                    </div>
                  </div>

                  {index < STEPS.length - 1 && (
                    <div
                      className={[
                        "mx-3 h-px flex-1",
                        item.id < step
                          ? "bg-[#0b8f4d]"
                          : "bg-slate-200",
                      ].join(" ")}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            <Info size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {step === 1 && (
            <div>
              <SectionHeader
                icon={UserRound}
                title="Applicant Details"
                description="Tell us who is requesting the Green Fund and how we can contact you."
              />

              <div className="grid gap-5 md:grid-cols-2">
                <TextInput
                  label="Full name"
                  required
                  value={form.fullName}
                  onChange={(event) =>
                    updateField(
                      "fullName",
                      event.target.value
                    )
                  }
                  placeholder="Enter full name"
                />

                <SelectInput
                  label="Applicant type"
                  required
                  value={form.applicantType}
                  onChange={(event) =>
                    updateField(
                      "applicantType",
                      event.target.value
                    )
                  }
                  options={APPLICANT_TYPES}
                  placeholder="Select applicant type"
                />

                <TextInput
                  label="Email"
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField(
                      "email",
                      event.target.value
                    )
                  }
                  placeholder="name@example.com"
                />

                <TextInput
                  label="Mobile number"
                  required
                  type="tel"
                  value={form.mobile}
                  onChange={(event) =>
                    updateField(
                      "mobile",
                      event.target.value
                    )
                  }
                  placeholder="10-digit mobile number"
                />

                <TextInput
                  label="Alternate mobile 1"
                  type="tel"
                  value={form.alternateMobile1}
                  onChange={(event) =>
                    updateField(
                      "alternateMobile1",
                      event.target.value
                    )
                  }
                  placeholder="Optional alternate number"
                />

                <TextInput
                  label="Alternate mobile 2"
                  type="tel"
                  value={form.alternateMobile2}
                  onChange={(event) =>
                    updateField(
                      "alternateMobile2",
                      event.target.value
                    )
                  }
                  placeholder="Optional alternate number"
                />

                <TextInput
                  label="Alternate email"
                  type="email"
                  value={form.alternateEmail}
                  onChange={(event) =>
                    updateField(
                      "alternateEmail",
                      event.target.value
                    )
                  }
                  placeholder="Optional alternate email"
                />

                <TextInput
                  label="Organization name"
                  value={form.organizationName}
                  onChange={(event) =>
                    updateField(
                      "organizationName",
                      event.target.value
                    )
                  }
                  placeholder="NGO / school / group / organization"
                />

                <div className="md:col-span-2">
                  <TextArea
                    label="Full address"
                    required
                    value={form.fullAddress}
                    onChange={(event) =>
                      updateField(
                        "fullAddress",
                        event.target.value
                      )
                    }
                    placeholder="Complete residential or organization address"
                    rows={4}
                  />
                </div>

                <TextInput
                  label="City"
                  required
                  value={form.city}
                  onChange={(event) =>
                    updateField(
                      "city",
                      event.target.value
                    )
                  }
                  placeholder="City"
                />

                <TextInput
                  label="State"
                  required
                  value={form.state}
                  onChange={(event) =>
                    updateField(
                      "state",
                      event.target.value
                    )
                  }
                  placeholder="State"
                />

                <div className="md:col-span-2">
                  <TextInput
                    label="Organization registration details"
                    value={
                      form.organizationRegistration
                    }
                    onChange={(event) =>
                      updateField(
                        "organizationRegistration",
                        event.target.value
                      )
                    }
                    placeholder="Registration number / applicable details, if any"
                  />
                </div>

                <div className="md:col-span-2">
                  <FileUpload
                    label="Profile photo"
                    accept="image/jpeg,image/png,image/webp"
                    file={files.profilePhoto}
                    onChange={(file) =>
                      updateFile(
                        "profilePhoto",
                        file
                      )
                    }
                    hint="JPG, PNG or WebP"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <SectionHeader
                icon={ShieldCheck}
                title="Identity & Verification"
                description="These documents are for verification and should remain restricted to authorized reviewers."
              />

              <div className="mb-6 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                <Lock
                  size={18}
                  className="mt-1 shrink-0"
                />
                <p>
                  Do not publish ID numbers, identity cards,
                  signatures or thumb impressions publicly.
                  They are sensitive verification material.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <SelectInput
                  label="ID type"
                  required
                  value={form.idType}
                  onChange={(event) =>
                    updateField(
                      "idType",
                      event.target.value
                    )
                  }
                  options={ID_TYPES}
                  placeholder="Select ID type"
                />

                <TextInput
                  label="ID number"
                  required
                  value={form.idNumber}
                  onChange={(event) =>
                    updateField(
                      "idNumber",
                      event.target.value
                    )
                  }
                  placeholder="Enter ID number"
                />

                <FileUpload
                  label="Identity-card upload"
                  required
                  accept="image/jpeg,image/png,application/pdf"
                  file={files.identityCard}
                  onChange={(file) =>
                    updateFile(
                      "identityCard",
                      file
                    )
                  }
                  hint="PDF, JPG or PNG"
                />

                <FileUpload
                  label="Applicant photo"
                  required
                  accept="image/jpeg,image/png,image/webp"
                  file={files.applicantPhoto}
                  onChange={(file) =>
                    updateFile(
                      "applicantPhoto",
                      file
                    )
                  }
                  hint="Clear recent photo"
                />

                <FileUpload
                  label="Organization proof"
                  accept="image/jpeg,image/png,application/pdf"
                  file={files.organizationProof}
                  onChange={(file) =>
                    updateFile(
                      "organizationProof",
                      file
                    )
                  }
                  hint="If applicable"
                />

                <FileUpload
                  label="Previous work proof"
                  accept="image/jpeg,image/png,application/pdf"
                  file={files.previousWorkProof}
                  onChange={(file) =>
                    updateFile(
                      "previousWorkProof",
                      file
                    )
                  }
                  hint="Reports, certificates or other proof"
                />

                <div className="md:col-span-2">
                  <div className="mb-2 flex items-center justify-between">
                    <FieldLabel required>
                      Digital signature
                    </FieldLabel>

                    <button
                      type="button"
                      onClick={clearSignature}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                      Clear
                    </button>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <canvas
                      ref={canvasRef}
                      width={1000}
                      height={240}
                      onMouseDown={startSignature}
                      onMouseMove={drawSignature}
                      onMouseUp={endSignature}
                      onMouseLeave={endSignature}
                      onTouchStart={startSignature}
                      onTouchMove={drawSignature}
                      onTouchEnd={endSignature}
                      className="h-48 w-full touch-none cursor-crosshair bg-slate-50"
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Draw your signature inside the box.
                  </p>
                </div>

                <div>
                  <FieldLabel required>
                    Thumb impression side
                  </FieldLabel>

                  <div className="grid grid-cols-2 gap-3">
                    {["Left", "Right"].map((side) => (
                      <button
                        key={side}
                        type="button"
                        onClick={() =>
                          setThumbSide(side)
                        }
                        className={[
                          "rounded-xl border px-4 py-3 text-sm font-bold transition",
                          thumbSide === side
                            ? "border-[#0b8f4d] bg-[#e9f7ef] text-[#0b8f4d]"
                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        {side} Thumb
                      </button>
                    ))}
                  </div>
                </div>

                <FileUpload
                  label={`${thumbSide} thumb impression`}
                  required
                  accept="image/jpeg,image/png,image/webp"
                  file={files.thumbImpression}
                  onChange={(file) =>
                    updateFile(
                      "thumbImpression",
                      file
                    )
                  }
                  hint="Upload a clear thumb impression image"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <SectionHeader
                icon={MapPin}
                title="Project & Funding Details"
                description="Explain exactly what you want to do, where it will happen, when it will happen and why funding is required."
              />

              <div className="grid gap-5 md:grid-cols-2">
                <SelectInput
                  label="Project type"
                  required
                  value={form.projectType}
                  onChange={(event) =>
                    updateField(
                      "projectType",
                      event.target.value
                    )
                  }
                  options={PROJECT_TYPES}
                  placeholder="Select project type"
                />

                <TextInput
                  label="Project title"
                  required
                  value={form.projectTitle}
                  onChange={(event) =>
                    updateField(
                      "projectTitle",
                      event.target.value
                    )
                  }
                  placeholder="Give your project a clear title"
                />

                <TextInput
                  label="Amount requested"
                  required
                  type="number"
                  value={form.amountRequested}
                  onChange={(event) =>
                    updateField(
                      "amountRequested",
                      event.target.value
                    )
                  }
                  placeholder="Enter amount"
                />

                <TextInput
                  label="Expected beneficiaries"
                  required
                  value={
                    form.expectedBeneficiaries
                  }
                  onChange={(event) =>
                    updateField(
                      "expectedBeneficiaries",
                      event.target.value
                    )
                  }
                  placeholder="People / households / community"
                />

                <TextInput
                  label="Exact project location"
                  required
                  value={form.exactLocation}
                  onChange={(event) =>
                    updateField(
                      "exactLocation",
                      event.target.value
                    )
                  }
                  placeholder="Exact location / landmark / area"
                />

                <TextInput
                  label="Start date"
                  required
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    updateField(
                      "startDate",
                      event.target.value
                    )
                  }
                />

                <TextInput
                  label="Expected completion date"
                  required
                  type="date"
                  value={
                    form.completionDate
                  }
                  onChange={(event) =>
                    updateField(
                      "completionDate",
                      event.target.value
                    )
                  }
                />

                <div className="md:col-span-2">
                  <TextArea
                    label="Detailed reason for funding"
                    required
                    value={
                      form.detailedReason
                    }
                    onChange={(event) =>
                      updateField(
                        "detailedReason",
                        event.target.value
                      )
                    }
                    placeholder="Explain the environmental problem, your proposed solution and why funding is needed."
                    rows={6}
                  />
                </div>

                <div className="md:col-span-2">
                  <TextArea
                    label="Exactly how will the money be used?"
                    required
                    value={form.fundUsage}
                    onChange={(event) =>
                      updateField(
                        "fundUsage",
                        event.target.value
                      )
                    }
                    placeholder="Explain what, when, where and how the requested funds will be spent."
                    rows={7}
                  />
                </div>
              </div>

              <div className="my-8 border-t border-slate-100" />

              <SectionHeader
                icon={FileText}
                title="Previous Work"
                description="Previous environmental work helps reviewers understand your experience and results."
              />

              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <TextArea
                    label="Previous cleanup / project details"
                    value={
                      form.previousWorkDetails
                    }
                    onChange={(event) =>
                      updateField(
                        "previousWorkDetails",
                        event.target.value
                      )
                    }
                    placeholder="Describe relevant work completed previously."
                    rows={5}
                  />
                </div>

                <TextInput
                  label="Previous funding received"
                  value={
                    form.previousFundingReceived
                  }
                  onChange={(event) =>
                    updateField(
                      "previousFundingReceived",
                      event.target.value
                    )
                  }
                  placeholder="Amount / source / year, if applicable"
                />

                <TextInput
                  label="Previous results"
                  value={
                    form.previousResults
                  }
                  onChange={(event) =>
                    updateField(
                      "previousResults",
                      event.target.value
                    )
                  }
                  placeholder="Key outcomes"
                />

                <div className="md:col-span-2">
                  <TextArea
                    label="Social / project links"
                    value={form.socialLinks}
                    onChange={(event) =>
                      updateField(
                        "socialLinks",
                        event.target.value
                      )
                    }
                    placeholder="Website, Instagram, Facebook, project page or other relevant links"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <FileUpload
                    label="Previous work photos / proof"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    file={
                      files.previousWorkPhotos[0]
                    }
                    onChange={(file) =>
                      updateMultipleFiles(
                        "previousWorkPhotos",
                        file
                          ? [file]
                          : []
                      )
                    }
                    hint="Upload relevant visual proof"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <SectionHeader
                icon={WalletCards}
                title="Budget, Video & Supporting Material"
                description="Provide a detailed budget and a project explanation video so reviewers can understand the proposal."
              />

              <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex gap-3">
                  <Video
                    size={20}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <div>
                    <p className="text-sm font-bold text-blue-900">
                      Project video is required
                    </p>

                    <p className="mt-1 text-sm leading-6 text-blue-800/80">
                      In the video, explain who you are,
                      what the project is, why funding is
                      needed, where the money will be used,
                      expected impact and previous work.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <div className="relative">
                    <TextInput
                      label="Google Drive video link"
                      required
                      type="url"
                      value={
                        form.videoDriveLink
                      }
                      onChange={(event) =>
                        updateField(
                          "videoDriveLink",
                          event.target.value
                        )
                      }
                      placeholder="https://drive.google.com/..."
                    />

                    <LinkIcon
                      size={17}
                      className="pointer-events-none absolute right-4 top-10 text-slate-400"
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Make sure the Drive link is accessible to
                    the authorized reviewer.
                  </p>
                </div>

                <FileUpload
                  label="Optional project video upload"
                  accept="video/mp4,video/webm,video/quicktime"
                  file={files.projectVideo}
                  onChange={(file) =>
                    updateFile(
                      "projectVideo",
                      file
                    )
                  }
                  hint="Use Drive link or supported video upload"
                />
              </div>

              <div className="my-8 border-t border-slate-100" />

              <SectionHeader
                icon={WalletCards}
                title="Detailed Budget Breakup"
                description="Break the requested amount into clear spending items."
              />

              <div className="space-y-4">
                {form.budgetItems.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-700">
                          Budget Item {index + 1}
                        </p>

                        {form.budgetItems
                          .length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeBudgetItem(
                                index
                              )
                            }
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <TextInput
                          label="Item"
                          value={item.item}
                          onChange={(event) =>
                            updateBudgetItem(
                              index,
                              "item",
                              event.target.value
                            )
                          }
                          placeholder="e.g. plants"
                        />

                        <TextInput
                          label="Description"
                          value={
                            item.description
                          }
                          onChange={(event) =>
                            updateBudgetItem(
                              index,
                              "description",
                              event.target.value
                            )
                          }
                          placeholder="Quantity / details"
                        />

                        <TextInput
                          label="Amount"
                          type="number"
                          value={item.amount}
                          onChange={(event) =>
                            updateBudgetItem(
                              index,
                              "amount",
                              event.target.value
                            )
                          }
                          placeholder="Amount"
                        />
                      </div>
                    </div>
                  )
                )}

                <button
                  type="button"
                  onClick={addBudgetItem}
                  className="rounded-xl border border-dashed border-[#0b8f4d]/40 bg-[#f7fcf9] px-5 py-3 text-sm font-bold text-[#0b8f4d] transition hover:bg-[#e9f7ef]"
                >
                  + Add Budget Item
                </button>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <FileUpload
                  label="Supporting invoices / documents"
                  accept="image/jpeg,image/png,application/pdf"
                  file={files.invoices[0]}
                  onChange={(file) =>
                    updateMultipleFiles(
                      "invoices",
                      file
                        ? [file]
                        : []
                    )
                  }
                  hint="Add available supporting documents"
                />

                <FileUpload
                  label="Before / after photos"
                  accept="image/jpeg,image/png,image/webp"
                  file={
                    files.beforeAfterPhotos[0]
                  }
                  onChange={(file) =>
                    updateMultipleFiles(
                      "beforeAfterPhotos",
                      file
                        ? [file]
                        : []
                    )
                  }
                  hint="Project progress evidence"
                />
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex gap-3">
                  <PlayCircle
                    size={20}
                    className="mt-0.5 shrink-0 text-[#0b8f4d]"
                  />

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Video checklist
                    </p>

                    <ul className="mt-2 space-y-1.5 text-sm leading-6 text-slate-500">
                      <li>• Introduce yourself / organization.</li>
                      <li>• Explain the project and location.</li>
                      <li>• Explain why funding is needed.</li>
                      <li>• Explain how funds will be used.</li>
                      <li>• Explain expected environmental impact.</li>
                      <li>• Mention previous relevant work.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <SectionHeader
                icon={FileCheck2}
                title="Declaration & Final Submission"
                description="Review your responsibilities before submitting the funding request."
              />

              <div className="rounded-2xl border border-green-100 bg-[#f7fcf9] p-5">
                <p className="text-sm font-bold text-[#14231a]">
                  Important
                </p>

                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  <li>
                    • Funds must be used only for the approved
                    environmental purpose.
                  </li>
                  <li>
                    • False identity or documents can result
                    in rejection.
                  </li>
                  <li>
                    • Misuse of funds can lead to recovery or
                    other applicable action.
                  </li>
                  <li>
                    • Expense proof and reporting are mandatory
                    after funding.
                  </li>
                  <li>
                    • Applicants may be asked for additional
                    information or verification.
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() =>
                  setTermsOpen(
                    (previous) => !previous
                  )
                }
                className="mt-5 flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left"
              >
                <span className="flex items-center gap-3">
                  <FileText
                    size={19}
                    className="text-[#0b8f4d]"
                  />

                  <span>
                    <span className="block text-sm font-bold text-slate-800">
                      Full Green Fund Terms
                    </span>

                    <span className="mt-1 block text-xs text-slate-400">
                      Click to expand
                    </span>
                  </span>
                </span>

                <ChevronDown
                  size={18}
                  className={[
                    "text-slate-400 transition",
                    termsOpen
                      ? "rotate-180"
                      : "",
                  ].join(" ")}
                />
              </button>

              {termsOpen && (
                <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <ol className="space-y-3 text-sm leading-6 text-slate-600">
                    <li>
                      1. Green Fund support is intended only
                      for approved environmental purposes.
                    </li>

                    <li>
                      2. False information, false identity or
                      forged documents may result in rejection.
                    </li>

                    <li>
                      3. Misuse or unauthorized use of funds
                      may result in suspension, recovery of funds
                      and other applicable legal action.
                    </li>

                    <li>
                      4. Applicants must maintain appropriate
                      expense records and provide supporting
                      bills or invoices where required.
                    </li>

                    <li>
                      5. Date-wise expenditure, progress
                      updates and final impact reporting may be
                      required after approval.
                    </li>

                    <li>
                      6. Any remaining or unused amount must be
                      declared and handled according to the
                      approved funding terms.
                    </li>

                    <li>
                      7. Authorized reviewers may verify
                      applicant identity, organization details,
                      project location, documents and submitted
                      evidence.
                    </li>

                    <li>
                      8. Applicants are responsible for applicable
                      tax, licensing, permissions and statutory
                      requirements.
                    </li>

                    <li>
                      9. Approval of one project does not
                      guarantee future funding.
                    </li>

                    <li>
                      10. Sensitive identity documents,
                      signatures, thumb impressions and private
                      evidence should not be publicly displayed.
                    </li>
                  </ol>
                </div>
              )}

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <TextArea
                  label="Remaining amount declaration"
                  value={
                    form.remainingAmountDeclaration
                  }
                  onChange={(event) =>
                    updateField(
                      "remainingAmountDeclaration",
                      event.target.value
                    )
                  }
                  placeholder="Explain how any unused amount will be handled."
                  rows={4}
                />

                <TextArea
                  label="Final impact / reporting plan"
                  value={form.finalImpactPlan}
                  onChange={(event) =>
                    updateField(
                      "finalImpactPlan",
                      event.target.value
                    )
                  }
                  placeholder="Explain how you will report progress and final impact."
                  rows={4}
                />
              </div>

              <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
                <input
                  type="checkbox"
                  checked={
                    form.declarationAccepted
                  }
                  onChange={(event) =>
                    updateField(
                      "declarationAccepted",
                      event.target.checked
                    )
                  }
                  className="mt-1 h-4 w-4 accent-[#0b8f4d]"
                />

                <span className="text-sm leading-6 text-slate-600">
                  I confirm that the information and documents
                  submitted by me are accurate to the best of
                  my knowledge. I understand that the request
                  is subject to verification, approval and the
                  applicable Green Fund terms.
                </span>
              </label>

              <div className="mt-6 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <p>
                  Your sensitive verification information
                  should be restricted to authorized admin /
                  verification personnel.
                </p>
              </div>
            </div>
          )}

          <div className="mt-9 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  <ArrowLeft size={17} />
                  Previous
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={saveDraft}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Save Draft
              </button>

              {step < STEPS.length ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b8f4d] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#087b42]"
                >
                  Continue
                  <ArrowRight size={17} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submitRequest}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b8f4d] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#087b42]"
                >
                  <CheckCircle2 size={17} />
                  Submit Funding Request
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500">
          <Info
            size={17}
            className="mt-0.5 shrink-0 text-[#0b8f4d]"
          />

          <p>
            <strong className="text-slate-700">
              Important:
            </strong>{" "}
            This first version stores the submitted request
            locally on the current device. A real cross-device
            admin workflow with secure document storage,
            reviewer access and status updates will require
            the project backend / Firebase Storage and
            Firestore integration.
          </p>
        </div>
      </div>
    </div>
  )
}

export default FundingRequest