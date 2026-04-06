"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { PostJobWizard } from "@/components/upwork/PostJobWizard"

function PostJobContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  
  return <PostJobWizard searchQuery={query} />
}

export default function PostJobPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--upwork-green)]" />
      </div>
    }>
      <PostJobContent />
    </Suspense>
  )
}
