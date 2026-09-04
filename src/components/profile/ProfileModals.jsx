import {
  Mail,
  ShieldCheck,
  Settings,
  X,
} from "lucide-react"


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


export default function ProfileModals({
  showNotifications,
  showPrivacy,
  showDelete,
  notifications,
  user,
  onCloseNotifications,
  onClosePrivacy,
  onCloseDelete,
  onNotificationChange,
  onDeleteAccount,
}) {
  return (
    <>
      {showNotifications && (
        <Modal
          title="Notifications"
          description="Choose which updates you want to receive."
          onClose={onCloseNotifications}
        >
          <div className="space-y-3">

            <Toggle
              title="Waste Updates"
              description="Updates about scans and disposal actions"
              enabled={
                notifications.wasteUpdates
              }
              onChange={() =>
                onNotificationChange(
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
                onNotificationChange(
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
                onNotificationChange(
                  "communityUpdates"
                )
              }
            />

          </div>
        </Modal>
      )}


      {showPrivacy && (
        <Modal
          title="Privacy & Security"
          description="Manage your account protection and authentication."
          onClose={onClosePrivacy}
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


      {showDelete && (
        <Modal
          title="Delete Account?"
          description="This action cannot be undone."
          onClose={onCloseDelete}
        >
          <div className="rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-600">
            Your Firebase account and saved local profile
            information will be removed permanently.
          </div>

          <div className="mt-5 flex justify-end gap-3">

            <button
              type="button"
              onClick={onCloseDelete}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onDeleteAccount}
              className="rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white hover:bg-red-600"
            >
              Delete Account
            </button>

          </div>
        </Modal>
      )}
    </>
  )
}