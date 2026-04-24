// fixes-web/app/dashboard/jobs/loading.tsx

import { SkeletonJobList } from '../_components/skeletons'

export default function JobsLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-(--upwork-navy)">Jobs</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your job postings</p>
        </div>
      </div>
      <SkeletonJobList />
    </div>
  )
}
