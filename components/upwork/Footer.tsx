import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react"

const footerLinks: Record<string, { label: string; href: string }[]> = {
  "For Clients": [
    { label: "How to Hire", href: "#" },
    { label: "Talent Marketplace", href: "#" },
    { label: "Project Catalog", href: "#" },
    { label: "Hire an Agency", href: "#" },
    { label: "Enterprise", href: "#" },
    { label: "Any Hire", href: "#" },
    { label: "Direct Contracts", href: "#" },
    { label: "Hire Worldwide", href: "#" },
    { label: "Hire in the USA", href: "#" },
  ],
  "For Talent": [
    { label: "How to Find Work", href: "#" },
    { label: "Direct Contracts", href: "#" },
    { label: "Find Freelance Jobs Worldwide", href: "#" },
    { label: "Find Freelance Jobs in the USA", href: "#" },
    { label: "Win Work with Ads", href: "#" },
  ],
  "Resources": [
    { label: "Help & Support", href: "/support" },
    { label: "Success Stories", href: "#" },
    { label: "Fixes Reviews", href: "#" },
    { label: "Resources", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Community", href: "#" },
    { label: "Affiliate Program", href: "#" },
    { label: "Free Business Tools", href: "#" },
  ],
  "Company": [
    { label: "About Us", href: "/about" },
    { label: "Leadership", href: "/about#team" },
    { label: "Investor Relations", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Our Impact", href: "#" },
    { label: "Press", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Trust, Safety & Security", href: "#" },
  ],
}

const socialLinks = [
  { icon: Facebook, label: "Facebook" },
  { icon: Linkedin, label: "LinkedIn" },
  { icon: Twitter, label: "Twitter" },
  { icon: Youtube, label: "YouTube" },
  { icon: Instagram, label: "Instagram" },
]

const bottomLinks = [
  "Terms of Service",
  "Privacy Policy",
  "CA Notice at Collection",
  "Cookie Settings",
  "Accessibility",
]

export function Footer() {
  return (
    <footer className="bg-(--upwork-navy) text-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-base mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Follow us</span>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <Link
                      key={social.label}
                      href="#"
                      className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                      aria-label={social.label}
                    >
                      <Icon className="w-4 h-4" />
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="#"
                className="px-4 py-2 border border-gray-700 rounded-lg text-sm hover:border-gray-500 transition-colors"
              >
                App Store
              </Link>
              <Link
                href="#"
                className="px-4 py-2 border border-gray-700 rounded-lg text-sm hover:border-gray-500 transition-colors"
              >
                Google Play
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={80}
                height={28}
                className="h-5 w-auto brightness-0 invert"
              />
              <span className="text-sm text-gray-400">© 2015 - 2026 All rights reserved.</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {bottomLinks.map((link) => (
                <Link
                  key={link}
                  href="#"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}


