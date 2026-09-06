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
  Clock3,
  ScanLine,
  Users,
  ChevronDown,
} from "lucide-react"

import { ROLE_OPTIONS } from "../../data/profileConstants"

export function FormInput({
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

export function RoleSelect({
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

export function ProfileHeader({
  profile,
  editForm,
  editing,
  displayName,
  initials,
  user,
  fileInputRef,
  onPhotoChange,
  onChangePhoto,
  onRemovePhoto,
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-[#dfeae2] bg-white shadow-sm">
      <div className="h-32 bg-gradient-to-r from-[#0b8f4d] via-[#176b45] to-[#07552f]" />

      <div className="px-6 pb-7 sm:px-8">
        <div className="-mt-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
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
                onClick={onChangePhoto}
                className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-[#0b8f4d] text-white shadow-lg transition hover:bg-[#087b42]"
              >
                <Camera size={17} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onPhotoChange}
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
              onClick={onChangePhoto}
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
                onClick={onRemovePhoto}
                className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-100"
              >
                Remove Photo
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export function ProfileStats({ stats }) {
  return (
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
  )
}

export function PersonalInformation({
  editing,
  editForm,
  displayName,
  user,
  profile,
  joinedDate,
  updateField,
}) {
  return (
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
                updateField("location", value)
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
  )
}

export function EnvironmentalImpact({
  stats,
}) {
  return (
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
  )
}

export function RecentActivity({
  activities,
  navigate,
}) {
  return (
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
          onClick={() =>
            navigate("/activity")
          }
          className="text-sm font-semibold text-[#0b8f4d] hover:underline"
        >
          View all
        </button>
      </div>

      {activities.length === 0 ? (
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
            onClick={() =>
              navigate("/scanner")
            }
            className="mt-5 rounded-xl bg-[#0b8f4d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087b42]"
          >
            Start Scanning
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
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
  )
}

export function AccountSettings({
  loggingOut,
  onEdit,
  onNotifications,
  onPrivacy,
  onLogout,
}) {
  return (
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
          onClick={onEdit}
        />

        <SettingButton
          icon={<Bell size={19} />}
          title="Notifications"
          description="Manage notification preferences"
          onClick={onNotifications}
        />

        <SettingButton
          icon={<Lock size={19} />}
          title="Privacy & Security"
          description="Manage account security"
          onClick={onPrivacy}
        />

        <button
          type="button"
          onClick={onLogout}
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
  )
}

export function DeleteAccount({
  onDelete,
}) {
  return (
    <section className="mt-6 flex justify-end rounded-3xl border border-red-100 bg-red-50/50 p-6 sm:p-7">
      <button
        type="button"
        onClick={onDelete}
        className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-100"
      >
        Delete Account
      </button>
    </section>
  )
}

export function ProfileSections({
  profile,
  editForm,
  editing,
  displayName,
  initials,
  user,
  fileInputRef,
  stats,
  activities,
  joinedDate,
  loggingOut,
  navigate,
  onPhotoChange,
  onChangePhoto,
  onRemovePhoto,
  updateField,
  onEdit,
  onNotifications,
  onPrivacy,
  onLogout,
  onDelete,
}) {
  return (
    <>
      <ProfileHeader
        profile={profile}
        editForm={editForm}
        editing={editing}
        displayName={displayName}
        initials={initials}
        user={user}
        fileInputRef={fileInputRef}
        onPhotoChange={onPhotoChange}
        onChangePhoto={onChangePhoto}
        onRemovePhoto={onRemovePhoto}
      />

      <ProfileStats stats={stats} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <PersonalInformation
          editing={editing}
          editForm={editForm}
          displayName={displayName}
          user={user}
          profile={profile}
          joinedDate={joinedDate}
          updateField={updateField}
        />

        <EnvironmentalImpact
          stats={stats}
        />
      </div>

      <RecentActivity
        activities={activities.slice(0, 5)}
        navigate={navigate}
      />

      <AccountSettings
        loggingOut={loggingOut}
        onEdit={onEdit}
        onNotifications={onNotifications}
        onPrivacy={onPrivacy}
        onLogout={onLogout}
      />

      <DeleteAccount
        onDelete={onDelete}
      />

      <div className="h-10" />
    </>
  )
}