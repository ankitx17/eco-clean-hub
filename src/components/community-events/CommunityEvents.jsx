import { useCallback, useEffect, useMemo, useState } from "react"
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Users,
  X,
} from "lucide-react"
import useAuth from "../../hooks/useAuth"
import {
  cancelCommunityEventRegistration,
  getCommunityEvents,
  getUserCommunityEventRegistrations,
  registerForCommunityEvent,
  subscribeToCommunityEventUpdates,
} from "../../services/communityEventService"

function formatEventDate(dateValue) {
  if (!dateValue) return "Date not available"

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

function formatEventTime(dateValue) {
  if (!dateValue) return ""

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function getEventStatus(event) {
  if (event.status) {
    return String(event.status).toLowerCase()
  }

  if (event.date) {
    const eventDate = new Date(event.date)

    if (!Number.isNaN(eventDate.getTime()) && eventDate < new Date()) {
      return "completed"
    }
  }

  return "upcoming"
}

function CommunityEvents() {
  const { user } = useAuth()

  const [events, setEvents] = useState([])
  const [registeredEventIds, setRegisteredEventIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionEventId, setActionEventId] = useState(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const loadEvents = useCallback(() => {
    const storedEvents = getCommunityEvents()
    setEvents(Array.isArray(storedEvents) ? storedEvents : [])
  }, [])

  const loadRegistrations = useCallback(() => {
    if (!user?.uid) {
      setRegisteredEventIds([])
      return
    }

    const registrations = getUserCommunityEventRegistrations(user.uid)

    setRegisteredEventIds(
      registrations
        .map((registration) => registration.eventId)
        .filter(Boolean)
    )
  }, [user?.uid])

  useEffect(() => {
    setLoading(true)

    loadEvents()
    loadRegistrations()

    setLoading(false)

    const unsubscribe = subscribeToCommunityEventUpdates(() => {
      loadEvents()
      loadRegistrations()
    })

    return unsubscribe
  }, [loadEvents, loadRegistrations])

  const visibleEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const first = new Date(a.date || 0).getTime()
      const second = new Date(b.date || 0).getTime()

      return first - second
    })
  }, [events])

  const handleRegister = (event) => {
    if (!user?.uid) {
      setError("Please log in to register for a community event.")
      setMessage("")
      return
    }

    setActionEventId(event.id)
    setMessage("")
    setError("")

    try {
      registerForCommunityEvent(event.id, {
        userUid: user.uid,
        userName: user.displayName || user.email || "Eco Citizen",
        userEmail: user.email || "",
      })

      loadEvents()
      loadRegistrations()

      setMessage(`You are registered for "${event.title}".`)
    } catch (registrationError) {
      setError(
        registrationError?.message ||
          "Unable to register for this event."
      )
    } finally {
      setActionEventId(null)
    }
  }

  const handleCancelRegistration = (event) => {
    if (!user?.uid) return

    setActionEventId(event.id)
    setMessage("")
    setError("")

    try {
      cancelCommunityEventRegistration(event.id, user.uid)

      loadEvents()
      loadRegistrations()

      setMessage(`Registration cancelled for "${event.title}".`)
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
      <div>
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
      </div>

      {message && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
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
            New community activities will appear here when they are created.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleEvents.map((event) => {
            const isRegistered = registeredEventIds.includes(event.id)
            const status = getEventStatus(event)
            const isCompleted = status === "completed"
            const isCancelled = status === "cancelled"
            const isFull =
              Number.isFinite(Number(event.maxParticipants)) &&
              Number(event.maxParticipants) > 0 &&
              Number(event.registeredCount || 0) >=
                Number(event.maxParticipants)

            const dateText = formatEventDate(event.date)
            const timeText = formatEventTime(event.date)

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
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {isCancelled
                        ? "Cancelled"
                        : isCompleted
                          ? "Completed"
                          : "Upcoming"}
                    </span>
                  </div>

                  <p className="line-clamp-3 text-sm leading-6 text-gray-600">
                    {event.description || "Community eco activity."}
                  </p>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        size={16}
                        className="shrink-0 text-green-600"
                      />
                      <span>{dateText}</span>

                      {timeText && (
                        <>
                          <span>•</span>
                          <Clock3
                            size={15}
                            className="shrink-0 text-green-600"
                          />
                          <span>{timeText}</span>
                        </>
                      )}
                    </div>

                    {event.location && (
                      <div className="flex items-start gap-2">
                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0 text-green-600"
                        />
                        <span>{event.location}</span>
                      </div>
                    )}

                    {(event.maxParticipants ||
                      event.registeredCount !== undefined) && (
                      <div className="flex items-center gap-2">
                        <Users
                          size={16}
                          className="shrink-0 text-green-600"
                        />

                        <span>
                          {Number(event.registeredCount || 0)}
                          {event.maxParticipants
                            ? ` / ${event.maxParticipants}`
                            : ""}{" "}
                          participants
                        </span>
                      </div>
                    )}
                  </div>

                  {isRegistered ? (
                    <button
                      type="button"
                      onClick={() => handleCancelRegistration(event)}
                      disabled={actionEventId === event.id || isCompleted}
                      className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionEventId === event.id
                        ? "Processing..."
                        : "Cancel Registration"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRegister(event)}
                      disabled={
                        actionEventId === event.id ||
                        isCompleted ||
                        isCancelled ||
                        isFull
                      }
                      className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      {actionEventId === event.id
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