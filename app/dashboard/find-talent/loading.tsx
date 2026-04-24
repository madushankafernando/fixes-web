// fixes-web/app/dashboard/find-talent/loading.tsx

import { SkeletonTradieGrid } from '../_components/skeletons'

export default function FindTalentLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-(--upwork-navy)">Find Talent</h1>
          <p className="text-sm text-gray-400 mt-0.5">Browse verified tradies</p>
        </div>
      </div>
      <SkeletonTradieGrid />
    </div>
  )
}
