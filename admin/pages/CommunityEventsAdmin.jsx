import { useEffect, useMemo, useState } from "react"
import {
  CalendarDays,
  Check,
  Edit3,
  Eye,
  MapPin,
  Plus,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react"
import {
  createCommunityEvent,
  deleteCommunityEvent,
  getCommunityEventRegistrations,
  getCommunityEvents,
  updateCommunityEvent,
  updateCommunityEventRegistrationStatus,
  updateCommunityEventStatus,
  verifyCommunityEventAttendance,
  distributeCommunityEventReward,
  subscribeToCommunityEventUpdates,
} from "../../src/services/communityEventService"

const EMPTY_FORM = {
  title: "",
  description: "",
  purpose: "",
  category: "Community Cleanup",
  location: "",
  date: "",
  startTime: "",
  endTime: "",
  organizerName: "",
  organizerPhone: "",
  organizerEmail: "",
  whatsappGroup: "",
  registrationEmail: "",
  requiredVolunteers: "",
  imageUrl: "",
  maxParticipants: "",
  whatToBring: "",
  safetyInstructions: "",
  rewardConfig: {
    types: [],
    details: "",
  },
}

function formatDate(dateValue) {
  if (!dateValue) return "No date"

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return "Invalid date"

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function CommunityEventsAdmin() {
  const [events, setEvents] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingEventId, setEditingEventId] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [detailEvent, setDetailEvent] = useState(null)
  const [processingRegistrationId, setProcessingRegistrationId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const loadEvents = async () => {
    try {
      setError("")
      const loadedEvents = await getCommunityEvents({ includePending: true })
      setEvents(Array.isArray(loadedEvents) ? loadedEvents : [])
    } catch (loadError) {
      console.error("Failed to load community events:", loadError)
      setError(loadError?.message || "Unable to load community events.")
    }
  }

  const loadRegistrations = async (eventId) => {
    if (!eventId) {
      setRegistrations([])
      return
    }

    try {
      const storedRegistrations =
        await getCommunityEventRegistrations(eventId)

      setRegistrations(
        Array.isArray(storedRegistrations) ? storedRegistrations : []
      )
    } catch (loadError) {
      console.error("Failed to load event registrations:", loadError)
      setError(loadError?.message || "Unable to load registrations.")
      setRegistrations([])
    }
  }

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      setLoading(true)
      try {
        await loadEvents()
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initialize()

    const unsubscribe = subscribeToCommunityEventUpdates(async () => {
      await loadEvents()

      if (selectedEvent?.id) {
        await loadRegistrations(selectedEvent.id)
      }
    })

    return () => {
      mounted = false
      unsubscribe?.()
    }
  }, [selectedEvent?.id])

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      return (
        new Date(a.date || 0).getTime() -
        new Date(b.date || 0).getTime()
      )
    })
  }, [events])

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingEventId(null)
    setError("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError("")
    setSuccess("")
    setSaving(true)

    try {
      const eventData = {
        title: form.title.trim(),
        description: form.description.trim(),
        purpose: form.purpose.trim(),
        category: form.category,
        location: form.location.trim(),
        date: form.date,
        eventDate: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        organizerName: form.organizerName.trim(),
        organizerPhone: form.organizerPhone.trim(),
        contactNumber: form.organizerPhone.trim(),
        organizerEmail: form.organizerEmail.trim(),
        whatsappGroup: form.whatsappGroup.trim(),
        registrationEmail: form.registrationEmail.trim(),
        requiredVolunteers: form.requiredVolunteers
          ? Number(form.requiredVolunteers)
          : 0,
        imageUrl: form.imageUrl.trim(),
        maxParticipants: form.maxParticipants
          ? Number(form.maxParticipants)
          : 0,
        whatToBring: form.whatToBring.trim(),
        safetyInstructions: form.safetyInstructions.trim(),
        rewardConfig: {
          types: Array.isArray(form.rewardConfig?.types)
            ? form.rewardConfig.types
            : [],
          details: form.rewardConfig?.details?.trim() || "",
        },
      }

      if (editingEventId) {
        await updateCommunityEvent(editingEventId, eventData)
        setSuccess("Community event updated successfully.")
      } else {
        await createCommunityEvent(eventData)
        setSuccess("Community event created successfully. It is now pending review.")
      }

      resetForm()
      await loadEvents()
    } catch (submitError) {
      setError(
        submitError?.message ||
          "Unable to save the community event."
      )
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (event) => {
    setEditingEventId(event.id)

    setForm({
      title: event.title || "",
      description: event.description || "",
      purpose: event.purpose || "",
      category: event.category || "Community Cleanup",
      location: event.location || "",
      date: event.eventDate
        ? String(event.eventDate).slice(0, 16)
        : event.date
          ? new Date(event.date).toISOString().slice(0, 16)
          : "",
      startTime: event.startTime || "",
      endTime: event.endTime || "",
      organizerName: event.organizerName || "",
      organizerPhone: event.organizerPhone || event.contactNumber || "",
      organizerEmail: event.organizerEmail || "",
      whatsappGroup: event.whatsappGroup || "",
      registrationEmail: event.registrationEmail || "",
      requiredVolunteers:
        event.requiredVolunteers !== null &&
        event.requiredVolunteers !== undefined
          ? String(event.requiredVolunteers)
          : "",
      imageUrl: event.imageUrl || "",
      maxParticipants:
        event.maxParticipants !== null &&
        event.maxParticipants !== undefined
          ? String(event.maxParticipants)
          : "",
      whatToBring: event.whatToBring || "",
      safetyInstructions: event.safetyInstructions || "",
      rewardConfig: {
        types: Array.isArray(event.rewardConfig?.types)
          ? event.rewardConfig.types
          : [],
        details: event.rewardConfig?.details || "",
      },
    })

    setError("")
    setSuccess("")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (event) => {
    const confirmed = window.confirm(
      `Delete "${event.title}"? This action cannot be undone.`
    )

    if (!confirmed) return

    setError("")
    setSuccess("")

    try {
      await deleteCommunityEvent(event.id)

      if (selectedEvent?.id === event.id) {
        setSelectedEvent(null)
        setRegistrations([])
      }

      if (editingEventId === event.id) {
        resetForm()
      }

      await loadEvents()
      setSuccess("Community event deleted successfully.")
    } catch (deleteError) {
      setError(
        deleteError?.message ||
          "Unable to delete the community event."
      )
    }
  }

  const handleViewDetails = (event) => {
    setDetailEvent(event)
    setError("")
    setSuccess("")
  }

  const handleViewParticipants = (event) => {
    setSelectedEvent(event)
    loadRegistrations(event.id)
    setError("")
    setSuccess("")
  }

  const handleRegistrationStatus = async (
    registration,
    status
  ) => {
    if (!selectedEvent?.id || !registration?.id) return

    try {
      await updateCommunityEventRegistrationStatus(
        selectedEvent.id,
        registration.id,
        status
      )

      await loadRegistrations(selectedEvent.id)
      await loadEvents()

      setSuccess(
        `Registration ${status.toLowerCase()} successfully.`
      )
    } catch (statusError) {
      setError(
        statusError?.message ||
          "Unable to update registration status."
      )
    }
  }

  const handleAttendanceStatus = async (registration, status) => {
    if (!selectedEvent?.id || !registration?.id) return

    setProcessingRegistrationId(registration.id)
    setError("")
    setSuccess("")

    try {
      await verifyCommunityEventAttendance(
        selectedEvent.id,
        registration.id,
        status
      )
      await loadRegistrations(selectedEvent.id)
      await loadEvents()

      setSuccess(
        status === "present"
          ? "Participant marked present."
          : status === "absent"
            ? "Participant marked absent."
            : "Attendance reset to pending."
      )
    } catch (attendanceError) {
      console.error("Failed to update attendance:", attendanceError)
      setError(attendanceError?.message || "Unable to update participant attendance.")
    } finally {
      setProcessingRegistrationId(null)
    }
  }

  const handleDistributeReward = async (registration) => {
    if (!selectedEvent?.id || !registration?.id) return

    if (registration.attendanceStatus !== "present") {
      setError("Attendance must be marked present before distributing a reward.")
      return
    }

    const rewardTypes = Array.isArray(selectedEvent.rewardConfig?.types)
      ? selectedEvent.rewardConfig.types.filter((type) => type !== "none")
      : []

    if (rewardTypes.length === 0) {
      setError("No reward is configured for this event.")
      return
    }

    const rewardType = window.prompt(
      `Reward type (${rewardTypes.join(", ")}):`,
      rewardTypes[0]
    )?.trim().toLowerCase()

    if (!rewardType || !rewardTypes.includes(rewardType)) {
      setError("Please enter one of the configured reward types.")
      return
    }

    if (
      !window.confirm(
        `Distribute "${rewardType}" reward to ${
          registration.userName || "this participant"
        }?`
      )
    ) {
      return
    }

    setProcessingRegistrationId(registration.id)
    setError("")
    setSuccess("")

    try {
      await distributeCommunityEventReward(
        selectedEvent.id,
        registration.id,
        {
          type: rewardType,
          details: selectedEvent.rewardConfig?.details || "",
        }
      )

      await loadRegistrations(selectedEvent.id)
      await loadEvents()
      setSuccess("Reward distributed successfully.")
    } catch (rewardError) {
      console.error("Failed to distribute reward:", rewardError)
      setError(rewardError?.message || "Unable to distribute participant reward.")
    } finally {
      setProcessingRegistrationId(null)
    }
  }

  const handleEventStatus = async (event, status) => {
    if (!event?.id) return

    const action =
      status === "approved"
        ? "Approve"
        : status === "rejected"
          ? "Reject"
          : "Update"

    const confirmed = window.confirm(
      `${action} "${event.title}"?`
    )

    if (!confirmed) return

    setError("")
    setSuccess("")

    try {
      let rejectionReason = ""

      if (status === "rejected") {
        rejectionReason =
          window.prompt(
            "Enter rejection reason (optional):",
            ""
          )?.trim() || ""
      }

      await updateCommunityEventStatus(
        event.id,
        status,
        { rejectionReason }
      )

      await loadEvents()

      if (selectedEvent?.id === event.id) {
        const updatedEvents = await getCommunityEvents({
          includePending: true,
        })

        const updatedEvent = updatedEvents.find(
          (item) => item.id === event.id
        )

        if (updatedEvent) {
          setSelectedEvent(updatedEvent)
        }
      }

      setSuccess(
        status === "approved"
          ? "Community event approved successfully."
          : status === "rejected"
            ? "Community event rejected successfully."
            : "Community event status updated successfully."
      )
    } catch (statusError) {
      console.error(
        "Failed to update community event status:",
        statusError
      )

      setError(
        statusError?.message ||
          "Unable to update community event status."
      )
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-slate-200" />
          <div className="h-48 rounded-2xl bg-slate-100" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Community Events
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create and manage community eco events and participant
          registrations.
        </p>
      </div>

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-lg p-1 hover:bg-red-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
          <Check size={17} />
          {success}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingEventId ? "Edit Event" : "Create Event"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Add the details citizens will see on the dashboard.
            </p>
          </div>

          {editingEventId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2"
        >
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Event Title
            </label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Beach Cleanup Drive"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Location
            </label>

            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="City Park"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Date & Time
            </label>

            <input
              type="datetime-local"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Maximum Participants
            </label>

            <input
              type="number"
              name="maxParticipants"
              value={form.maxParticipants}
              onChange={handleChange}
              min="1"
              placeholder="50"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            >
              <option>Community Cleanup</option>
              <option>Tree Plantation</option>
              <option>Beach Cleanup</option>
              <option>Awareness Drive</option>
              <option>Recycling Drive</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Organizer Name
            </label>
            <input
              type="text"
              name="organizerName"
              value={form.organizerName}
              onChange={handleChange}
              placeholder="Organizer name"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Contact Number
            </label>
            <input
              type="tel"
              name="organizerPhone"
              value={form.organizerPhone}
              onChange={handleChange}
              placeholder="Contact number"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Organizer Email
            </label>
            <input
              type="email"
              name="organizerEmail"
              value={form.organizerEmail}
              onChange={handleChange}
              placeholder="organizer@example.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Registration Email
            </label>
            <input
              type="email"
              name="registrationEmail"
              value={form.registrationEmail}
              onChange={handleChange}
              placeholder="registration@example.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              WhatsApp Group
            </label>
            <input
              type="url"
              name="whatsappGroup"
              value={form.whatsappGroup}
              onChange={handleChange}
              placeholder="https://chat.whatsapp.com/..."
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Required Volunteers
            </label>
            <input
              type="number"
              name="requiredVolunteers"
              value={form.requiredVolunteers}
              onChange={handleChange}
              min="0"
              placeholder="20"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Start Time
            </label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              End Time
            </label>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Purpose
            </label>
            <textarea
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              rows={3}
              placeholder="Purpose and expected environmental impact..."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              What to Bring
            </label>
            <textarea
              name="whatToBring"
              value={form.whatToBring}
              onChange={handleChange}
              rows={3}
              placeholder="Gloves, water bottle, cap, etc."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Safety Instructions
            </label>
            <textarea
              name="safetyInstructions"
              value={form.safetyInstructions}
              onChange={handleChange}
              rows={3}
              placeholder="Safety rules and important instructions..."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">
              Participant Rewards
            </p>

            <div className="flex flex-wrap gap-2">
              {["certificate", "goodies", "coins", "cash", "none"].map((type) => {
                const checked = form.rewardConfig.types.includes(type)

                return (
                  <label
                    key={type}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setForm((current) => {
                          const types = current.rewardConfig.types || []
                          const nextTypes = checked
                            ? types.filter((item) => item !== type)
                            : type === "none"
                              ? ["none"]
                              : [
                                  ...types.filter((item) => item !== "none"),
                                  type,
                                ]

                          return {
                            ...current,
                            rewardConfig: {
                              ...current.rewardConfig,
                              types: nextTypes,
                            },
                          }
                        })
                      }
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                )
              })}
            </div>

            <textarea
              value={form.rewardConfig.details}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  rewardConfig: {
                    ...current.rewardConfig,
                    details: event.target.value,
                  },
                }))
              }
              rows={2}
              placeholder="Reward details..."
              className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Image URL
            </label>

            <input
              type="url"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/event-image.jpg"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the community event..."
              rows={4}
              required
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editingEventId ? (
                <Edit3 size={17} />
              ) : (
                <Plus size={17} />
              )}

              {saving
                ? "Saving..."
                : editingEventId
                  ? "Update Event"
                  : "Create Event"}
            </button>
          </div>
        </form>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              All Events
            </h2>

            <p className="text-xs text-slate-500">
              {events.length} event{events.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {sortedEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <CalendarDays
              size={40}
              className="mx-auto text-slate-400"
            />

            <h3 className="mt-3 font-semibold text-slate-900">
              No events created
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Create your first community event above.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {sortedEvents.map((event) => {
              const registrationCount = Number(
                event.registeredCount || 0
              )

              return (
                <article
                  key={event.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-slate-900">
                        {event.title}
                      </h3>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                        {event.description}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold capitalize text-green-700">
                      {event.status || "upcoming"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        size={16}
                        className="text-green-600"
                      />
                      {formatDate(event.date)}
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin
                        size={16}
                        className="text-green-600"
                      />
                      {event.location}
                    </div>

                    <div className="flex items-center gap-2">
                      <Users
                        size={16}
                        className="text-green-600"
                      />
                      {registrationCount}
                      {event.maxParticipants
                        ? ` / ${event.maxParticipants}`
                        : ""}{" "}
                      registered
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {event.status === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleEventStatus(event, "approved")
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100"
                        >
                          <Check size={15} />
                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEventStatus(event, "rejected")
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                          <X size={15} />
                          Reject
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => handleViewDetails(event)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Eye size={15} />
                      Details
                    </button>

                    <button
                      type="button"
                      onClick={() => handleViewParticipants(event)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Users size={15} />
                      Participants
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEdit(event)}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      <Edit3 size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(event)}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {detailEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Event Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Complete information for this community event.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDetailEvent(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close event details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-5">
              {detailEvent.imageUrl && (
                <img
                  src={detailEvent.imageUrl}
                  alt={detailEvent.title}
                  className="mb-5 h-56 w-full rounded-2xl object-cover"
                />
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Title", detailEvent.title],
                  ["Category", detailEvent.category],
                  ["Status", detailEvent.status],
                  ["Location", detailEvent.location],
                  ["Date", detailEvent.eventDate || detailEvent.date],
                  [
                    "Time",
                    [detailEvent.startTime, detailEvent.endTime]
                      .filter(Boolean)
                      .join(" - "),
                  ],
                  ["Organizer", detailEvent.organizerName],
                  [
                    "Contact",
                    detailEvent.contactNumber || detailEvent.organizerPhone,
                  ],
                  ["Organizer Email", detailEvent.organizerEmail],
                  ["Registration Email", detailEvent.registrationEmail],
                  ["WhatsApp Group", detailEvent.whatsappGroup],
                  ["Required Volunteers", detailEvent.requiredVolunteers],
                  ["Maximum Participants", detailEvent.maxParticipants],
                  [
                    "Rewards",
                    Array.isArray(detailEvent.rewardConfig?.types)
                      ? detailEvent.rewardConfig.types.join(", ") || "None"
                      : "None",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {label}
                    </p>
                    <p className="mt-1 break-words text-sm font-medium text-slate-900">
                      {String(value || "Not provided")}
                    </p>
                  </div>
                ))}
              </div>

              {[
                ["Description", detailEvent.description],
                ["Purpose", detailEvent.purpose],
                ["What to Bring", detailEvent.whatToBring],
                ["Safety Instructions", detailEvent.safetyInstructions],
                ["Reward Details", detailEvent.rewardConfig?.details],
                ["Rejection Reason", detailEvent.rejectionReason],
              ].map(([label, value]) =>
                value ? (
                  <div
                    key={label}
                    className="mt-3 rounded-xl border border-slate-200 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {label}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {value}
                    </p>
                  </div>
                ) : null
              )}

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setDetailEvent(null)
                    handleEdit(detailEvent)
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                >
                  <Edit3 size={16} />
                  Edit Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Participants
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedEvent.title}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedEvent(null)
                  setRegistrations([])
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close participants"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-5">
              {registrations.length === 0 ? (
                <div className="py-10 text-center">
                  <Users
                    size={38}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No registrations yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {registrations.map((registration) => (
                    <div
                      key={registration.id}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          {registration.userName || "Eco Citizen"}
                        </p>

                        {registration.userEmail && (
                          <p className="mt-1 text-xs text-slate-500">
                            {registration.userEmail}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold capitalize text-slate-600">
                            Registration: {registration.status || "pending"}
                          </span>
                          <span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold capitalize text-blue-700">
                            Attendance: {registration.attendanceStatus || "pending"}
                          </span>
                          <span className="inline-flex rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold capitalize text-amber-700">
                            Reward: {registration.rewardStatus || "pending"}
                          </span>
                        </div>

                        {registration.reward?.type && (
                          <p className="mt-2 text-xs text-slate-500">
                            Reward: <span className="font-semibold capitalize">
                              {registration.reward.type}
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        {registration.status !== "Approved" && (
                          <button
                            type="button"
                            disabled={processingRegistrationId === registration.id}
                            onClick={() => handleRegistrationStatus(registration, "Approved")}
                            className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            <Check size={14} />
                            Approve
                          </button>
                        )}

                        {registration.status !== "Rejected" && (
                          <button
                            type="button"
                            disabled={processingRegistrationId === registration.id}
                            onClick={() => handleRegistrationStatus(registration, "Rejected")}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            <X size={14} />
                            Reject
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={processingRegistrationId === registration.id}
                          onClick={() => handleAttendanceStatus(registration, "present")}
                          className="inline-flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50"
                        >
                          <Check size={14} />
                          Present
                        </button>

                        <button
                          type="button"
                          disabled={processingRegistrationId === registration.id}
                          onClick={() => handleAttendanceStatus(registration, "absent")}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          <X size={14} />
                          Absent
                        </button>

                        {registration.attendanceStatus === "present" &&
                          registration.rewardStatus !== "distributed" && (
                            <button
                              type="button"
                              disabled={processingRegistrationId === registration.id}
                              onClick={() => handleDistributeReward(registration)}
                              className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                            >
                              Reward
                            </button>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommunityEventsAdmin