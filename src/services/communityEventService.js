const COMMUNITY_EVENTS_STORAGE_KEY =
  "eco_clean_hub_community_events"

const COMMUNITY_EVENTS_UPDATED_EVENT =
  "eco-clean-hub-community-events-updated"


function createId(prefix = "event") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`
}


function getStoredEvents() {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const saved = localStorage.getItem(
      COMMUNITY_EVENTS_STORAGE_KEY
    )

    if (!saved) {
      return []
    }

    const parsed = JSON.parse(saved)

    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error(
      "Unable to load community events:",
      error
    )

    return []
  }
}


function saveEvents(events) {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem(
      COMMUNITY_EVENTS_STORAGE_KEY,
      JSON.stringify(events)
    )

    window.dispatchEvent(
      new Event(COMMUNITY_EVENTS_UPDATED_EVENT)
    )
  } catch (error) {
    console.error(
      "Unable to save community events:",
      error
    )

    throw new Error(
      "Unable to save community event data."
    )
  }
}


function normalizeEvent(event) {
  const registrations = Array.isArray(
    event?.registrations
  )
    ? event.registrations
    : []

  return {
    id:
      event?.id ||
      createId("community-event"),

    title:
      String(event?.title || "").trim(),

    description:
      String(event?.description || "").trim(),

    category:
      String(event?.category || "Community Cleanup").trim(),

    location:
      String(event?.location || "").trim(),

    eventDate:
      String(event?.eventDate || "").trim(),

    startTime:
      String(event?.startTime || "").trim(),

    endTime:
      String(event?.endTime || "").trim(),

    organizerName:
      String(
        event?.organizerName ||
          "Eco Clean Hub"
      ).trim(),

    organizerUid:
      String(event?.organizerUid || "").trim(),

    imageUrl:
      String(event?.imageUrl || "").trim(),

    maxParticipants:
      Number.isFinite(
        Number(event?.maxParticipants)
      )
        ? Math.max(
            0,
            Number(event.maxParticipants)
          )
        : 0,

    status:
      event?.status === "cancelled"
        ? "cancelled"
        : event?.status === "completed"
          ? "completed"
          : "upcoming",

    registrations,

    registrationCount:
      registrations.length,

    createdAt:
      event?.createdAt ||
      new Date().toISOString(),

    updatedAt:
      event?.updatedAt ||
      new Date().toISOString(),
  }
}


export function getCommunityEvents() {
  return getStoredEvents()
    .map(normalizeEvent)
    .sort(
      (a, b) =>
        new Date(a.eventDate || a.createdAt) -
        new Date(b.eventDate || b.createdAt)
    )
}


export function getCommunityEventById(eventId) {
  if (!eventId) {
    return null
  }

  const event = getStoredEvents().find(
    (item) => item?.id === eventId
  )

  return event
    ? normalizeEvent(event)
    : null
}


export function createCommunityEvent(eventData) {
  const title =
    String(eventData?.title || "").trim()

  const description =
    String(eventData?.description || "").trim()

  const location =
    String(eventData?.location || "").trim()

  const eventDate =
    String(eventData?.eventDate || "").trim()

  if (!title) {
    throw new Error(
      "Community event title is required."
    )
  }

  if (!description) {
    throw new Error(
      "Community event description is required."
    )
  }

  if (!location) {
    throw new Error(
      "Community event location is required."
    )
  }

  if (!eventDate) {
    throw new Error(
      "Community event date is required."
    )
  }

  const now = new Date().toISOString()

  const newEvent = normalizeEvent({
    ...eventData,

    id: createId("community-event"),

    title,

    description,

    location,

    eventDate,

    createdAt: now,

    updatedAt: now,

    registrations: [],

    status: "upcoming",
  })

  const events = getStoredEvents()

  saveEvents([
    ...events,
    newEvent,
  ])

  return newEvent
}


export function updateCommunityEvent(
  eventId,
  updates
) {
  if (!eventId) {
    throw new Error(
      "Community event ID is required."
    )
  }

  const events = getStoredEvents()

  const index = events.findIndex(
    (event) => event?.id === eventId
  )

  if (index === -1) {
    throw new Error(
      "Community event was not found."
    )
  }

  const currentEvent =
    normalizeEvent(events[index])

  const updatedEvent =
    normalizeEvent({
      ...currentEvent,
      ...updates,

      id: currentEvent.id,

      registrations:
        currentEvent.registrations,

      createdAt:
        currentEvent.createdAt,

      updatedAt:
        new Date().toISOString(),
    })

  const updatedEvents = [...events]

  updatedEvents[index] = updatedEvent

  saveEvents(updatedEvents)

  return updatedEvent
}


export function deleteCommunityEvent(
  eventId
) {
  if (!eventId) {
    throw new Error(
      "Community event ID is required."
    )
  }

  const events = getStoredEvents()

  const exists = events.some(
    (event) => event?.id === eventId
  )

  if (!exists) {
    throw new Error(
      "Community event was not found."
    )
  }

  const updatedEvents = events.filter(
    (event) => event?.id !== eventId
  )

  saveEvents(updatedEvents)

  return true
}


export function registerForCommunityEvent(
  eventId,
  registrationData
) {
  if (!eventId) {
    throw new Error(
      "Community event ID is required."
    )
  }

  const userUid =
    String(
      registrationData?.userUid || ""
    ).trim()

  if (!userUid) {
    throw new Error(
      "User authentication is required to register."
    )
  }

  const events = getStoredEvents()

  const eventIndex = events.findIndex(
    (event) => event?.id === eventId
  )

  if (eventIndex === -1) {
    throw new Error(
      "Community event was not found."
    )
  }

  const currentEvent =
    normalizeEvent(events[eventIndex])

  if (currentEvent.status !== "upcoming") {
    throw new Error(
      "Registration is not available for this event."
    )
  }

  const alreadyRegistered =
    currentEvent.registrations.some(
      (registration) =>
        registration?.userUid === userUid
    )

  if (alreadyRegistered) {
    throw new Error(
      "You are already registered for this event."
    )
  }

  if (
    currentEvent.maxParticipants > 0 &&
    currentEvent.registrations.length >=
      currentEvent.maxParticipants
  ) {
    throw new Error(
      "This event has reached its participant limit."
    )
  }

  const registration = {
    id: createId("event-registration"),

    eventId,

    userUid,

    userName:
      String(
        registrationData?.userName ||
          "Eco Citizen"
      ).trim(),

    email:
      String(
        registrationData?.email || ""
      ).trim(),

    phone:
      String(
        registrationData?.phone || ""
      ).trim(),

    status: "pending",

    registeredAt:
      new Date().toISOString(),

    verifiedAt: null,

    verifiedBy: "",

    adminNote: "",
  }

  const updatedEvent =
    normalizeEvent({
      ...currentEvent,

      registrations: [
        ...currentEvent.registrations,
        registration,
      ],

      updatedAt:
        new Date().toISOString(),
    })

  const updatedEvents = [...events]

  updatedEvents[eventIndex] = updatedEvent

  saveEvents(updatedEvents)

  return registration
}


export function cancelCommunityEventRegistration(
  eventId,
  userUid
) {
  if (!eventId) {
    throw new Error(
      "Community event ID is required."
    )
  }

  if (!userUid) {
    throw new Error(
      "User authentication is required."
    )
  }

  const events = getStoredEvents()

  const eventIndex = events.findIndex(
    (event) => event?.id === eventId
  )

  if (eventIndex === -1) {
    throw new Error(
      "Community event was not found."
    )
  }

  const currentEvent =
    normalizeEvent(events[eventIndex])

  const registrationExists =
    currentEvent.registrations.some(
      (registration) =>
        registration?.userUid === userUid
    )

  if (!registrationExists) {
    throw new Error(
      "Registration was not found."
    )
  }

  const updatedEvent =
    normalizeEvent({
      ...currentEvent,

      registrations:
        currentEvent.registrations.filter(
          (registration) =>
            registration?.userUid !== userUid
        ),

      updatedAt:
        new Date().toISOString(),
    })

  const updatedEvents = [...events]

  updatedEvents[eventIndex] = updatedEvent

  saveEvents(updatedEvents)

  return true
}


export function getCommunityEventRegistrations(
  eventId
) {
  if (!eventId) {
    return []
  }

  const event =
    getCommunityEventById(eventId)

  return event?.registrations || []
}


export function getUserCommunityEventRegistrations(
  userUid
) {
  if (!userUid) {
    return []
  }

  return getCommunityEvents().flatMap(
    (event) =>
      event.registrations
        .filter(
          (registration) =>
            registration?.userUid === userUid
        )
        .map((registration) => ({
          ...registration,

          eventTitle:
            event.title,

          eventDate:
            event.eventDate,

          eventLocation:
            event.location,
        }))
  )
}


export function updateCommunityEventRegistrationStatus(
  eventId,
  registrationId,
  status,
  adminData = {}
) {
  if (!eventId) {
    throw new Error(
      "Community event ID is required."
    )
  }

  if (!registrationId) {
    throw new Error(
      "Registration ID is required."
    )
  }

  const normalizedStatus =
    String(status || "")
      .trim()
      .toLowerCase()

  if (
    !["approved", "rejected", "pending"].includes(
      normalizedStatus
    )
  ) {
    throw new Error(
      "Invalid registration status."
    )
  }

  const events = getStoredEvents()

  const eventIndex = events.findIndex(
    (event) => event?.id === eventId
  )

  if (eventIndex === -1) {
    throw new Error(
      "Community event was not found."
    )
  }

  const currentEvent =
    normalizeEvent(events[eventIndex])

  const registrationIndex =
    currentEvent.registrations.findIndex(
      (registration) =>
        registration?.id === registrationId
    )

  if (registrationIndex === -1) {
    throw new Error(
      "Event registration was not found."
    )
  }

  const currentRegistration =
    currentEvent.registrations[
      registrationIndex
    ]

  const updatedRegistration = {
    ...currentRegistration,

    status: normalizedStatus,

    verifiedAt:
      normalizedStatus === "pending"
        ? null
        : new Date().toISOString(),

    verifiedBy:
      normalizedStatus === "pending"
        ? ""
        : String(
            adminData?.adminUid || ""
          ).trim(),

    adminNote:
      String(
        adminData?.adminNote || ""
      ).trim(),
  }

  const updatedRegistrations = [
    ...currentEvent.registrations,
  ]

  updatedRegistrations[
    registrationIndex
  ] = updatedRegistration

  const updatedEvent =
    normalizeEvent({
      ...currentEvent,

      registrations:
        updatedRegistrations,

      updatedAt:
        new Date().toISOString(),
    })

  const updatedEvents = [...events]

  updatedEvents[eventIndex] = updatedEvent

  saveEvents(updatedEvents)

  return updatedRegistration
}


export function subscribeToCommunityEventUpdates(
  callback
) {
  if (
    typeof window === "undefined" ||
    typeof callback !== "function"
  ) {
    return () => {}
  }

  const handleUpdate = () => {
    callback(getCommunityEvents())
  }

  window.addEventListener(
    COMMUNITY_EVENTS_UPDATED_EVENT,
    handleUpdate
  )

  window.addEventListener(
    "storage",
    handleUpdate
  )

  return () => {
    window.removeEventListener(
      COMMUNITY_EVENTS_UPDATED_EVENT,
      handleUpdate
    )

    window.removeEventListener(
      "storage",
      handleUpdate
    )
  }
}


export function clearCommunityEvents() {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem(
    COMMUNITY_EVENTS_STORAGE_KEY
  )

  window.dispatchEvent(
    new Event(
      COMMUNITY_EVENTS_UPDATED_EVENT
    )
  )
}


export {
  COMMUNITY_EVENTS_STORAGE_KEY,
  COMMUNITY_EVENTS_UPDATED_EVENT,
}