import {
  useState,
} from "react"

import {
  Pencil,
  CheckCircle2,
  X,
  Save,
} from "lucide-react"

import useProfile from "../hooks/useProfile"

import {
  ProfileSections,
} from "../components/profile/ProfileSections"

import ProfileModals from "../components/profile/ProfileModals"


function Profile() {
  const profileData = useProfile()

  const {
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
  } = profileData


  if (!user) {
    return null
  }


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
              onClick={() =>
                setError("")
              }
            >
              <X size={17} />
            </button>
          </div>
        )}


        <ProfileSections
          profile={profile}
          editForm={editForm}
          editing={editing}

          displayName={displayName}
          initials={initials}
          user={user}

          fileInputRef={fileInputRef}

          stats={stats}
          activities={activities}
          joinedDate={joinedDate}

          loggingOut={loggingOut}
          navigate={navigate}

          onPhotoChange={
            handlePhotoChange
          }

          onChangePhoto={() =>
            fileInputRef.current?.click()
          }

          onRemovePhoto={removePhoto}

          updateField={updateField}

          onEdit={startEditing}

          onNotifications={() =>
            setShowNotifications(true)
          }

          onPrivacy={() =>
            setShowPrivacy(true)
          }

          onLogout={logout}

          onDelete={() =>
            setShowDelete(true)
          }
        />

      </div>


      <ProfileModals
        showNotifications={
          showNotifications
        }

        showPrivacy={
          showPrivacy
        }

        showDelete={
          showDelete
        }

        notifications={
          notifications
        }

        user={user}

        onCloseNotifications={() =>
          setShowNotifications(false)
        }

        onClosePrivacy={() =>
          setShowPrivacy(false)
        }

        onCloseDelete={() =>
          setShowDelete(false)
        }

        onNotificationChange={
          updateNotification
        }

        onDeleteAccount={
          deleteAccount
        }
      />

    </div>
  )
}

export default Profile