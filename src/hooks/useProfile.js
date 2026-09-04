import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  deleteUser,
  signOut,
  updateProfile,
} from "firebase/auth"

import { auth } from "../services/firebase"
import useAuth from "./useAuth"

const PROFILE_KEY = "eco_clean_hub_profile"
const NOTIFICATION_KEY = "eco_clean_hub_notifications"
const ACTIVITY_KEY = "eco_clean_hub_activity"

const DEFAULT_NOTIFICATIONS = {
  wasteUpdates: true,
  rewardUpdates: true,
  communityUpdates: false,
}

const EMPTY_STATS = {
  credits: 0,
  scanned: 0,
  verified: 0,
  divertedKg: 0,
  recycledKg: 0,
  co2Kg: 0,
  waterLiters: 0,
  trees: 0,
}

// Same assumptions used by Dashboard
const ESTIMATED_WEIGHT_KG = {
  Plastic: 0.25,
  Paper: 0.2,
  Glass: 0.5,
  Metal: 0.25,
  Organic: 0.5,
  "E-Waste": 0.3,
  Textile: 0.3,
  Hazardous: 0.2,
  Other: 0.25,
  "Non-Waste": 0,
}

const CO2_KG_PER_KG_DIVERTED = 0.75
const TREES_PER_KG_CO2 = 0.147

