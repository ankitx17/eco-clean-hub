import {
  MapPin,
  Camera,
  Upload,
  ShieldCheck,
} from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

function SubmitCleanup() {
  const navigate = useNavigate()
  const location = useLocation()

  const mode = location.state?.mode || "SOLO"
  const terrain = location.state?.terrain || "Other"

  return (
    <div className="min-h-screen bg-[#f6faf7] text-[#14231a]">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 text-sm font-semibold text-[#176b45] hover:underline"
          >
            ← Back to Terrain
          </button>

          <h1 className="text-2xl font-bold sm:text-3xl">
            Submit Your Cleanup
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Share your environmental impact with automatic verification
            and earn EcoPoints!
          </p>
        </div>

        {/* FORM */}
        <div className="rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm sm:p-7">

          {/* EVENT TYPE */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold">
              Event Type *
            </label>

            <select
              defaultValue={mode}
              className="w-full rounded-xl border border-[#dfeae3] bg-white px-3 py-3 text-sm outline-none focus:border-[#176b45] focus:ring-2 focus:ring-green-100"
            >
              <option value="SOLO">Solo Event</option>
              <option value="GROUP">Group Event</option>
              <option value="PLANTATION">Plantation</option>
            </select>
          </div>

          {/* TERRAIN */}
          <div className="mb-6 rounded-xl border border-[#dfeae3] p-4">
            <div className="mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-[#176b45]" />

              <h2 className="font-bold">
                Cleanup Location
              </h2>
            </div>

            <p className="mb-2 text-xs font-semibold text-slate-600">
              Selected Terrain
            </p>

            <div className="rounded-lg bg-[#edf8f1] px-3 py-2 text-sm font-medium text-[#176b45]">
              {terrain}
            </div>

            {/* CURRENT LOCATION */}
            <p className="mb-2 mt-5 text-xs font-semibold text-slate-600">
              Automatic Location Detection
            </p>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#14231a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#176b45]"
            >
              <MapPin size={15} />
              Get Current Location
            </button>

            <p className="mt-2 text-xs text-slate-400">
              Use GPS to automatically detect your current location
            </p>

            {/* MANUAL LOCATION */}
            <p className="mb-2 mt-4 text-xs font-semibold text-slate-600">
              Or Enter Location Manually
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter address or location description"
                className="min-w-0 flex-1 rounded-lg border border-[#dfeae3] px-3 py-2.5 text-sm outline-none focus:border-[#176b45]"
              />

              <button
                type="button"
                className="rounded-lg border border-[#dfeae3] px-4 text-sm font-medium text-slate-600 hover:bg-[#f6faf7]"
              >
                Set
              </button>
            </div>

            {/* VERIFICATION INFO */}
            <div className="mt-4 flex gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <MapPin size={15} className="mt-0.5 shrink-0 text-blue-600" />

              <div>
                <p className="text-xs font-semibold text-blue-700">
                  Location helps with verification
                </p>

                <p className="mt-0.5 text-[11px] leading-4 text-blue-600">
                  Providing your location helps us verify your cleanup
                  and may earn bonus points for organized events.
                </p>
              </div>
            </div>
          </div>

          {/* NUMBER OF BAGS */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold">
              Number of Trash Bags Collected *
            </label>

            <input
              type="number"
              min="1"
              placeholder="Enter number of bags"
              className="w-full rounded-xl border border-[#dfeae3] px-3 py-3 text-sm outline-none focus:border-[#176b45] focus:ring-2 focus:ring-green-100"
            />

            <p className="mt-1 text-xs text-slate-400">
              You'll earn 10 EcoPoints per bag collected!
            </p>
          </div>

          {/* DESCRIPTION */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold">
              Description <span className="font-normal text-slate-400">(Optional)</span>
            </label>

            <textarea
              rows="4"
              placeholder="Tell us about your cleanup experience..."
              className="w-full resize-none rounded-xl border border-[#dfeae3] px-3 py-3 text-sm outline-none focus:border-[#176b45] focus:ring-2 focus:ring-green-100"
            />
          </div>

          {/* PHOTO EVIDENCE */}
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <Camera size={17} className="text-[#176b45]" />

              <h2 className="font-bold">
                Photo Evidence *
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              {/* BEFORE */}
              <div className="rounded-xl border border-[#dfeae3] p-4">
                <p className="text-sm font-semibold">
                  Before Photo
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Show the area before cleanup
                </p>

                <label className="mt-3 flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-slate-400 transition hover:border-[#176b45] hover:bg-[#f6faf7]">
                  <Upload size={22} />

                  <span className="mt-2 text-xs">
                    Click to upload
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>

              {/* AFTER */}
              <div className="rounded-xl border border-[#dfeae3] p-4">
                <p className="text-sm font-semibold">
                  After Photo
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Show the cleaned area with trash bags
                </p>

                <label className="mt-3 flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-slate-400 transition hover:border-[#176b45] hover:bg-[#f6faf7]">
                  <Upload size={22} />

                  <span className="mt-2 text-xs">
                    Click to upload
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>

            </div>
          </div>

          {/* ACTION PHOTOS */}
          <div className="mb-6 rounded-xl border border-[#dfeae3] p-4">
            <div className="flex items-center gap-2">
              <Camera size={17} className="text-[#176b45]" />

              <h2 className="font-bold">
                Action Photos
                <span className="ml-1 text-sm font-normal text-slate-400">
                  (Optional)
                </span>
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Photos of you and your team during the cleanup
            </p>

            <label className="mt-4 flex h-28 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-slate-400 hover:border-[#176b45] hover:bg-[#f6faf7]">
              <Upload size={20} />

              <span className="mt-2 text-xs">
                Add photo
              </span>

              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
              />
            </label>
          </div>

          {/* VERIFY BUTTON */}
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#176b45] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125a39]"
          >
            <ShieldCheck size={18} />
            Analyze & Verify Photos
          </button>

          <p className="mt-2 text-center text-xs text-slate-400">
            Before and after photos are required. Action photos help
            with verification.
          </p>

        </div>
      </main>
    </div>
  )
}

export default SubmitCleanup