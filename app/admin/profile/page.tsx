'use client'

import Image from 'next/image'
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export default function AdminProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-400 mt-0.5">Admin account details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main card */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-[#2563EB] flex items-center justify-center text-white overflow-hidden shrink-0">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt={user.name} width={64} height={64} className="object-cover w-full h-full" />
              ) : (
                <UserIcon className="w-7 h-7" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
              <p className="text-xs text-gray-400 font-mono">{user.fixId}</p>
              <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium capitalize bg-[#EFF6FF] text-[#2563EB]">
                {user.role}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
                <p className="text-gray-800">{user.email}</p>
              </div>
              {user.isEmailVerified && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" />Verified
                </span>
              )}
            </div>

            {user.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Phone</p>
                  <p className="text-gray-800">{user.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Member Since</p>
                <p className="text-gray-800">{memberSince}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account status */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#2563EB]" />
            Account Status
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className={user.isActive ? 'text-emerald-600' : 'text-red-500'}>
                {user.isActive ? 'Active' : 'Suspended'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span className={user.isEmailVerified ? 'text-emerald-600' : 'text-amber-500'}>
                {user.isEmailVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Role</span>
              <span className="text-gray-800 capitalize">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">User ID</span>
              <span className="text-gray-800 font-mono text-[10px]">{user.fixId}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
