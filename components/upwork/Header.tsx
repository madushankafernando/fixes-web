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
    <header className="sticky top-0 z-50 bg-[#FFFCE9] border-b border-(--upwork-border)">
      <div className="bg-(--upwork-navy) text-white py-2 px-4 text-center text-sm">
        <span className="font-semibold">Stop doing everything.</span>{" "}
        Hire the top 1% of talent on Business Plus.{" "}
        <Link href="#" className="underline hover:no-underline">
          Get started
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
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

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-(--upwork-navy) hover:text-(--upwork-green) transition-colors"
                >
                  {item.label}
                  {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-(--upwork-green) hover:text-(--upwork-green-dark) font-medium"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white rounded-full px-5">
                  Sign Up
                </Button>
              </Link>
            </div>

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

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 py-4 px-4">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                className="flex items-center justify-between px-4 py-3 text-sm font-medium text-(--upwork-navy) hover:bg-gray-50 rounded-lg"
              >
                {item.label}
                {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
              </button>
            ))}
          </nav>
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-200">
            <Link href="/login">
              <Button
                variant="outline"
                className="w-full border-(--upwork-green) text-(--upwork-green)"
              >
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="w-full bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}


