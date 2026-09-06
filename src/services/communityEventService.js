import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore"

import { db, auth } from "./firebase"

const COMMUNITY_EVENTS_COLLECTION = "communityEvents"

const COMMUNITY_EVENTS_STORAGE_KEY =
  "eco_clean_hub_community_events"

const COMMUNITY_EVENTS_UPDATED_EVENT =
  "eco-clean-hub-community-events-updated"

function createId(prefix = "event") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`
}

function timestampToValue(value) {
  if (!value) {
    return ""
  }

  if (
    typeof value === "object" &&
    typeof value.toDate === "function"
  ) {
    return value.toDate().toISOString()
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  return String(value)
}

function normalizeRegistration(registration) {
  const item = registration || {}

  return {
    id:
      String(
        item.id || createId("event-registration")
      ).trim(),

    eventId:
      String(item.eventId || "").trim(),

    userUid:
      String(
        item.userUid ||
          item.userId ||
          ""
      ).trim(),

    userName:
      String(
        item.userName ||
          item.name ||
          "Eco Citizen"
      ).trim(),

    email:
      String(
        item.email ||
          item.userEmail ||
          ""
      ).trim(),

    userEmail:
      String(
        item.userEmail ||
          item.email ||
          ""
      ).trim(),

    phone:
      String(
        item.phone ||
          item.phoneNumber ||
          ""
      ).trim(),

    status:
      ["approved", "rejected", "pending", "verified"]
        .includes(
          String(item.status || "")
            .trim()
            .toLowerCase()
        )
        ? String(item.status)
            .trim()
            .toLowerCase()
        : "pending",

    registeredAt:
      timestampToValue(item.registeredAt) ||
      new Date().toISOString(),

    verifiedAt:
      timestampToValue(item.verifiedAt) || null,

    verifiedBy:
      String(
        item.verifiedBy || ""
      ).trim(),

    adminNote:
      String(
        item.adminNote || ""
      ).trim(),

    attendanceStatus:
      String(
        item.attendanceStatus || "pending"
      ).trim().toLowerCase(),

    rewardStatus:
      String(
        item.rewardStatus || "pending"
      ).trim().toLowerCase(),

    rewardDistributedAt:
      timestampToValue(
        item.rewardDistributedAt
      ) || null,

    rewardDistributedBy:
      String(
        item.rewardDistributedBy || ""
      ).trim(),
  }
}

function normalizeEvent(event, id = "") {
  const item = event || {}

  const registrations = Array.isArray(
    item.registrations
  )
    ? item.registrations.map(
        normalizeRegistration
      )
    : []

  const eventDate = String(
    item.eventDate ||
      item.date ||
      ""
  ).trim()

  const startTime = String(
    item.startTime || ""
  ).trim()

  const endTime = String(
    item.endTime || ""
  ).trim()

  const maxParticipants = Number(
    item.maxParticipants
  )

  const normalizedMaxParticipants =
    Number.isFinite(maxParticipants)
      ? Math.max(
          0,
          maxParticipants
        )
      : 0

  const statusValue = String(
    item.status || "pending"
  )
    .trim()
    .toLowerCase()

  const allowedStatuses = [
    "pending",
    "approved",
    "rejected",
    "upcoming",
    "ongoing",
    "completed",
    "cancelled",
  ]

  const status = allowedStatuses.includes(
    statusValue
  )
    ? statusValue
    : "pending"

  const createdAt =
    timestampToValue(
      item.createdAt
    ) || new Date().toISOString()

  const updatedAt =
    timestampToValue(
      item.updatedAt
    ) || createdAt

  return {
    id:
      String(
        item.id || id || ""
      ).trim(),

    title:
      String(
        item.title || ""
      ).trim(),

    description:
      String(
        item.description || ""
      ).trim(),

    category:
      String(
        item.category ||
          "Community Cleanup"
      ).trim(),

    location:
      String(
        item.location || ""
      ).trim(),

    eventDate,

    date: eventDate,

    startTime,

    endTime,

    organizerName:
      String(
        item.organizerName ||
          item.creatorName ||
          "Eco Citizen"
      ).trim(),

    organizerUid:
      String(
        item.organizerUid ||
          item.creatorUid ||
          item.userId ||
          ""
      ).trim(),

    organizerEmail:
      String(
        item.organizerEmail ||
          item.creatorEmail ||
          ""
      ).trim(),

    organizerPhone:
      String(
        item.organizerPhone ||
          item.creatorPhone ||
          ""
      ).trim(),

    imageUrl:
      String(
        item.imageUrl || ""
      ).trim(),

    purpose:
      String(
        item.purpose || ""
      ).trim(),

    whatsappGroup:
      String(
        item.whatsappGroup || ""
      ).trim(),

    registrationEmail:
      String(
        item.registrationEmail || ""
      ).trim(),

    contactNumber:
      String(
        item.contactNumber ||
          item.organizerPhone ||
          ""
      ).trim(),

    maxParticipants:
      normalizedMaxParticipants,

    requiredVolunteers:
      Number.isFinite(
        Number(
          item.requiredVolunteers
        )
      )
        ? Math.max(
            0,
            Number(
              item.requiredVolunteers
            )
          )
        : 0,

    whatToBring:
      String(
        item.whatToBring || ""
      ).trim(),

    safetyInstructions:
      String(
        item.safetyInstructions || ""
      ).trim(),

    rewardConfig:
      item.rewardConfig &&
      typeof item.rewardConfig ===
        "object"
        ? item.rewardConfig
        : {
            types: [],
            details: "",
          },

    registrations,

    registrationCount:
      registrations.length,

    registeredCount:
      registrations.length,

    approvedRegistrationCount:
      registrations.filter(
        (registration) =>
          registration.status ===
            "approved" ||
          registration.status ===
            "verified"
      ).length,

    status,

    rejectionReason:
      String(
        item.rejectionReason || ""
      ).trim(),

    adminNote:
      String(
        item.adminNote || ""
      ).trim(),

    createdBy:
      String(
        item.createdBy ||
          item.organizerUid ||
          ""
      ).trim(),

    createdAt,

    updatedAt,
  }
}

function dispatchUpdate() {
  if (
    typeof window !== "undefined"
  ) {
    window.dispatchEvent(
      new Event(
        COMMUNITY_EVENTS_UPDATED_EVENT
      )
    )
  }
}

function ensureAuthenticated() {
  const user = auth.currentUser

  if (!user) {
    throw new Error(
      "You must be logged in to perform this action."
    )
  }

  return user
}

function validateEventData(eventData) {
  const title = String(
    eventData?.title || ""
  ).trim()

  const description = String(
    eventData?.description || ""
  ).trim()

  const location = String(
    eventData?.location || ""
  ).trim()

  const eventDate = String(
    eventData?.eventDate ||
      eventData?.date ||
      ""
  ).trim()

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

  return {
    title,
    description,
    location,
    eventDate,
  }
}

function buildEventPayload(
  eventData,
  user,
  existingEvent = null
) {
  const {
    title,
    description,
    location,
    eventDate,
  } = validateEventData(eventData)

  const organizerName = String(
    eventData?.organizerName ||
      existingEvent?.organizerName ||
      user?.displayName ||
      "Eco Citizen"
  ).trim()

  const organizerUid =
    String(
      eventData?.organizerUid ||
        existingEvent?.organizerUid ||
        user?.uid ||
        ""
    ).trim()

  const organizerEmail =
    String(
      eventData?.organizerEmail ||
        existingEvent?.organizerEmail ||
        user?.email ||
        ""
    ).trim()

  const organizerPhone =
    String(
      eventData?.organizerPhone ||
        eventData?.contactNumber ||
        existingEvent?.organizerPhone ||
        ""
    ).trim()

  const maxParticipants = Number(
    eventData?.maxParticipants
  )

  const requiredVolunteers = Number(
    eventData?.requiredVolunteers
  )

  return {
    title,

    description,

    category:
      String(
        eventData?.category ||
          existingEvent?.category ||
          "Community Cleanup"
      ).trim(),

    location,

    eventDate,

    startTime:
      String(
        eventData?.startTime ||
          existingEvent?.startTime ||
          ""
      ).trim(),

    endTime:
      String(
        eventData?.endTime ||
          existingEvent?.endTime ||
          ""
      ).trim(),

    organizerName,

    organizerUid,

    organizerEmail,

    organizerPhone,

    imageUrl:
      String(
        eventData?.imageUrl ||
          existingEvent?.imageUrl ||
          ""
      ).trim(),

    purpose:
      String(
        eventData?.purpose ||
          existingEvent?.purpose ||
          ""
      ).trim(),

    whatsappGroup:
      String(
        eventData?.whatsappGroup ||
          existingEvent?.whatsappGroup ||
          ""
      ).trim(),

    registrationEmail:
      String(
        eventData?.registrationEmail ||
          existingEvent?.registrationEmail ||
          ""
      ).trim(),

    contactNumber:
      organizerPhone,

    maxParticipants:
      Number.isFinite(
        maxParticipants
      )
        ? Math.max(
            0,
            maxParticipants
          )
        : 0,

    requiredVolunteers:
      Number.isFinite(
        requiredVolunteers
      )
        ? Math.max(
            0,
            requiredVolunteers
          )
        : 0,

    whatToBring:
      String(
        eventData?.whatToBring ||
          existingEvent?.whatToBring ||
          ""
      ).trim(),

    safetyInstructions:
      String(
        eventData?.safetyInstructions ||
          existingEvent?.safetyInstructions ||
          ""
      ).trim(),

    rewardConfig:
      eventData?.rewardConfig &&
      typeof eventData.rewardConfig ===
        "object"
        ? eventData.rewardConfig
        : existingEvent?.rewardConfig ||
          {
            types: [],
            details: "",
          },

    registrations:
      Array.isArray(
        existingEvent?.registrations
      )
        ? existingEvent.registrations
        : [],
  }
}

export async function getCommunityEvents(
  options = {}
) {
  try {
    const includePending =
      options?.includePending === true

    const eventsSnapshot =
      await getDocs(
        collection(
          db,
          COMMUNITY_EVENTS_COLLECTION
        )
      )

    const events =
      eventsSnapshot.docs.map(
        (documentSnapshot) =>
          normalizeEvent(
            {
              ...documentSnapshot.data(),
              id: documentSnapshot.id,
            },
            documentSnapshot.id
          )
      )

    const filteredEvents =
      includePending
        ? events
        : events.filter(
            (event) =>
              event.status ===
                "approved" ||
              event.status ===
                "upcoming" ||
              event.status ===
                "ongoing" ||
              event.status ===
                "completed" ||
              event.status ===
                "cancelled"
          )

    return filteredEvents.sort(
      (a, b) =>
        new Date(
          a.eventDate ||
            a.createdAt
        ) -
        new Date(
          b.eventDate ||
            b.createdAt
        )
    )
  } catch (error) {
    console.error(
      "Unable to load community events:",
      error
    )

    throw new Error(
      "Unable to load community events."
    )
  }
}

export async function getCommunityEventById(
  eventId
) {
  if (!eventId) {
    return null
  }

  try {
    const documentSnapshot =
      await getDoc(
        doc(
          db,
          COMMUNITY_EVENTS_COLLECTION,
          eventId
        )
      )

    if (
      !documentSnapshot.exists()
    ) {
      return null
    }

    return normalizeEvent(
      {
        ...documentSnapshot.data(),
        id: documentSnapshot.id,
      },
      documentSnapshot.id
    )
  } catch (error) {
    console.error(
      "Unable to load community event:",
      error
    )

    throw new Error(
      "Unable to load community event."
    )
  }
}

export async function createCommunityEvent(
  eventData
) {
  const user =
    ensureAuthenticated()

  const payload =
    buildEventPayload(
      eventData,
      user
    )

  const eventDocument = {
    ...payload,

    status:
      eventData?.status ||
      "pending",

    createdBy:
      user.uid,

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),

    rejectionReason:
      "",

    adminNote:
      "",
  }

  try {
    const documentReference =
      await addDoc(
        collection(
          db,
          COMMUNITY_EVENTS_COLLECTION
        ),
        eventDocument
      )

    dispatchUpdate()

    return normalizeEvent(
      {
        ...eventDocument,
        id: documentReference.id,
        createdAt:
          new Date().toISOString(),
        updatedAt:
          new Date().toISOString(),
      },
      documentReference.id
    )
  } catch (error) {
    console.error(
      "Unable to create community event:",
      error
    )

    throw new Error(
      error?.message ||
        "Unable to create community event."
    )
  }
}

export async function updateCommunityEvent(
  eventId,
  updates
) {
  if (!eventId) {
    throw new Error(
      "Community event ID is required."
    )
  }

  const user =
    ensureAuthenticated()

  const existingEvent =
    await getCommunityEventById(
      eventId
    )

  if (!existingEvent) {
    throw new Error(
      "Community event was not found."
    )
  }

  const payload =
    buildEventPayload(
      updates,
      user,
      existingEvent
    )

  try {
    await updateDoc(
      doc(
        db,
        COMMUNITY_EVENTS_COLLECTION,
        eventId
      ),
      {
        ...payload,
        updatedAt:
          serverTimestamp(),
      }
    )

    dispatchUpdate()

    const updatedEvent =
      await getCommunityEventById(
        eventId
      )

    return updatedEvent
  } catch (error) {
    console.error(
      "Unable to update community event:",
      error
    )

    throw new Error(
      error?.message ||
        "Unable to update community event."
    )
  }
}

export async function deleteCommunityEvent(
  eventId
) {
  if (!eventId) {
    throw new Error(
      "Community event ID is required."
    )
  }

  ensureAuthenticated()

  const existingEvent =
    await getCommunityEventById(
      eventId
    )

  if (!existingEvent) {
    throw new Error(
      "Community event was not found."
    )
  }

  try {
    await deleteDoc(
      doc(
        db,
        COMMUNITY_EVENTS_COLLECTION,
        eventId
      )
    )

    dispatchUpdate()

    return true
  } catch (error) {
    console.error(
      "Unable to delete community event:",
      error
    )

    throw new Error(
      "Unable to delete community event."
    )
  }
}

export async function registerForCommunityEvent(
  eventId,
  registrationData = {}
) {
  if (!eventId) {
    throw new Error(
      "Community event ID is required."
    )
  }

  const user =
    ensureAuthenticated()

  const userUid =
    String(
      registrationData?.userUid ||
        user.uid ||
        ""
    ).trim()

  if (!userUid) {
    throw new Error(
      "User authentication is required to register."
    )
  }

  const currentEvent =
    await getCommunityEventById(
      eventId
    )

  if (!currentEvent) {
    throw new Error(
      "Community event was not found."
    )
  }

  if (
    ![
      "approved",
      "upcoming",
    ].includes(
      currentEvent.status
    )
  ) {
    throw new Error(
      "Registration is not available for this event."
    )
  }

  const alreadyRegistered =
    currentEvent.registrations.some(
      (registration) =>
        registration?.userUid ===
        userUid
    )

  if (alreadyRegistered) {
    throw new Error(
      "You are already registered for this event."
    )
  }

  if (
    currentEvent.maxParticipants >
      0 &&
    currentEvent.registrations.length >=
      currentEvent.maxParticipants
  ) {
    throw new Error(
      "This event has reached its participant limit."
    )
  }

  const registration = {
    id: createId(
      "event-registration"
    ),

    eventId,

    userUid,

    userName:
      String(
        registrationData?.userName ||
          user.displayName ||
          "Eco Citizen"
      ).trim(),

    email:
      String(
        registrationData?.email ||
          registrationData?.userEmail ||
          user.email ||
          ""
      ).trim(),

    userEmail:
      String(
        registrationData?.userEmail ||
          registrationData?.email ||
          user.email ||
          ""
      ).trim(),

    phone:
      String(
        registrationData?.phone ||
          registrationData?.phoneNumber ||
          ""
      ).trim(),

    status:
      "pending",

    registeredAt:
      new Date().toISOString(),

    verifiedAt:
      null,

    verifiedBy:
      "",

    adminNote:
      "",

    attendanceStatus:
      "pending",

    rewardStatus:
      "pending",

    rewardDistributedAt:
      null,

    rewardDistributedBy:
      "",
  }

  try {
    const updatedRegistrations = [
      ...currentEvent.registrations,
      registration,
    ]

    await updateDoc(
      doc(
        db,
        COMMUNITY_EVENTS_COLLECTION,
        eventId
      ),
      {
        registrations:
          updatedRegistrations,

        updatedAt:
          serverTimestamp(),
      }
    )

    dispatchUpdate()

    return registration
  } catch (error) {
    console.error(
      "Unable to register for community event:",
      error
    )

    throw new Error(
      error?.message ||
        "Unable to register for community event."
    )
  }
}

export async function cancelCommunityEventRegistration(
  eventId,
  userUid
) {
  if (!eventId) {
    throw new Error(
      "Community event ID is required."
    )
  }

  const user =
    ensureAuthenticated()

  const uid =
    String(
      userUid ||
        user.uid ||
        ""
    ).trim()

  if (!uid) {
    throw new Error(
      "User authentication is required."
    )
  }

  const currentEvent =
    await getCommunityEventById(
      eventId
    )

  if (!currentEvent) {
    throw new Error(
      "Community event was not found."
    )
  }

  const registrationExists =
    currentEvent.registrations.some(
      (registration) =>
        registration?.userUid ===
        uid
    )

  if (!registrationExists) {
    throw new Error(
      "Registration was not found."
    )
  }

  try {
    const updatedRegistrations =
      currentEvent.registrations.filter(
        (registration) =>
          registration?.userUid !== uid
      )

    await updateDoc(
      doc(
        db,
        COMMUNITY_EVENTS_COLLECTION,
        eventId
      ),
      {
        registrations:
          updatedRegistrations,

        updatedAt:
          serverTimestamp(),
      }
    )

    dispatchUpdate()

    return true
  } catch (error) {
    console.error(
      "Unable to cancel registration:",
      error
    )

    throw new Error(
      "Unable to cancel registration."
    )
  }
}

export async function getCommunityEventRegistrations(
  eventId
) {
  if (!eventId) {
    return []
  }

  const event =
    await getCommunityEventById(
      eventId
    )

  return event?.registrations || []
}

export async function getUserCommunityEventRegistrations(
  userUid
) {
  if (!userUid) {
    return []
  }

  try {
    const eventsSnapshot =
      await getDocs(
        collection(
          db,
          COMMUNITY_EVENTS_COLLECTION
        )
      )

    const events =
      eventsSnapshot.docs.map(
        (documentSnapshot) =>
          normalizeEvent(
            {
              ...documentSnapshot.data(),
              id: documentSnapshot.id,
            },
            documentSnapshot.id
          )
      )

    return events.flatMap(
      (event) =>
        event.registrations
          .filter(
            (registration) =>
              registration?.userUid ===
              userUid
          )
          .map(
            (registration) => ({
              ...registration,

              eventTitle:
                event.title,

              eventDate:
                event.eventDate,

              date:
                event.eventDate,

              eventLocation:
                event.location,

              eventStatus:
                event.status,
            })
          )
    )
  } catch (error) {
    console.error(
      "Unable to load user event registrations:",
      error
    )

    throw new Error(
      "Unable to load your community event registrations."
    )
  }
}

export async function updateCommunityEventRegistrationStatus(
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

  ensureAuthenticated()

  const normalizedStatus =
    String(status || "")
      .trim()
      .toLowerCase()

  if (
    ![
      "approved",
      "rejected",
      "pending",
      "verified",
    ].includes(
      normalizedStatus
    )
  ) {
    throw new Error(
      "Invalid registration status."
    )
  }

  const currentEvent =
    await getCommunityEventById(
      eventId
    )

  if (!currentEvent) {
    throw new Error(
      "Community event was not found."
    )
  }

  const registrationIndex =
    currentEvent.registrations.findIndex(
      (registration) =>
        registration?.id ===
        registrationId
    )

  if (
    registrationIndex === -1
  ) {
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

    status:
      normalizedStatus,

    verifiedAt:
      [
        "approved",
        "rejected",
        "verified",
      ].includes(
        normalizedStatus
      )
        ? new Date().toISOString()
        : null,

    verifiedBy:
      [
        "approved",
        "rejected",
        "verified",
      ].includes(
        normalizedStatus
      )
        ? String(
            adminData?.adminUid ||
              auth.currentUser?.uid ||
              ""
          ).trim()
        : "",

    adminNote:
      String(
        adminData?.adminNote || ""
      ).trim(),

    attendanceStatus:
      currentRegistration?.attendanceStatus ||
      "pending",

    rewardStatus:
      currentRegistration?.rewardStatus ||
      "pending",
  }

  const updatedRegistrations =
    [
      ...currentEvent.registrations,
    ]

  updatedRegistrations[
    registrationIndex
  ] = updatedRegistration

  try {
    await updateDoc(
      doc(
        db,
        COMMUNITY_EVENTS_COLLECTION,
        eventId
      ),
      {
        registrations:
          updatedRegistrations,

        updatedAt:
          serverTimestamp(),
      }
    )

    dispatchUpdate()

    return updatedRegistration
  } catch (error) {
    console.error(
      "Unable to update event registration:",
      error
    )

    throw new Error(
      error?.message ||
        "Unable to update event registration."
    )
  }
}

export async function updateCommunityEventStatus(
  eventId,
  status,
  adminData = {}
) {
  if (!eventId) {
    throw new Error(
      "Community event ID is required."
    )
  }

  ensureAuthenticated()

  const normalizedStatus =
    String(status || "")
      .trim()
      .toLowerCase()

  const allowedStatuses = [
    "pending",
    "approved",
    "rejected",
    "upcoming",
    "ongoing",
    "completed",
    "cancelled",
  ]

  if (
    !allowedStatuses.includes(
      normalizedStatus
    )
  ) {
    throw new Error(
      "Invalid community event status."
    )
  }

  try {
    await updateDoc(
      doc(
        db,
        COMMUNITY_EVENTS_COLLECTION,
        eventId
      ),
      {
        status:
          normalizedStatus,

        rejectionReason:
          normalizedStatus ===
          "rejected"
            ? String(
                adminData?.rejectionReason ||
                  ""
              ).trim()
            : "",

        adminNote:
          String(
            adminData?.adminNote || ""
          ).trim(),

        updatedAt:
          serverTimestamp(),
      }
    )

    dispatchUpdate()

    return getCommunityEventById(
      eventId
    )
  } catch (error) {
    console.error(
      "Unable to update community event status:",
      error
    )

    throw new Error(
      error?.message ||
        "Unable to update community event status."
    )
  }
}

export async function verifyCommunityEventAttendance(
  eventId,
  registrationId,
  attendanceStatus,
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

  ensureAuthenticated()

  const normalizedAttendance =
    String(
      attendanceStatus || ""
    )
      .trim()
      .toLowerCase()

  if (
    ![
      "present",
      "absent",
      "pending",
    ].includes(
      normalizedAttendance
    )
  ) {
    throw new Error(
      "Invalid attendance status."
    )
  }

  const currentEvent =
    await getCommunityEventById(
      eventId
    )

  if (!currentEvent) {
    throw new Error(
      "Community event was not found."
    )
  }

  const registrationIndex =
    currentEvent.registrations.findIndex(
      (registration) =>
        registration?.id ===
        registrationId
    )

  if (
    registrationIndex === -1
  ) {
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

    attendanceStatus:
      normalizedAttendance,

    verifiedAt:
      normalizedAttendance ===
      "present"
        ? new Date().toISOString()
        : currentRegistration.verifiedAt,

    verifiedBy:
      String(
        adminData?.adminUid ||
          auth.currentUser?.uid ||
          ""
      ).trim(),

    rewardStatus:
      normalizedAttendance ===
      "present"
        ? currentRegistration.rewardStatus ||
          "pending"
        : "not-eligible",
  }

  const updatedRegistrations =
    [
      ...currentEvent.registrations,
    ]

  updatedRegistrations[
    registrationIndex
  ] = updatedRegistration

  try {
    await updateDoc(
      doc(
        db,
        COMMUNITY_EVENTS_COLLECTION,
        eventId
      ),
      {
        registrations:
          updatedRegistrations,

        updatedAt:
          serverTimestamp(),
      }
    )

    dispatchUpdate()

    return updatedRegistration
  } catch (error) {
    console.error(
      "Unable to verify event attendance:",
      error
    )

    throw new Error(
      "Unable to verify event attendance."
    )
  }
}

export async function distributeCommunityEventReward(
  eventId,
  registrationId,
  rewardData = {}
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

  ensureAuthenticated()

  const currentEvent =
    await getCommunityEventById(
      eventId
    )

  if (!currentEvent) {
    throw new Error(
      "Community event was not found."
    )
  }

  const registrationIndex =
    currentEvent.registrations.findIndex(
      (registration) =>
        registration?.id ===
        registrationId
    )

  if (
    registrationIndex === -1
  ) {
    throw new Error(
      "Event registration was not found."
    )
  }

  const currentRegistration =
    currentEvent.registrations[
      registrationIndex
    ]

  if (
    currentRegistration.attendanceStatus !==
    "present"
  ) {
    throw new Error(
      "Reward can only be distributed to a verified participant."
    )
  }

  const updatedRegistration = {
    ...currentRegistration,

    rewardStatus:
      "distributed",

    reward:
      rewardData || {},

    rewardDistributedAt:
      new Date().toISOString(),

    rewardDistributedBy:
      String(
        auth.currentUser?.uid ||
          ""
      ).trim(),
  }

  const updatedRegistrations =
    [
      ...currentEvent.registrations,
    ]

  updatedRegistrations[
    registrationIndex
  ] = updatedRegistration

  try {
    await updateDoc(
      doc(
        db,
        COMMUNITY_EVENTS_COLLECTION,
        eventId
      ),
      {
        registrations:
          updatedRegistrations,

        updatedAt:
          serverTimestamp(),
      }
    )

    dispatchUpdate()

    return updatedRegistration
  } catch (error) {
    console.error(
      "Unable to distribute event reward:",
      error
    )

    throw new Error(
      "Unable to distribute event reward."
    )
  }
}

export async function getPendingCommunityEvents() {
  return getCommunityEvents({
    includePending: true,
  }).then(
    (events) =>
      events.filter(
        (event) =>
          event.status ===
          "pending"
      )
  )
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

  const handleUpdate = async () => {
    try {
      const events =
        await getCommunityEvents()

      callback(events)
    } catch (error) {
      console.error(
        "Unable to refresh community events:",
        error
      )
    }
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

export async function clearCommunityEvents() {
  ensureAuthenticated()

  try {
    const snapshot =
      await getDocs(
        collection(
          db,
          COMMUNITY_EVENTS_COLLECTION
        )
      )

    await Promise.all(
      snapshot.docs.map(
        (documentSnapshot) =>
          deleteDoc(
            documentSnapshot.ref
          )
      )
    )

    dispatchUpdate()

    return true
  } catch (error) {
    console.error(
      "Unable to clear community events:",
      error
    )

    throw new Error(
      "Unable to clear community events."
    )
  }
}

export {
  COMMUNITY_EVENTS_COLLECTION,
  COMMUNITY_EVENTS_STORAGE_KEY,
  COMMUNITY_EVENTS_UPDATED_EVENT,
}