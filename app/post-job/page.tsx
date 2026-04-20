// fixes-web/app/post-job/page.tsx

'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { PostJobWizard } from '@/components/upwork/PostJobWizard'

function PostJobContent() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('q') || ''
  const preselectedCategory = searchParams.get('category') || ''
  const jobId = searchParams.get('jobId') || ''

  return (
    <PostJobWizard
      searchQuery={searchQuery}
      preselectedCategory={preselectedCategory}
      existingJobId={jobId}
    />
  )
}

export default function PostJobPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-linear-to-br from-white via-[#f2f7f2] to-white" />}>
      <PostJobContent />
    </Suspense>
  )
}