function useProfile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    location: "",
    role: "Common Citizen",
    photo: "",
  })

  const [editForm, setEditForm] = useState(profile)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const [notifications, setNotifications] = useState(
    DEFAULT_NOTIFICATIONS
  )

  const [showNotifications, setShowNotifications] =
    useState(false)

  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const [stats, setStats] = useState(EMPTY_STATS)
  const [activities, setActivities] = useState([])

  useEffect(() => {
    if (!user) return

    loadProfile()
    loadNotifications()
    loadImpact()
  }, [user])

  useEffect(() => {
    const refresh = () => {
      loadImpact()
    }

    window.addEventListener(
      "eco-clean-hub-activity-updated",
      refresh
    )

    window.addEventListener("storage", refresh)

    return () => {
      window.removeEventListener(
        "eco-clean-hub-activity-updated",
        refresh
      )

      window.removeEventListener("storage", refresh)
    }
  }, [user])

  const loadProfile = () => {
    if (!user) return

    const saved = localStorage.getItem(
      `${PROFILE_KEY}_${user.uid}`
    )

    let data = {
      name: user.displayName || "",
      phone: "",
      location: "",
      role: "Common Citizen",
      photo: user.photoURL || "",
    }

    if (saved) {
      try {
        data = {
          ...data,
          ...JSON.parse(saved),
        }
      } catch (loadError) {
        console.error(
          "Unable to load profile:",
          loadError
        )
      }
    }

    setProfile(data)
    setEditForm(data)
  }

  const loadNotifications = () => {
    if (!user) return

    const saved = localStorage.getItem(
      `${NOTIFICATION_KEY}_${user.uid}`
    )

    if (!saved) {
      setNotifications(DEFAULT_NOTIFICATIONS)
      return
    }

    try {
      setNotifications({
        ...DEFAULT_NOTIFICATIONS,
        ...JSON.parse(saved),
      })
    } catch {
      setNotifications(DEFAULT_NOTIFICATIONS)
    }
  }

  /*
   * Environmental Impact
   *
   * Uses the same activity data and calculation
   * logic as Dashboard Personal Impact Analytics.
   *
   * Priority:
   * 1. stored recycledKg
   * 2. stored weightKg
   * 3. estimated weight from AI category
   */
  const loadImpact = () => {
    if (!user) return

    const saved = localStorage.getItem(
      `${ACTIVITY_KEY}_${user.uid}`
    )

    if (!saved) {
      setActivities([])
      setStats(EMPTY_STATS)
      return
    }

    try {
      const parsed = JSON.parse(saved)

      if (!Array.isArray(parsed)) {
        setActivities([])
        setStats(EMPTY_STATS)
        return
      }

      const sortedActivities = [...parsed].sort(
        (a, b) =>
          new Date(b?.createdAt || 0) -
          new Date(a?.createdAt || 0)
      )

      setActivities(sortedActivities)

      const verifiedActivities = parsed.filter(
        (item) =>
          item?.status?.toLowerCase?.() === "verified" ||
          item?.verified === true
      )

      const sum = (items, field) =>
        items.reduce(
          (total, item) =>
            total + Number(item?.[field] || 0),
          0
        )

      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      let totalWasteKg = 0
      let monthlyWasteKg = 0

      parsed.forEach((activity) => {
        const category =
          activity?.category || "Other"

        const storedRecycledKg =
          Number(activity?.recycledKg)

        const storedWeightKg =
          Number(activity?.weightKg)

        let weightKg = 0

        if (storedRecycledKg > 0) {
          weightKg = storedRecycledKg
        } else if (storedWeightKg > 0) {
          weightKg = storedWeightKg
        } else {
          weightKg =
            ESTIMATED_WEIGHT_KG[category] ?? 0.25
        }

        if (category === "Non-Waste") {
          weightKg = 0
        }

        totalWasteKg += weightKg

        const createdAt = activity?.createdAt
          ? new Date(activity.createdAt)
          : null

        if (
          createdAt &&
          !Number.isNaN(createdAt.getTime()) &&
          createdAt.getMonth() === currentMonth &&
          createdAt.getFullYear() === currentYear
        ) {
          monthlyWasteKg += weightKg
        }
      })

      const co2Kg =
        totalWasteKg * CO2_KG_PER_KG_DIVERTED

      const treesEquivalent =
        co2Kg * TREES_PER_KG_CO2

      setStats({
        credits: sum(parsed, "credits"),
        scanned: parsed.length,
        verified: verifiedActivities.length,

        divertedKg: totalWasteKg,

        recycledKg: totalWasteKg,

        co2Kg,

        /*
         * Scanner currently does not calculate
         * water savings, so this remains based
         * on stored activity data.
         */
        waterLiters: sum(
          verifiedActivities,
          "waterLiters"
        ),

        trees: treesEquivalent,
      })
    } catch (impactError) {
      console.error(
        "Unable to load impact:",
        impactError
      )

      setActivities([])
      setStats(EMPTY_STATS)
    }
  }

  const startEditing = () => {
    setEditForm(profile)
    setError("")
    setMessage("")
    setEditing(true)
  }

  const cancelEditing = () => {
    setEditForm(profile)
    setEditing(false)
    setError("")
    setMessage("")
  }

  const updateField = (field, value) => {
    setEditForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        const image = new Image()

        image.onload = () => {
          const maxSize = 512

          let width = image.width
          let height = image.height

          if (width > height) {
            if (width > maxSize) {
              height =
                (height * maxSize) / width
              width = maxSize
            }
          } else if (height > maxSize) {
            width =
              (width * maxSize) / height
            height = maxSize
          }

          const canvas =
            document.createElement("canvas")

          canvas.width = width
          canvas.height = height

          const context =
            canvas.getContext("2d")

          context.drawImage(
            image,
            0,
            0,
            width,
            height
          )

          resolve(
            canvas.toDataURL(
              "image/jpeg",
              0.78
            )
          )
        }

        image.onerror = reject
        image.src = reader.result
      }

      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const showMessage = (text) => {
    setMessage(text)

    window.setTimeout(() => {
      setMessage("")
    }, 3000)
  }

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.")
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      setError(
        "Please select an image smaller than 8 MB."
      )
      return
    }

    try {
      setError("")

      const compressed =
        await compressImage(file)

      setEditForm((current) => ({
        ...current,
        photo: compressed,
      }))

      setEditing(true)

      showMessage(
        "Photo selected. Click Save Changes."
      )
    } catch (photoError) {
      console.error(
        "Photo processing error:",
        photoError
      )

      setError(
        "Unable to process this photo."
      )
    }

    event.target.value = ""
  }

  const removePhoto = () => {
    setEditForm((current) => ({
      ...current,
      photo: "",
    }))

    setEditing(true)
    setError("")
  }

  const saveProfile = async () => {
    if (!user) return

    const cleanName =
      editForm.name.trim()

    if (!cleanName) {
      setError(
        "Please enter your full name."
      )
      return
    }

    try {
      setSaving(true)
      setError("")
      setMessage("")

      await updateProfile(user, {
        displayName: cleanName,
      })

      const newProfile = {
        name: cleanName,
        phone: editForm.phone.trim(),
        location: editForm.location.trim(),
        role:
          editForm.role || "Common Citizen",
        photo: editForm.photo || "",
      }

      localStorage.setItem(
        `${PROFILE_KEY}_${user.uid}`,
        JSON.stringify(newProfile)
      )

      setProfile(newProfile)
      setEditForm(newProfile)
      setEditing(false)

      showMessage(
        "Profile updated successfully."
      )
    } catch (saveError) {
      console.error(
        "Profile save error:",
        saveError
      )

      setError(
        "Unable to save profile. Please try again."
      )
    } finally {
      setSaving(false)
    }
  }

  const updateNotification = (key) => {
    if (!user) return

    const updated = {
      ...notifications,
      [key]: !notifications[key],
    }

    setNotifications(updated)

    localStorage.setItem(
      `${NOTIFICATION_KEY}_${user.uid}`,
      JSON.stringify(updated)
    )

    showMessage(
      "Notification preference updated."
    )
  }

  const logout = async () => {
    try {
      setLoggingOut(true)
      setError("")

      await signOut(auth)

      navigate("/")
    } catch (logoutError) {
      console.error(
        "Logout error:",
        logoutError
      )

      setError(
        "Unable to logout. Please try again."
      )

      setLoggingOut(false)
    }
  }

  const deleteAccount = async () => {
    if (!user) return

    const uid = user.uid

    try {
      setError("")

      await deleteUser(user)

      localStorage.removeItem(
        `${PROFILE_KEY}_${uid}`
      )

      localStorage.removeItem(
        `${NOTIFICATION_KEY}_${uid}`
      )

      localStorage.removeItem(
        `${ACTIVITY_KEY}_${uid}`
      )

      navigate("/")
    } catch (deleteError) {
      console.error(
        "Delete account error:",
        deleteError
      )

      if (
        deleteError?.code ===
        "auth/requires-recent-login"
      ) {
        setError(
          "Please login again before deleting your account."
        )
      } else {
        setError(
          "Unable to delete account. Please try again."
        )
      }

      setShowDelete(false)
    }
  }

  const displayName =
    profile.name ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Eco Citizen"

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) =>
        word.charAt(0).toUpperCase()
      )
      .join("") || "EC"

  const joinedDate =
    user?.metadata?.creationTime
      ? new Date(
          user.metadata.creationTime
        ).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Not available"

  return {
    user,
    navigate,
    fileInputRef,
    profile,
    editForm,
    editing,
    saving,
    loggingOut,
    message,
    error,
    notifications,
    showNotifications,
    showPrivacy,
    showDelete,
    stats,
    activities,
    displayName,
    initials,
    joinedDate,
    setError,
    setShowNotifications,
    setShowPrivacy,
    setShowDelete,
    startEditing,
    cancelEditing,
    updateField,
    handlePhotoChange,
    removePhoto,
    saveProfile,
    updateNotification,
    logout,
    deleteAccount,
  }
}

export default useProfile