import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react"

const footerLinks = {
  "For Clients": [
    "How to Hire",
    "Talent Marketplace",
    "Project Catalog",
    "Hire an Agency",
    "Enterprise",
    "Any Hire",
    "Direct Contracts",
    "Hire Worldwide",
    "Hire in the USA",
  ],
  "For Talent": [
    "How to Find Work",
    "Direct Contracts",
    "Find Freelance Jobs Worldwide",
    "Find Freelance Jobs in the USA",
    "Win Work with Ads",
  ],
  "Resources": [
    "Help & Support",
    "Success Stories",
    "Upwork Reviews",
    "Resources",
    "Blog",
    "Community",
    "Affiliate Program",
    "Free Business tools",
  ],
  "Company": [
    "About Us",
    "Leadership",
    "Investor Relations",
    "Careers",
    "Our Impact",
    "Press",
    "Contact Us",
    "Trust, Safety & Security",
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
    <footer className="bg-[var(--upwork-navy)] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-base mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Social Links */}
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

            {/* Mobile App Links */}
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

          {/* Legal Links */}
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


