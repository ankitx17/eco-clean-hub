import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ImagePlus,
  MapPin,
  Plus,
  Send,
  Users,
  X,
} from "lucide-react"
import useAuth from "../../hooks/useAuth"
import {
  cancelCommunityEventRegistration,
  createCommunityEvent,
  getCommunityEvents,
  getUserCommunityEventRegistrations,
  registerForCommunityEvent,
  subscribeToCommunityEventUpdates,
} from "../../services/communityEventService"

function formatEventDate(dateValue) {
  if (!dateValue) {
    return "Date not available"
  }

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return "Date not available"
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatEventTime(event) {
  const startTime = String(
    event?.startTime || ""
  ).trim()

  const endTime = String(
    event?.endTime || ""
  ).trim()

  if (!startTime && !endTime) {
    return ""
  }

  if (startTime && endTime) {
    return `${startTime} - ${endTime}`
  }

  return startTime || endTime
}

function getEventStatus(event) {
  const status = String(
    event?.status || ""
  )
    .trim()
    .toLowerCase()

  if (status === "cancelled") {
    return "cancelled"
  }

  if (status === "completed") {
    return "completed"
  }

  if (
    status === "approved" ||
    status === "upcoming" ||
    status === "ongoing"
  ) {
    return status
  }

  if (event?.eventDate) {
    const eventDate = new Date(
      event.eventDate
    )

    if (
      !Number.isNaN(eventDate.getTime()) &&
      eventDate < new Date()
    ) {
      return "completed"
    }
  }

  return "upcoming"
}

function getStatusLabel(status) {
  if (status === "ongoing") {
    return "Ongoing"
  }

  if (status === "completed") {
    return "Completed"
  }

  if (status === "cancelled") {
    return "Cancelled"
  }

  return "Upcoming"
}

function getRegistrationStatusLabel(status) {
  const normalized = String(status || "pending")
    .trim()
    .toLowerCase()

  if (normalized === "approved") {
    return "Approved"
  }

  if (normalized === "rejected") {
    return "Rejected"
  }

  if (normalized === "verified") {
    return "Verified"
  }

  return "Pending"
}

function getAttendanceStatusLabel(status) {
  const normalized = String(status || "pending")
    .trim()
    .toLowerCase()

  if (normalized === "present") {
    return "Present"
  }

  if (normalized === "absent") {
    return "Absent"
  }

  return "Pending"
}

function getRewardStatusLabel(status) {
  const normalized = String(status || "pending")
    .trim()
    .toLowerCase()

  if (normalized === "distributed") {
    return "Distributed"
  }

  if (normalized === "not-eligible") {
    return "Not eligible"
  }

  return "Pending"
}

function CommunityEvents() {
  const { user } = useAuth()

  const [events, setEvents] = useState([])
  const [registeredEventIds, setRegisteredEventIds] =
    useState([])
  const [userRegistrations, setUserRegistrations] =
    useState([])
  const [loading, setLoading] = useState(true)
  const [actionEventId, setActionEventId] =
    useState(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creatingEvent, setCreatingEvent] = useState(false)

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    purpose: "",
    category: "Community Cleanup",
    location: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    organizerName: user?.displayName || "",
    organizerPhone: "",
    organizerEmail: user?.email || "",
    whatsappGroup: "",
    registrationEmail: user?.email || "",
    requiredVolunteers: "",
    maxParticipants: "",
    whatToBring: "",
    safetyInstructions: "",
    imageUrl: "",
    rewardConfig: {
      types: [],
      details: "",
    },
  })

  const handleFormChange = (field, value) => {
    setEventForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const toggleRewardType = (type) => {
    setEventForm((current) => {
      const types = Array.isArray(current.rewardConfig?.types)
        ? current.rewardConfig.types
        : []

      let nextTypes

      if (types.includes(type)) {
        nextTypes = types.filter((item) => item !== type)
      } else if (type === "none") {
        nextTypes = ["none"]
      } else {
        nextTypes = [
          ...types.filter((item) => item !== "none"),
          type,
        ]
      }

      return {
        ...current,
        rewardConfig: {
          ...current.rewardConfig,
          types: nextTypes,
        },
      }
    })
  }

  const resetEventForm = () => {
    setEventForm({
      title: "",
      description: "",
      purpose: "",
      category: "Community Cleanup",
      location: "",
      eventDate: "",
      startTime: "",
      endTime: "",
      organizerName: user?.displayName || "",
      organizerPhone: "",
      organizerEmail: user?.email || "",
      whatsappGroup: "",
      registrationEmail: user?.email || "",
      requiredVolunteers: "",
      maxParticipants: "",
      whatToBring: "",
      safetyInstructions: "",
      imageUrl: "",
      rewardConfig: {
        types: [],
        details: "",
      },
    })
  }

  const handleCreateEvent = async (event) => {
    event.preventDefault()

    if (!user?.uid) {
      setError("Please log in to submit a community event.")
      setMessage("")
      return
    }

    setCreatingEvent(true)
    setMessage("")
    setError("")

    try {
      await createCommunityEvent({
        ...eventForm,
        organizerName:
          eventForm.organizerName ||
          user.displayName ||
          "Eco Citizen",
        organizerEmail:
          eventForm.organizerEmail ||
          user.email ||
          "",
        organizerUid: user.uid,
        organizerPhone: eventForm.organizerPhone,
        contactNumber: eventForm.organizerPhone,
        registrationEmail:
          eventForm.registrationEmail ||
          eventForm.organizerEmail ||
          user.email ||
          "",
        requiredVolunteers: Number(
          eventForm.requiredVolunteers || 0
        ),
        maxParticipants: Number(
          eventForm.maxParticipants || 0
        ),
        rewardConfig: {
          types: Array.isArray(eventForm.rewardConfig?.types)
            ? eventForm.rewardConfig.types
            : [],
          details:
            eventForm.rewardConfig?.details || "",
        },
        status: "pending",
      })

      resetEventForm()
      setShowCreateForm(false)
      await refreshData()

      setMessage(
        "Event request submitted successfully. It is now pending admin review."
      )
    } catch (createError) {
      setError(
        createError?.message ||
          "Unable to submit the community event request."
      )
    } finally {
      setCreatingEvent(false)
    }
  }

  const loadEvents = useCallback(
    async () => {
      try {
        const loadedEvents =
          await getCommunityEvents()

        setEvents(
          Array.isArray(loadedEvents)
            ? loadedEvents
            : []
        )
      } catch (loadError) {
        console.error(
          "Unable to load community events:",
          loadError
        )

        setError(
          loadError?.message ||
            "Unable to load community events."
        )
      }
    },
    []
  )

  const loadRegistrations = useCallback(
    async () => {
      if (!user?.uid) {
        setRegisteredEventIds([])
        setUserRegistrations([])
        return
      }

      try {
        const registrations =
          await getUserCommunityEventRegistrations(
            user.uid
          )

        const normalizedRegistrations =
          Array.isArray(registrations)
            ? registrations.filter(
                (registration) =>
                  registration?.eventId
              )
            : []

        setUserRegistrations(
          normalizedRegistrations
        )

        setRegisteredEventIds(
          normalizedRegistrations
            .map(
              (registration) =>
                registration.eventId
            )
            .filter(Boolean)
        )
      } catch (registrationError) {
        console.error(
          "Unable to load event registrations:",
          registrationError
        )
      }
    },
    [user?.uid]
  )

  const refreshData = useCallback(
    async () => {
      await Promise.all([
        loadEvents(),
        loadRegistrations(),
      ])
    },
    [loadEvents, loadRegistrations]
  )

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      setLoading(true)

      try {
        await refreshData()
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initialize()

    const unsubscribe =
      subscribeToCommunityEventUpdates(
        () => {
          if (mounted) {
            refreshData()
          }
        }
      )

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [refreshData])

  const visibleEvents = useMemo(() => {
    return [...events]
      .filter((event) => {
        const status = getEventStatus(event)

        return [
          "upcoming",
          "ongoing",
          "completed",
          "cancelled",
        ].includes(status)
      })
      .sort((a, b) => {
        const first = new Date(
          a.eventDate ||
            a.date ||
            0
        ).getTime()

        const second = new Date(
          b.eventDate ||
            b.date ||
            0
        ).getTime()

        return first - second
      })
  }, [events])

  const handleRegister = async (event) => {
    if (!user?.uid) {
      setError(
        "Please log in to register for a community event."
      )
      setMessage("")
      return
    }

    setActionEventId(event.id)
    setMessage("")
    setError("")

    try {
      await registerForCommunityEvent(
        event.id,
        {
          userUid: user.uid,
          userName:
            user.displayName ||
            user.email ||
            "Eco Citizen",
          userEmail:
            user.email || "",
          email:
            user.email || "",
        }
      )

      await refreshData()

      setMessage(
        `You are registered for "${event.title}". Your registration is pending admin approval.`
      )
    } catch (registrationError) {
      setError(
        registrationError?.message ||
          "Unable to register for this event."
      )
    } finally {
      setActionEventId(null)
    }
  }

  const handleCancelRegistration =
    async (event) => {
      if (!user?.uid) {
        return
      }

      setActionEventId(event.id)
      setMessage("")
      setError("")

      try {
        await cancelCommunityEventRegistration(
          event.id,
          user.uid
        )

        await refreshData()

        setMessage(
          `Registration cancelled for "${event.title}".`
        )
      } catch (registrationError) {
        setError(
          registrationError?.message ||
            "Unable to cancel your registration."
        )
      } finally {
        setActionEventId(null)
      }
    }

  if (loading) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-56 rounded bg-gray-200" />
          <div className="h-4 w-80 max-w-full rounded bg-gray-200" />
          <div className="h-40 rounded-2xl bg-gray-100" />
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
            <CalendarDays size={23} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Community Events
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Join local eco activities and make a positive impact together.
            </p>
          </div>
        </div>

        {user?.uid && (
          <button
            type="button"
            onClick={() => {
              setShowCreateForm((current) => !current)
              setMessage("")
              setError("")
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            <Plus size={17} />
            {showCreateForm
              ? "Close Request Form"
              : "Create Event Request"}
          </button>
        )}
      </div>

      {showCreateForm && (
        <form
          onSubmit={handleCreateEvent}
          className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <Send size={19} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Submit a Community Event
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Your request will be reviewed by an admin before it becomes public.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Event Title *
              </label>
              <input
                required
                value={eventForm.title}
                onChange={(e) =>
                  handleFormChange("title", e.target.value)
                }
                placeholder="e.g. Sunday Lake Cleanup Drive"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Category
              </label>
              <select
                value={eventForm.category}
                onChange={(e) =>
                  handleFormChange("category", e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
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
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Location *
              </label>
              <input
                required
                value={eventForm.location}
                onChange={(e) =>
                  handleFormChange("location", e.target.value)
                }
                placeholder="Venue / area / address"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={eventForm.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
                placeholder="Describe the event and activities..."
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Purpose
              </label>
              <textarea
                rows={3}
                value={eventForm.purpose}
                onChange={(e) =>
                  handleFormChange("purpose", e.target.value)
                }
                placeholder="What environmental impact do you want to create?"
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Event Date *
              </label>
              <input
                required
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={eventForm.eventDate}
                onChange={(e) =>
                  handleFormChange("eventDate", e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                value={eventForm.startTime}
                onChange={(e) =>
                  handleFormChange("startTime", e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                End Time
              </label>
              <input
                type="time"
                value={eventForm.endTime}
                onChange={(e) =>
                  handleFormChange("endTime", e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Organizer Name
              </label>
              <input
                value={eventForm.organizerName}
                onChange={(e) =>
                  handleFormChange("organizerName", e.target.value)
                }
                placeholder={user?.displayName || "Your name"}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Contact Number
              </label>
              <input
                type="tel"
                value={eventForm.organizerPhone}
                onChange={(e) =>
                  handleFormChange("organizerPhone", e.target.value)
                }
                placeholder="Phone number"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Organizer Email
              </label>
              <input
                type="email"
                value={eventForm.organizerEmail}
                onChange={(e) =>
                  handleFormChange("organizerEmail", e.target.value)
                }
                placeholder={user?.email || "organizer@example.com"}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Registration Email
              </label>
              <input
                type="email"
                value={eventForm.registrationEmail}
                onChange={(e) =>
                  handleFormChange("registrationEmail", e.target.value)
                }
                placeholder="Participant registration/contact email"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                WhatsApp Group Link
              </label>
              <input
                type="url"
                value={eventForm.whatsappGroup}
                onChange={(e) =>
                  handleFormChange("whatsappGroup", e.target.value)
                }
                placeholder="https://chat.whatsapp.com/..."
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Required Volunteers
              </label>
              <input
                type="number"
                min="0"
                value={eventForm.requiredVolunteers}
                onChange={(e) =>
                  handleFormChange(
                    "requiredVolunteers",
                    e.target.value
                  )
                }
                placeholder="e.g. 20"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Maximum Participants
              </label>
              <input
                type="number"
                min="0"
                value={eventForm.maxParticipants}
                onChange={(e) =>
                  handleFormChange(
                    "maxParticipants",
                    e.target.value
                  )
                }
                placeholder="0 = no limit"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                What to Bring
              </label>
              <textarea
                rows={3}
                value={eventForm.whatToBring}
                onChange={(e) =>
                  handleFormChange("whatToBring", e.target.value)
                }
                placeholder="Gloves, water bottle, cap, etc."
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Safety Instructions
              </label>
              <textarea
                rows={3}
                value={eventForm.safetyInstructions}
                onChange={(e) =>
                  handleFormChange(
                    "safetyInstructions",
                    e.target.value
                  )
                }
                placeholder="Safety rules and important instructions..."
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <ImagePlus size={16} />
                Event Image URL
              </label>
              <input
                type="url"
                value={eventForm.imageUrl}
                onChange={(e) =>
                  handleFormChange("imageUrl", e.target.value)
                }
                placeholder="https://..."
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="md:col-span-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <label className="mb-3 block text-sm font-semibold text-gray-700">
                Participant Rewards
              </label>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  "certificate",
                  "goodies",
                  "coins",
                  "cash",
                  "none",
                ].map((type) => (
                  <label
                    key={type}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={eventForm.rewardConfig.types.includes(type)}
                      onChange={() => toggleRewardType(type)}
                      className="h-4 w-4 accent-green-600"
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>

              <textarea
                rows={2}
                value={eventForm.rewardConfig.details}
                onChange={(e) =>
                  setEventForm((current) => ({
                    ...current,
                    rewardConfig: {
                      ...current.rewardConfig,
                      details: e.target.value,
                    },
                  }))
                }
                placeholder="Reward details, amount, certificate criteria, etc."
                className="mt-3 w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                resetEventForm()
                setShowCreateForm(false)
              }}
              disabled={creatingEvent}
              className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creatingEvent}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <Send size={17} />
              {creatingEvent
                ? "Submitting..."
                : "Submit for Review"}
            </button>
          </div>
        </form>
      )}

      {message && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2
            className="mt-0.5 shrink-0"
            size={18}
          />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 rounded-md p-1 hover:bg-red-100"
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {visibleEvents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
          <CalendarDays
            size={42}
            className="mx-auto text-gray-400"
          />

          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No community events yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            New approved community activities will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleEvents.map((event) => {
            const userRegistration =
              userRegistrations.find(
                (registration) =>
                  registration?.eventId ===
                  event.id
              )

            const isRegistered =
              Boolean(userRegistration) ||
              registeredEventIds.includes(
                event.id
              )

            const status =
              getEventStatus(event)

            const isCompleted =
              status === "completed"

            const isCancelled =
              status === "cancelled"

            const isOngoing =
              status === "ongoing"

            const registeredCount =
              Number(
                event.registeredCount ??
                  event.registrationCount ??
                  0
              )

            const maxParticipants =
              Number(
                event.maxParticipants || 0
              )

            const isFull =
              maxParticipants > 0 &&
              registeredCount >=
                maxParticipants

            const dateText =
              formatEventDate(
                event.eventDate ||
                  event.date
              )

            const timeText =
              formatEventTime(event)

            const buttonDisabled =
              actionEventId === event.id ||
              isCompleted ||
              isCancelled ||
              isFull

            return (
              <article
                key={event.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
                    <CalendarDays
                      size={48}
                      className="text-green-600"
                    />
                  </div>
                )}

                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      {event.title}
                    </h3>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isCancelled
                          ? "bg-red-100 text-red-700"
                          : isCompleted
                            ? "bg-gray-100 text-gray-700"
                            : isOngoing
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                      }`}
                    >
                      {getStatusLabel(
                        status
                      )}
                    </span>
                  </div>

                  <p className="line-clamp-3 text-sm leading-6 text-gray-600">
                    {event.description ||
                      "Community eco activity."}
                  </p>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        size={16}
                        className="shrink-0 text-green-600"
                      />

                      <span>
                        {dateText}
                      </span>

                      {timeText && (
                        <>
                          <span>•</span>

                          <Clock3
                            size={15}
                            className="shrink-0 text-green-600"
                          />

                          <span>
                            {timeText}
                          </span>
                        </>
                      )}
                    </div>

                    {event.location && (
                      <div className="flex items-start gap-2">
                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0 text-green-600"
                        />

                        <span>
                          {event.location}
                        </span>
                      </div>
                    )}

                    {(
                      maxParticipants > 0 ||
                      registeredCount > 0
                    ) && (
                      <div className="flex items-center gap-2">
                        <Users
                          size={16}
                          className="shrink-0 text-green-600"
                        />

                        <span>
                          {registeredCount}

                          {maxParticipants >
                            0
                            ? ` / ${maxParticipants}`
                            : ""}{" "}
                          participants
                        </span>
                      </div>
                    )}
                  </div>

                  {isRegistered && (
                    <div className="rounded-xl border border-green-100 bg-green-50 p-3">
                      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-green-800">
                        My Participation
                      </div>

                      <div className="grid gap-2 text-sm sm:grid-cols-3">
                        <div className="rounded-lg bg-white px-3 py-2">
                          <div className="text-xs text-gray-500">
                            Registration
                          </div>
                          <div className="mt-0.5 font-semibold text-gray-900">
                            {getRegistrationStatusLabel(
                              userRegistration?.status
                            )}
                          </div>
                        </div>

                        <div className="rounded-lg bg-white px-3 py-2">
                          <div className="text-xs text-gray-500">
                            Attendance
                          </div>
                          <div className="mt-0.5 font-semibold text-gray-900">
                            {getAttendanceStatusLabel(
                              userRegistration?.attendanceStatus
                            )}
                          </div>
                        </div>

                        <div className="rounded-lg bg-white px-3 py-2">
                          <div className="text-xs text-gray-500">
                            Reward
                          </div>
                          <div className="mt-0.5 font-semibold text-gray-900">
                            {getRewardStatusLabel(
                              userRegistration?.rewardStatus
                            )}
                          </div>
                        </div>
                      </div>

                      {String(
                        userRegistration?.rewardStatus || ""
                      ).toLowerCase() === "distributed" &&
                        userRegistration?.reward && (
                          <div className="mt-2 rounded-lg bg-white px-3 py-2 text-xs text-gray-600">
                            <span className="font-semibold text-gray-800">
                              Reward:
                            </span>{" "}
                            {userRegistration.reward.type ||
                              "Reward"}
                            {userRegistration.reward.details
                              ? ` — ${userRegistration.reward.details}`
                              : ""}
                          </div>
                        )}
                    </div>
                  )}

                  {isRegistered ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleCancelRegistration(
                          event
                        )
                      }
                      disabled={
                        actionEventId ===
                          event.id ||
                        isCompleted ||
                        isCancelled
                      }
                      className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionEventId ===
                      event.id
                        ? "Processing..."
                        : isCompleted
                          ? "Event Completed"
                          : isCancelled
                            ? "Event Cancelled"
                            : "Cancel Registration"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleRegister(
                          event
                        )
                      }
                      disabled={
                        buttonDisabled
                      }
                      className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      {actionEventId ===
                      event.id
                        ? "Registering..."
                        : isCompleted
                          ? "Event Completed"
                          : isCancelled
                            ? "Event Cancelled"
                            : isFull
                              ? "Event Full"
                              : "Register Now"}
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default CommunityEvents