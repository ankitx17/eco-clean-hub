import { useEffect, useMemo, useState } from "react"
import {
  CalendarDays,
  Check,
  Edit3,
  MapPin,
  Plus,
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
  subscribeToCommunityEventUpdates,
} from "../../src/services/communityEventService"

const EMPTY_FORM = {
  title: "",
  description: "",
  location: "",
  date: "",
  imageUrl: "",
  maxParticipants: "",
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const loadEvents = () => {
    const storedEvents = getCommunityEvents()
    setEvents(Array.isArray(storedEvents) ? storedEvents : [])
  }

  const loadRegistrations = (eventId) => {
    if (!eventId) {
      setRegistrations([])
      return
    }

    const storedRegistrations =
      getCommunityEventRegistrations(eventId)

    setRegistrations(
      Array.isArray(storedRegistrations) ? storedRegistrations : []
    )
  }

  useEffect(() => {
    loadEvents()
    setLoading(false)

    const unsubscribe = subscribeToCommunityEventUpdates(() => {
      loadEvents()

      if (selectedEvent?.id) {
        loadRegistrations(selectedEvent.id)
      }
    })

    return unsubscribe
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

  const handleSubmit = (event) => {
    event.preventDefault()

    setError("")
    setSuccess("")
    setSaving(true)

    try {
      const eventData = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        date: form.date,
        imageUrl: form.imageUrl.trim(),
        maxParticipants: form.maxParticipants
          ? Number(form.maxParticipants)
          : null,
      }

      if (editingEventId) {
        updateCommunityEvent(editingEventId, eventData)
        setSuccess("Community event updated successfully.")
      } else {
        createCommunityEvent(eventData)
        setSuccess("Community event created successfully.")
      }

      resetForm()
      loadEvents()
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
      location: event.location || "",
      date: event.date
        ? new Date(event.date).toISOString().slice(0, 16)
        : "",
      imageUrl: event.imageUrl || "",
      maxParticipants:
        event.maxParticipants !== null &&
        event.maxParticipants !== undefined
          ? String(event.maxParticipants)
          : "",
    })

    setError("")
    setSuccess("")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = (event) => {
    const confirmed = window.confirm(
      `Delete "${event.title}"? This action cannot be undone.`
    )

    if (!confirmed) return

    setError("")
    setSuccess("")

    try {
      deleteCommunityEvent(event.id)

      if (selectedEvent?.id === event.id) {
        setSelectedEvent(null)
        setRegistrations([])
      }

      if (editingEventId === event.id) {
        resetForm()
      }

      loadEvents()
      setSuccess("Community event deleted successfully.")
    } catch (deleteError) {
      setError(
        deleteError?.message ||
          "Unable to delete the community event."
      )
    }
  }

  const handleViewParticipants = (event) => {
    setSelectedEvent(event)
    loadRegistrations(event.id)
    setError("")
    setSuccess("")
  }

  const handleRegistrationStatus = (
    registration,
    status
  ) => {
    if (!selectedEvent?.id || !registration?.id) return

    try {
      updateCommunityEventRegistrationStatus(
        selectedEvent.id,
        registration.id,
        status
      )

      loadRegistrations(selectedEvent.id)
      loadEvents()

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
                      <div>
                        <p className="font-semibold text-slate-900">
                          {registration.userName ||
                            "Eco Citizen"}
                        </p>

                        {registration.userEmail && (
                          <p className="mt-1 text-xs text-slate-500">
                            {registration.userEmail}
                          </p>
                        )}

                        <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold capitalize text-slate-600">
                          {registration.status || "pending"}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleRegistrationStatus(
                              registration,
                              "Approved"
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          <Check size={14} />
                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleRegistrationStatus(
                              registration,
                              "Rejected"
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          <X size={14} />
                          Reject
                        </button>
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