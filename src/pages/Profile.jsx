import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  User,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Pencil,
  Camera,
  Leaf,
  Recycle,
  ShieldCheck,
  Award,
  Bell,
  Lock,
  LogOut,
  Trash2,
  CheckCircle2,
  Clock3,
  X,
  Save,
  Users,
  ChevronDown,
  Settings,
  ScanLine,
} from "lucide-react"
import {
  deleteUser,
  signOut,
  updateProfile,
} from "firebase/auth"
import { auth } from "../services/firebase"
import useAuth from "../hooks/useAuth"

const PROFILE_KEY = "eco_clean_hub_profile"
const NOTIFICATION_KEY = "eco_clean_hub_notifications"
const ACTIVITY_KEY = "eco_clean_hub_activity"

const ROLE_OPTIONS = [
  "Common Citizen",
  "Student",
  "NGO / Community Organization",
  "Government / Municipal",
  "MRF / Waste Worker",
  "Corporate / Organization",
  "Other",
]

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

function Profile() {
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

      setStats({
        credits: sum(parsed, "credits"),
        scanned: parsed.length,
        verified: verifiedActivities.length,
        divertedKg: sum(
          verifiedActivities,
          "weightKg"
        ),
        recycledKg: sum(
          verifiedActivities,
          "recycledKg"
        ),
        co2Kg: sum(
          verifiedActivities,
          "co2Kg"
        ),
        waterLiters: sum(
          verifiedActivities,
          "waterLiters"
        ),
        trees: sum(
          verifiedActivities,
          "treesEquivalent"
        ),
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
          } else {
            if (height > maxSize) {
              width =
                (width * maxSize) / height
              height = maxSize
            }
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

  const showMessage = (text) => {
    setMessage(text)

    window.setTimeout(() => {
      setMessage("")
    }, 3000)
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

  if (!user) {
    return null
  }

  const displayName =
    profile.name ||
    user.displayName ||
    user.email?.split("@")[0] ||
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
    user.metadata?.creationTime
      ? new Date(
          user.metadata.creationTime
        ).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Not available"

  const recentActivities =
    activities.slice(0, 5)

  return (
    <div className="min-h-screen bg-[#f6faf7] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0b8f4d]">
              Account
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight text-[#14231a]">
              My Profile
            </h1>

            <p className="mt-2 text-slate-500">
              Manage your account and environmental impact.
            </p>
          </div>

          <div className="flex gap-3">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <X size={17} />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0b8f4d] px-5 py-3 font-semibold text-white transition hover:bg-[#087b42] disabled:opacity-60"
                >
                  <Save size={17} />
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startEditing}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0b8f4d] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#087b42]"
              >
                <Pencil size={17} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-[#176b45]">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Profile Card */}
        <section className="overflow-hidden rounded-3xl border border-[#dfeae2] bg-white shadow-sm">
          <div className="h-32 bg-gradient-to-r from-[#0b8f4d] via-[#176b45] to-[#07552f]" />

          <div className="px-6 pb-7 sm:px-8">
            <div className="-mt-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">

                {/* Avatar */}
                <div className="relative">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white bg-green-100 text-3xl font-black text-[#176b45] shadow-xl">
                    {profile.photo ? (
                      <img
                        src={profile.photo}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-[#0b8f4d] text-white shadow-lg transition hover:bg-[#087b42]"
                  >
                    <Camera size={17} />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>

                <div className="pb-1">
                  <h2 className="text-2xl font-bold text-[#14231a]">
                    {displayName}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-2 text-sm text-slate-500">
                      <Mail size={15} />
                      {user.email}
                    </span>

                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-[#176b45]">
                      {profile.role}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    {profile.photo
                      ? "Profile photo added"
                      : "No profile photo added"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-green-50 px-5 py-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0b8f4d] shadow-sm">
                  <ShieldCheck size={22} />
                </div>

                <div>
                  <p className="font-bold text-[#176b45]">
                    Eco Citizen
                  </p>

                  <p className="text-xs text-slate-500">
                    Active account
                  </p>
                </div>
              </div>

            </div>

            {editing && (
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-[#176b45] hover:bg-green-100"
                >
                  <span className="flex items-center gap-2">
                    <Camera size={16} />
                    Change Photo
                  </span>
                </button>

                {editForm.photo && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-100"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Stats */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Leaf size={21} />}
            title="Eco-Credits"
            value={stats.credits.toLocaleString()}
            description="From recorded activity"
          />

          <StatCard
            icon={<Recycle size={21} />}
            title="Items Scanned"
            value={stats.scanned.toLocaleString()}
            description="Waste items identified"
          />

          <StatCard
            icon={<ShieldCheck size={21} />}
            title="Verified"
            value={stats.verified.toLocaleString()}
            description="Verified disposal actions"
          />

          <StatCard
            icon={<Award size={21} />}
            title="Waste Diverted"
            value={`${stats.divertedKg.toFixed(1)} kg`}
            description="Verified waste weight"
          />
        </section>

        {/* Main Content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">

          {/* Personal Information */}
          <section className="rounded-3xl border border-[#dfeae2] bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#14231a]">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Keep your account information up to date.
              </p>
            </div>

            {editing ? (
              <div className="space-y-5">
                <FormInput
                  label="Full Name"
                  icon={<User size={18} />}
                  value={editForm.name}
                  onChange={(value) =>
                    updateField("name", value)
                  }
                  placeholder="Enter your full name"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormInput
                    label="Phone Number"
                    icon={<Phone size={18} />}
                    value={editForm.phone}
                    onChange={(value) =>
                      updateField("phone", value)
                    }
                    placeholder="Enter phone number"
                  />

                  <FormInput
                    label="Location"
                    icon={<MapPin size={18} />}
                    value={editForm.location}
                    onChange={(value) =>
                      updateField(
                        "location",
                        value
                      )
                    }
                    placeholder="Enter your city"
                  />
                </div>

                <RoleSelect
                  value={editForm.role}
                  onChange={(value) =>
                    updateField("role", value)
                  }
                />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoBox
                  icon={<User size={18} />}
                  label="Full Name"
                  value={displayName}
                />

                <InfoBox
                  icon={<Mail size={18} />}
                  label="Email Address"
                  value={
                    user.email ||
                    "Not available"
                  }
                />

                <InfoBox
                  icon={<Phone size={18} />}
                  label="Phone Number"
                  value={
                    profile.phone ||
                    "Not added"
                  }
                />

                <InfoBox
                  icon={<MapPin size={18} />}
                  label="Location"
                  value={
                    profile.location ||
                    "Not added"
                  }
                />

                <InfoBox
                  icon={<Users size={18} />}
                  label="Account Role"
                  value={profile.role}
                />

                <InfoBox
                  icon={<CalendarDays size={18} />}
                  label="Joined"
                  value={joinedDate}
                />
              </div>
            )}
          </section>

          {/* Environmental Impact */}
          <section className="rounded-3xl border border-[#dfeae2] bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#14231a]">
                Environmental Impact
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Based on your recorded and verified actions.
              </p>
            </div>

            <div className="space-y-3">
              <ImpactRow
                icon="♻️"
                label="Waste Recycled"
                value={`${stats.recycledKg.toFixed(1)} kg`}
              />

              <ImpactRow
                icon="🌱"
                label="CO₂ Reduced"
                value={`${stats.co2Kg.toFixed(1)} kg`}
              />

              <ImpactRow
                icon="💧"
                label="Water Saved"
                value={`${stats.waterLiters.toFixed(0)} L`}
              />

              <ImpactRow
                icon="🌳"
                label="Trees Equivalent"
                value={stats.trees.toFixed(1)}
              />
            </div>

            {stats.verified === 0 && (
              <div className="mt-5 rounded-2xl bg-[#f7faf8] p-4 text-sm text-slate-500">
                Your environmental impact will appear here after
                verified disposal activity is recorded.
              </div>
            )}
          </section>
        </div>

        {/* Recent Activity */}
        <section className="mt-6 rounded-3xl border border-[#dfeae2] bg-white p-6 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#14231a]">
                Recent Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your latest waste-management actions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/activity")}
              className="text-sm font-semibold text-[#0b8f4d] hover:underline"
            >
              View all
            </button>
          </div>

          {recentActivities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-[#fafcfb] px-6 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-[#0b8f4d]">
                <Clock3 size={22} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No activity recorded yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Your scans, verified disposals and Eco-Credits
                will appear here as you use the platform.
              </p>

              <button
                type="button"
                onClick={() => navigate("/scanner")}
                className="mt-5 rounded-xl bg-[#0b8f4d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087b42]"
              >
                Start Scanning
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => {
                const date = activity.createdAt
                  ? new Date(activity.createdAt)
                  : null

                const validDate =
                  date &&
                  !Number.isNaN(
                    date.getTime()
                  )

                const dateText = validDate
                  ? date.toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )
                  : "Recently"

                const timeText = validDate
                  ? date.toLocaleTimeString(
                      "en-IN",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                      }
                    )
                  : ""

                const status =
                  activity.status ||
                  "Scanned"

                const isVerified =
                  status.toLowerCase() ===
                    "verified" ||
                  activity.verified === true

                return (
                  <div
                    key={
                      activity.id ||
                      `${activity.createdAt}-${activity.category}`
                    }
                    className="flex items-center justify-between gap-4 rounded-2xl border border-[#e4eee7] bg-[#fafcfb] p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#0b8f4d]">
                        <ScanLine size={20} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">
                          {activity.title ||
                            `${activity.category || "Waste"} waste scanned`}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {activity.category ||
                            "Other"}

                          {activity.type
                            ? ` • ${activity.type}`
                            : ""}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {dateText}
                          {timeText
                            ? ` • ${timeText}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          isVerified
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isVerified
                          ? "Verified"
                          : status}
                      </span>

                      {Number(
                        activity.credits
                      ) > 0 && (
                        <p className="mt-2 text-xs font-semibold text-[#0b8f4d]">
                          +
                          {activity.credits}{" "}
                          Credits
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Settings */}
        <section className="mt-6 rounded-3xl border border-[#dfeae2] bg-white p-6 shadow-sm sm:p-7">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#14231a]">
              Account Settings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage your account preferences.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <SettingButton
              icon={<Pencil size={19} />}
              title="Edit Profile"
              description="Update your personal information"
              onClick={startEditing}
            />

            <SettingButton
              icon={<Bell size={19} />}
              title="Notifications"
              description="Manage notification preferences"
              onClick={() =>
                setShowNotifications(true)
              }
            />

            <SettingButton
              icon={<Lock size={19} />}
              title="Privacy & Security"
              description="Manage account security"
              onClick={() =>
                setShowPrivacy(true)
              }
            />

            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-red-200 hover:bg-red-50 disabled:opacity-60"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <LogOut size={19} />
              </div>

              <div>
                <p className="font-semibold text-slate-800">
                  {loggingOut
                    ? "Logging out..."
                    : "Logout"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Sign out of your Eco Clean Hub account
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* Delete Account */}
        <section className="mt-6 rounded-3xl border border-red-100 bg-red-50/50 p-6 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Trash2
                  size={19}
                  className="text-red-500"
                />

                <h2 className="font-bold text-red-700">
                  Delete Account
                </h2>
              </div>

              <p className="mt-1 text-sm text-red-600/80">
                Permanently delete your Eco Clean Hub account.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowDelete(true)
              }
              className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-500 hover:bg-red-100"
            >
              Delete Account
            </button>
          </div>
        </section>

        <div className="h-10" />
      </div>

      {/* Notifications Modal */}
      {showNotifications && (
        <Modal
          title="Notifications"
          description="Choose which updates you want to receive."
          onClose={() =>
            setShowNotifications(false)
          }
        >
          <div className="space-y-3">
            <Toggle
              title="Waste Updates"
              description="Updates about scans and disposal actions"
              enabled={
                notifications.wasteUpdates
              }
              onChange={() =>
                updateNotification(
                  "wasteUpdates"
                )
              }
            />

            <Toggle
              title="Reward Updates"
              description="Eco-Credits and reward notifications"
              enabled={
                notifications.rewardUpdates
              }
              onChange={() =>
                updateNotification(
                  "rewardUpdates"
                )
              }
            />

            <Toggle
              title="Community Updates"
              description="Community events and announcements"
              enabled={
                notifications.communityUpdates
              }
              onChange={() =>
                updateNotification(
                  "communityUpdates"
                )
              }
            />
          </div>
        </Modal>
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <Modal
          title="Privacy & Security"
          description="Manage your account protection and authentication."
          onClose={() =>
            setShowPrivacy(false)
          }
        >
          <div className="space-y-3">
            <PrivacyItem
              icon={<Mail size={18} />}
              title="Email"
              value={
                user.email ||
                "Not available"
              }
            />

            <PrivacyItem
              icon={<ShieldCheck size={18} />}
              title="Authentication"
              value="Firebase Authentication"
            />

            <PrivacyItem
              icon={<Settings size={18} />}
              title="Profile Data"
              value="Saved locally"
            />
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {showDelete && (
        <Modal
          title="Delete Account?"
          description="This action cannot be undone."
          onClose={() =>
            setShowDelete(false)
          }
        >
          <div className="rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-600">
            Your Firebase account and saved local profile
            information will be removed permanently.
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                setShowDelete(false)
              }
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={deleteAccount}
              className="rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white hover:bg-red-600"
            >
              Delete Account
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function FormInput({
  label,
  icon,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-600">
        {label}
      </label>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>

        <input
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-[#0b8f4d] focus:ring-2 focus:ring-[#0b8f4d]/10"
        />
      </div>
    </div>
  )
}

function RoleSelect({
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-600">
        Account Role
      </label>

      <div className="relative">
        <Users
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-10 outline-none focus:border-[#0b8f4d] focus:ring-2 focus:ring-[#0b8f4d]/10"
        >
          {ROLE_OPTIONS.map((role) => (
            <option
              key={role}
              value={role}
            >
              {role}
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

function StatCard({
  icon,
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-3xl border border-[#dfeae2] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#0b8f4d]">
        {icon}
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-black text-[#14231a]">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  )
}

function InfoBox({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-[#f8faf9] p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>

      <p className="mt-2 truncate font-semibold text-slate-700">
        {value}
      </p>
    </div>
  )
}

function ImpactRow({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[#f7faf8] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
          {icon}
        </div>

        <span className="text-sm font-medium text-slate-600">
          {label}
        </span>
      </div>

      <span className="font-bold text-[#176b45]">
        {value}
      </span>
    </div>
  )
}

function SettingButton({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-green-200 hover:bg-green-50/50"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#0b8f4d]">
        {icon}
      </div>

      <div>
        <p className="font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </button>
  )
}

function Toggle({
  title,
  description,
  enabled,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
      <div>
        <p className="font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        aria-label={`Toggle ${title}`}
        className={`relative h-7 w-12 rounded-full transition ${
          enabled
            ? "bg-[#0b8f4d]"
            : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  )
}

function PrivacyItem({
  icon,
  title,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#f7faf8] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0b8f4d] shadow-sm">
          {icon}
        </div>

        <span className="font-semibold text-slate-700">
          {title}
        </span>
      </div>

      <span className="max-w-[55%] truncate text-right text-sm font-semibold text-[#176b45]">
        {value}
      </span>
    </div>
  )
}

function Modal({
  title,
  description,
  onClose,
  children,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          <X size={19} />
        </button>

        <h2 className="pr-10 text-2xl font-bold text-[#14231a]">
          {title}
        </h2>

        <p className="mt-2 pr-8 text-sm text-slate-500">
          {description}
        </p>

        <div className="mt-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Profile