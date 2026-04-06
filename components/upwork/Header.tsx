"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, Search, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { label: "Find Talent", hasDropdown: true },
  { label: "Find Work", hasDropdown: true },
  { label: "Why Fixes", hasDropdown: true },
  { label: "Enterprise", hasDropdown: false },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#FFFCE9] border-b border-[var(--upwork-border)]">
      {/* Top Banner */}
      <div className="bg-[var(--upwork-navy)] text-white py-2 px-4 text-center text-sm">
        <span className="font-semibold">Stop doing everything.</span>{" "}
        Hire the top 1% of talent on Business Plus.{" "}
        <Link href="#" className="underline hover:no-underline">
          Get started
        </Link>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[var(--upwork-navy)] hover:text-[var(--upwork-green)] transition-colors"
                >
                  {item.label}
                  {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
                </button>
              ))}
            </nav>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-4">

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                className="text-[var(--upwork-green)] hover:text-[var(--upwork-green-dark)] font-medium"
              >
                Log In
              </Button>
              <Button className="bg-[var(--upwork-green)] hover:bg-[var(--upwork-green-dark)] text-white rounded-full px-5">
                Sign Up
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 py-4 px-4">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                className="flex items-center justify-between px-4 py-3 text-sm font-medium text-[var(--upwork-navy)] hover:bg-gray-50 rounded-lg"
              >
                {item.label}
                {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
              </button>
            ))}
          </nav>
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full border-[var(--upwork-green)] text-[var(--upwork-green)]"
            >
              Log In
            </Button>
            <Button className="w-full bg-[var(--upwork-green)] hover:bg-[var(--upwork-green-dark)] text-white">
              Sign Up
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}


