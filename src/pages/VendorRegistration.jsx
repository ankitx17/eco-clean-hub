import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Phone,
  Recycle,
  Send,
  ShieldCheck,
} from "lucide-react"

const FACILITY_TYPES = [
  "MRF",
  "Dry Waste Collection Centre",
  "Recycling Centre",
  "E-Waste Facility",
  "Municipal Waste Facility",
  "Collection Point",
]

const WASTE_TYPES = [
  "Plastic",
  "Paper",
  "Glass",
  "Metal",
  "Organic",
  "E-Waste",
  "Textile",
  "Hazardous",
]

/* =========================================================
   INDIAN STATES + UNION TERRITORIES
   ========================================================= */

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
]

const initialForm = {
  businessName: "",
  contactPerson: "",
  email: "",
  phone: "",
  facilityType: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  latitude: "",
  longitude: "",
  description: "",
}

function VendorRegistration() {
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)
  const [acceptedWaste, setAcceptedWaste] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleWasteToggle = (waste) => {
    setAcceptedWaste((current) =>
      current.includes(waste)
        ? current.filter((item) => item !== waste)
        : [...current, waste]
    )
  }

  /* =========================================================
     GET CURRENT LOCATION + REVERSE GEOCODING
     ========================================================= */

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      )
      return
    }

    setLocationLoading(true)
    setError("")

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        // Save GPS internally immediately.
        setForm((current) => ({
          ...current,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }))

        try {
          /*
           * Reverse geocoding:
           *
           * Latitude + Longitude
           *        ↓
           * OpenStreetMap Nominatim
           *        ↓
           * Address + City + State + PIN
           */

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${encodeURIComponent(
              latitude
            )}&lon=${encodeURIComponent(longitude)}`
          )

          if (!response.ok) {
            throw new Error(
              `Address lookup failed with status ${response.status}`
            )
          }

          const data = await response.json()
          const addressData = data.address || {}

          const city =
            addressData.city ||
            addressData.town ||
            addressData.municipality ||
            addressData.village ||
            addressData.city_district ||
            ""

          const state =
            addressData.state || ""

          const pincode =
            addressData.postcode || ""

          const completeAddress =
            data.display_name || ""

          /*
           * Try to match the returned state with our
           * dropdown options.
           */
          const matchedState =
            INDIAN_STATES.find(
              (stateName) =>
                stateName.toLowerCase() ===
                state.toLowerCase()
            ) || ""

          setForm((current) => ({
            ...current,
            address: completeAddress,
            city,
            state: matchedState,
            pincode,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
          }))

          if (
            state &&
            !matchedState
          ) {
            setError(
              "Location found. Please select your state manually."
            )
          } else {
            setError("")
          }
        } catch (reverseError) {
          console.error(
            "Reverse geocoding error:",
            reverseError
          )

          /*
           * GPS is still saved even if address lookup fails.
           */
          setError(
            "Location detected, but address could not be fetched. Please enter the address manually."
          )
        } finally {
          setLocationLoading(false)
        }
      },
      (locationError) => {
        console.error(
          "Geolocation error:",
          locationError
        )

        setLocationLoading(false)

        if (
          locationError.code ===
          locationError.PERMISSION_DENIED
        ) {
          setError(
            "Location permission was denied. Please allow location access in your browser."
          )
        } else if (
          locationError.code ===
          locationError.POSITION_UNAVAILABLE
        ) {
          setError(
            "Your current location is unavailable. Please try again."
          )
        } else if (
          locationError.code ===
          locationError.TIMEOUT
        ) {
          setError(
            "Location request timed out. Please try again."
          )
        } else {
          setError(
            "Unable to get your location. Please try again."
          )
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    )
  }

  /* =========================================================
     SUBMIT VENDOR
     ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError("")

    if (acceptedWaste.length === 0) {
      setError(
        "Please select at least one accepted waste type."
      )
      return
    }

    /*
     * Latitude and longitude are hidden from the UI,
     * but are still required internally for MRF distance.
     */
    if (!form.latitude || !form.longitude) {
      setError(
        "Please use 'Use my location' to set the facility location."
      )
      return
    }

    setSubmitting(true)

    try {
      const vendor = {
        id: `vendor_${Date.now()}`,

        name: form.businessName,
        businessName: form.businessName,

        contactPerson: form.contactPerson,
        email: form.email,
        phone: form.phone,

        type: form.facilityType,
        facilityType: form.facilityType,

        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,

        /*
         * GPS remains internally available for MRF.
         */
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),

        acceptedWaste,
        description: form.description,

        // Temporary demo status
        status: "approved",
        verified: true,
        sourceType: "registered-vendor",
        source: "vendor-registration",

        createdAt: new Date().toISOString(),
      }

      /*
       * TEMPORARY DEMO STORAGE
       *
       * Abhi admin panel nahi bana hai,
       * isliye vendor localStorage mein save ho raha hai.
       */

      const existingVendors = JSON.parse(
        localStorage.getItem(
          "eco_clean_hub_registered_vendors"
        ) || "[]"
      )

      const vendors = Array.isArray(
        existingVendors
      )
        ? existingVendors
        : []

      localStorage.setItem(
        "eco_clean_hub_registered_vendors",
        JSON.stringify([
          vendor,
          ...vendors,
        ])
      )

      localStorage.setItem(
        "eco_clean_hub_last_registered_vendor",
        JSON.stringify(vendor)
      )

      /*
       * Vendor register hone ke baad MRF page.
       */
      navigate("/mrf")
    } catch (submitError) {
      console.error(
        "Vendor registration error:",
        submitError
      )

      setError(
        "Something went wrong. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7faf7] px-5 py-10">
      <div className="mx-auto max-w-5xl">

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#0b8f4d]"
          >
            <ArrowLeft size={17} />
            Back to Home
          </button>

          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-100">
              <Building2
                size={28}
                className="text-[#0b8f4d]"
              />
            </div>

            <div>
              <div className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-[#0b8f4d]">
                <Recycle size={16} />
                ECO CLEAN HUB
              </div>

              <h1 className="text-3xl font-black tracking-tight text-[#102119] sm:text-4xl">
                Register as Vendor
              </h1>

              <p className="mt-2 max-w-2xl text-slate-600">
                Register your waste facility and help citizens find a disposal point near them.
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            DEMO NOTICE
            ================================================= */}

        <div className="mb-8 flex gap-3 rounded-2xl border border-green-100 bg-green-50 p-4">
          <ShieldCheck
            size={21}
            className="mt-0.5 shrink-0 text-[#0b8f4d]"
          />

          <div className="text-sm leading-6 text-green-900">
            <strong>
              Vendor registration:
            </strong>{" "}
            For now, registered vendors are immediately visible on the MRF page for testing. Admin verification and approval will be added later.
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-2">

            {/* =================================================
                BUSINESS INFORMATION
                ================================================= */}

            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#102119]">
                Business Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tell us about your waste facility.
              </p>

              <div className="mt-6 space-y-5">

                <Field
                  label="Business / Facility Name"
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Green Recycling Centre"
                  required
                  icon={<Building2 size={17} />}
                />

                <Field
                  label="Contact Person"
                  name="contactPerson"
                  value={form.contactPerson}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
                />

                <div className="grid gap-5 sm:grid-cols-2">

                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="vendor@example.com"
                    required
                    icon={<Mail size={17} />}
                  />

                  <Field
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10 digit mobile number"
                    required
                    icon={<Phone size={17} />}
                  />

                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Facility Type
                  </label>

                  <select
                    name="facilityType"
                    value={form.facilityType}
                    onChange={handleChange}
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  >
                    <option value="">
                      Select facility type
                    </option>

                    {FACILITY_TYPES.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}
                  </select>
                </div>

              </div>
            </section>

            {/* =================================================
                FACILITY LOCATION
                ================================================= */}

            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold text-[#102119]">
                Facility Location
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Accurate location helps citizens find your facility.
              </p>

              <div className="mt-6 space-y-5">

                {/* =================================================
                    CITY + STATE
                    ================================================= */}

                <div className="grid gap-5 sm:grid-cols-2">

                  {/* CITY */}

                  <Field
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    required
                    inputClassName="h-12"
                  />

                  {/* STATE */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      State
                    </label>

                    <select
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    >
                      <option value="">
                        Select state
                      </option>

                      {INDIAN_STATES.map(
                        (state) => (
                          <option
                            key={state}
                            value={state}
                          >
                            {state}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                </div>

                {/* =================================================
                    PIN CODE
                    ================================================= */}

                <Field
                  label="PIN Code"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="6 digit PIN code"
                  required
                  inputClassName="h-12"
                />

                {/* =================================================
                    ADDRESS + USE MY LOCATION
                    ================================================= */}

                <div>

                  <div className="mb-2 flex items-center justify-between gap-3">

                    <label className="text-sm font-semibold text-slate-700">
                      Address
                    </label>

                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                      className="shrink-0 text-sm font-semibold text-[#0b8f4d] transition hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {locationLoading
                        ? "Fetching location..."
                        : "Use my location"}
                    </button>

                  </div>

                  <div className="relative">

                    <MapPin
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Complete facility address"
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />

                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Use your current location to automatically fill your address, city, state and PIN code.
                  </p>

                </div>

              </div>
            </section>

            {/* =================================================
                ACCEPTED WASTE
                ================================================= */}

            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

              <h2 className="text-xl font-bold text-[#102119]">
                Accepted Waste
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select the types of waste your facility accepts.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">

                {WASTE_TYPES.map(
                  (waste) => {
                    const selected =
                      acceptedWaste.includes(
                        waste
                      )

                    return (
                      <button
                        key={waste}
                        type="button"
                        onClick={() =>
                          handleWasteToggle(
                            waste
                          )
                        }
                        className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                          selected
                            ? "border-green-500 bg-green-50 text-[#0b8f4d]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-green-300 hover:bg-green-50"
                        }`}
                      >
                        {selected &&
                          "✓ "}
                        {waste}
                      </button>
                    )
                  }
                )}

              </div>
            </section>

            {/* =================================================
                ADDITIONAL INFORMATION
                ================================================= */}

            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

              <h2 className="text-xl font-bold text-[#102119]">
                Additional Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add any useful information about your facility.
              </p>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                placeholder="Tell us about your facility, operating hours, services, certifications, etc."
                className="mt-5 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

            </section>

          </div>

          {/* =================================================
              ERROR
              ================================================= */}

          {error && (
            <div
              className={`mt-6 rounded-xl border px-4 py-3 text-sm font-medium ${
                error.includes(
                  "Location detected"
                ) ||
                error.includes(
                  "Location found"
                )
                  ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {error}
            </div>
          )}

          {/* =================================================
              SUBMIT
              ================================================= */}

          <div className="mt-8 flex justify-end">

            <button
              type="submit"
              disabled={
                submitting ||
                locationLoading
              }
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0b8f4d] px-7 py-4 font-semibold text-white shadow-xl shadow-green-800/20 transition hover:-translate-y-0.5 hover:bg-[#087b42] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                "Registering..."
              ) : (
                <>
                  Register & View on MRF
                  <Send size={18} />
                </>
              )}
            </button>

          </div>
        </form>
      </div>
    </main>
  )
}

/* =========================================================
   REUSABLE FIELD
   ========================================================= */

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  icon,
  inputClassName = "",
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">

        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl border border-slate-200 bg-white py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 ${inputClassName} ${
            icon
              ? "pl-11 pr-4"
              : "px-4"
          }`}
        />

      </div>
    </div>
  )
}

export default VendorRegistration