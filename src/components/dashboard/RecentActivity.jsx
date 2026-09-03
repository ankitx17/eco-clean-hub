import {
  CheckCircle2,
  Clock3,
  Leaf,
  Recycle,
  Trash2,
} from "lucide-react"

const activities = [
  {
    id: 1,
    title: "Plastic Bottle",
    category: "Plastic",
    date: "Today, 10:42 AM",
    credits: "+25",
    status: "Verified",
    icon: Recycle,
  },
  {
    id: 2,
    title: "Paper Waste",
    category: "Paper",
    date: "Yesterday, 5:18 PM",
    credits: "+20",
    status: "Verified",
    icon: Leaf,
  },
  {
    id: 3,
    title: "Organic Waste",
    category: "Organic",
    date: "28 Aug, 8:35 AM",
    credits: "+30",
    status: "Pending",
    icon: Clock3,
  },
  {
    id: 4,
    title: "Glass Bottle",
    category: "Glass",
    date: "26 Aug, 4:12 PM",
    credits: "+25",
    status: "Verified",
    icon: CheckCircle2,
  },
]

function RecentActivity() {
  return (
    <div className="rounded-3xl border border-[#dfeae3] bg-white p-5 shadow-sm sm:p-6">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">

        <div>
          <h2 className="text-xl font-bold text-[#14231a]">
            Recent Waste Activity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Track your latest recycling and disposal actions
          </p>
        </div>

        <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#176b45] sm:flex">
          <Recycle size={20} />
        </div>

      </div>

      {/* ACTIVITY LIST */}
      <div className="space-y-3">

        {activities.map((activity) => {
          const Icon = activity.icon

          return (
            <div
              key={activity.id}
              className="group flex items-center gap-4 rounded-2xl border border-slate-100 p-4 transition hover:border-green-100 hover:bg-green-50/30"
            >

              {/* ICON */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45] transition group-hover:bg-[#176b45] group-hover:text-white">
                <Icon size={20} />
              </div>

              {/* DETAILS */}
              <div className="min-w-0 flex-1">

                <div className="flex flex-wrap items-center gap-2">

                  <h3 className="text-sm font-semibold text-[#14231a]">
                    {activity.title}
                  </h3>

                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    {activity.category}
                  </span>

                </div>

                <p className="mt-1 text-xs text-slate-400">
                  {activity.date}
                </p>

              </div>

              {/* CREDIT + STATUS */}
              <div className="shrink-0 text-right">

                <p className="text-sm font-bold text-[#176b45]">
                  {activity.credits}
                </p>

                <div className="mt-1 flex items-center justify-end gap-1">

                  {activity.status === "Verified" ? (
                    <>
                      <CheckCircle2
                        size={12}
                        className="text-green-600"
                      />

                      <span className="text-[10px] font-semibold text-green-600">
                        Verified
                      </span>
                    </>
                  ) : (
                    <>
                      <Clock3
                        size={12}
                        className="text-amber-500"
                      />

                      <span className="text-[10px] font-semibold text-amber-600">
                        Pending
                      </span>
                    </>
                  )}

                </div>

              </div>

            </div>
          )
        })}

      </div>

      {/* EMPTY / INFO FOOTER */}
      <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#f6faf7] p-4">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#176b45]">
          <Trash2 size={17} />
        </div>

        <p className="text-xs leading-5 text-slate-500">
          Every verified disposal helps keep waste away from landfills
          and earns you Eco-Credits.
        </p>

      </div>

    </div>
  )
}

export default RecentActivity