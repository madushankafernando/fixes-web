import Link from "next/link"
import Image from "next/image"
import { Manrope } from "next/font/google"
import { Facebook, Twitter, Linkedin, Instagram, Youtube, ArrowRight } from "lucide-react"

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["700"],
})

const footerLinks: Record<string, { label: string; href: string }[]> = {
  "For Clients / Homeowners": [
    { label: "Articles", href: "/articles" },
    { label: "FAQs", href: "/faqs" },
    { label: "Licensing", href: "/licensing" },
    { label: "Council Regulations", href: "/council-regulations" },
    { label: "Trust & Quality", href: "/trust-and-quality" },
    { label: "Job Poster T&Cs", href: "/job-poster-tcs" },
    { label: "Direct Contracts", href: "/direct-contracts" },
  ],
  "For Tradies": [
    { label: "Register with Fixer", href: "/i-want-to-work" },
    { label: "How to Find Work", href: "/how-to-find-work" },
    { label: "Direct Contracts", href: "/direct-contracts" },
    { label: "How Fixes Works", href: "/how-fixes-works" },
    { label: "FAQs", href: "/faqs-tradie" },
    { label: "Member Login", href: "/app/fixer" },
  ],
  "Resources": [
    { label: "Help & Support", href: "/support" },
    { label: "Fixes Reviews", href: "/reviews" },
    { label: "Resources", href: "/resources" },
    { label: "Blog", href: "/blog" },
    { label: "Community", href: "/community" },
  ],
  "Company": [
    { label: "About Us", href: "/about-us" },
    { label: "Leadership", href: "/about-us#team" },
    { label: "Investor Relations", href: "/investors" },
    { label: "Careers", href: "/careers" },
    { label: "Our Impact", href: "/community-impact" },
    { label: "Press", href: "/press" },
    { label: "Contact Us", href: "/contact-us" },
    { label: "Trust, Safety & Security", href: "/safety" },
  ],
}

const socialLinks = [
  { icon: Facebook, label: "Facebook", envKey: "NEXT_PUBLIC_FACEBOOK_URL" },
  { icon: Linkedin, label: "LinkedIn", envKey: "NEXT_PUBLIC_LINKEDIN_URL" },
  { icon: Twitter, label: "Twitter", envKey: "NEXT_PUBLIC_TWITTER_URL" },
  { icon: Youtube, label: "YouTube", envKey: "NEXT_PUBLIC_YOUTUBE_URL" },
  { icon: Instagram, label: "Instagram", envKey: "NEXT_PUBLIC_INSTAGRAM_URL" },
]

const bottomLinks = [
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Client Privacy Policy", href: "/privacy-policy/client" },
  { label: "Tradie Privacy Policy", href: "/privacy-policy/tradie" },
  { label: "CA Notice at Collection", href: "/ca-notice" },
  { label: "Cookie Settings", href: "/cookie-settings" },
  { label: "Accessibility", href: "/accessibility" },
]

const FixesQRLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1195.79 413.463" className="w-4.5 h-auto" fill="#A4FF43">
    <path d="M951.564,377.679l13.415-84.461s13.553,23.495,34.8,38.319c22.17,15.466,55.122,19.51,67.576,6.48,22.573-29.57-103.009-23.062-93.231-112.99,18.033-84.237,97.861-96.089,155.47-86.824,39.825,6.4,66.192,26,66.192,26l-12.521,69.125s-7.183-18.138-23.964-28.912c-18.576-11.928-47-15.955-51.721,2.458-9.121,35.546,82.569,4.81,82.5,103.195-.036,47.323-54.71,97.959-122.721,102.68-5.131.488-10.129.713-15,.713C991.115,413.461,951.564,377.679,951.564,377.679ZM777.681,404.015a206.6,206.6,0,0,1-45.91-4.874c-16.306-3.73-30.722-9.57-42.847-17.356a101.36,101.36,0,0,1-17.988-14.639,95.808,95.808,0,0,1-14.477-19.3,107.171,107.171,0,0,1-10.051-24.467A140.98,140.98,0,0,1,641.7,293.23a156.4,156.4,0,0,1,1.855-28.015,146.979,146.979,0,0,1,7.168-27.654,138.448,138.448,0,0,1,32.135-50.33c15.725-15.772,35.563-28.288,58.964-37.2a235.632,235.632,0,0,1,40.7-11.241,321.992,321.992,0,0,1,48.8-5.037h.511c43.883,0,76,12.6,95.446,37.451a96.368,96.368,0,0,1,16.888,34.785,140.4,140.4,0,0,1,4.483,34.787,178.251,178.251,0,0,1-1.8,26.76c-.954,6.6-1.95,10.664-1.96,10.7H767.526a53.5,53.5,0,0,0-1.045,7.755,65.162,65.162,0,0,0,1.28,18.243,47.944,47.944,0,0,0,20.756,30.548,63.661,63.661,0,0,0,15.251,7.265,67.474,67.474,0,0,0,21.191,3.24,105.779,105.779,0,0,0,31.634-5.36,175.129,175.129,0,0,0,27.952-11.792A205.934,205.934,0,0,0,912.1,310.986l-9.6,50.971c-.057.058-5.716,5.809-17.155,13.034a177.581,177.581,0,0,1-22.16,11.8,220.748,220.748,0,0,1-31.854,11.327,226.465,226.465,0,0,1-24.751,4.218,251.41,251.41,0,0,1-28.885,1.682ZM795.556,198c-4.271,3.865-8.122,9.254-11.45,16.016a98.045,98.045,0,0,0-6.093,16.016c-1.234,4.293-1.79,7.251-1.8,7.28h55.873a91.915,91.915,0,0,0,1.778-15.237,59.6,59.6,0,0,0-.922-13.178,26.976,26.976,0,0,0-4.922-11.669,16.487,16.487,0,0,0-5.82-4.686,20.094,20.094,0,0,0-8.529-1.821h-.256C806.9,190.724,800.894,193.173,795.556,198ZM0,402.455,36.253,199.288H0L8.3,140.37H45.846s7.3-93.038,96.474-126.7c91.429-30.751,183.128,0,183.128,0L313.5,88.034s-29.12-43.106-84.494-25.359c-45.716,16.31-47.507,77.7-47.507,77.7H357.657L310.946,400.8H181.5L220.11,199.288H170L134.865,402.455Zm484.492-1.835-21.065-49.34-36.774,49.34H325.417L442.1,298.969,371.2,141.476H526.1L546.179,189.1l44.848-47.622H682.5l-114.32,96.119L636.6,400.62Z"/>
  </svg>
)

const FixerQRLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 136.136 44.844" className="w-4.5 h-auto" fill="#A4FF43">
    <path d="M86.13,44.612a22.928,22.928,0,0,1-5.084-.539A14.922,14.922,0,0,1,76.3,42.157a11.239,11.239,0,0,1-1.992-1.617,10.568,10.568,0,0,1-1.6-2.132,11.837,11.837,0,0,1-1.113-2.7,15.515,15.515,0,0,1-.521-3.33,17.151,17.151,0,0,1,.205-3.094,16.171,16.171,0,0,1,.794-3.053,15.282,15.282,0,0,1,3.558-5.557,18.323,18.323,0,0,1,6.53-4.108,26.212,26.212,0,0,1,4.509-1.241,35.713,35.713,0,0,1,5.405-.556h.056c4.86,0,8.417,1.392,10.571,4.136a10.621,10.621,0,0,1,1.871,3.841,15.479,15.479,0,0,1,.5,3.841,19.61,19.61,0,0,1-.2,2.955c-.105.728-.216,1.177-.217,1.183H85.006a5.826,5.826,0,0,0-.116.855,7.174,7.174,0,0,0,.142,2.014,5.29,5.29,0,0,0,2.295,3.376,7.055,7.055,0,0,0,1.689.8,7.5,7.5,0,0,0,2.345.357,11.742,11.742,0,0,0,3.5-.592,19.5,19.5,0,0,0,3.1-1.3,22.788,22.788,0,0,0,3.052-1.895l-1.063,5.629a11.389,11.389,0,0,1-1.9,1.439,19.591,19.591,0,0,1-2.455,1.3,24.471,24.471,0,0,1-3.527,1.251,25.227,25.227,0,0,1-2.741.466,27.987,27.987,0,0,1-3.2.185ZM88.11,21.864a5.84,5.84,0,0,0-1.268,1.768,10.8,10.8,0,0,0-.674,1.768c-.137.475-.2.8-.2.8h6.189a10.184,10.184,0,0,0,.2-1.683,6.511,6.511,0,0,0-.1-1.455,2.966,2.966,0,0,0-.545-1.289,1.818,1.818,0,0,0-.647-.517,2.217,2.217,0,0,0-.944-.2h-.028a2.9,2.9,0,0,0-1.977.8ZM0,44.439,4.015,22.006H0L.92,15.5H5.077S5.886,5.227,15.763,1.512c10.127-3.4,20.282,0,20.282,0l-1.323,8.21a8.218,8.218,0,0,0-9.358-2.8C20.3,8.722,20.1,15.5,20.1,15.5h19.51L34.437,44.257H20.1l4.276-22.251H18.829L14.936,44.439Zm53.659-.2-2.333-5.448-4.073,5.448H36.041L48.965,33.013,41.112,15.622H58.267l2.224,5.256,4.967-5.256H75.589L62.927,26.236l7.581,18Z"/>
    <g transform="translate(104.136 16.086)">
      <path d="M270.206,356.89h13.882L283.529,360l-1.139,5.933-3.477,19.719H264.577l4.276-22.251Z" transform="translate(-264.577 -356.89)"/>
      <path d="M287.687,358.91a11.659,11.659,0,0,1,8.474-3.724c7.847.661,5.9,9.1,5.9,9.1h-8.5a2.509,2.509,0,0,0-2.912-2.724c-3.123.193-4.749,6.709-4.749,6.709Z" transform="translate(-270.276 -354.947)"/>
    </g>
  </svg>
)

export function Footer() {
  return (
    <footer className="bg-(--upwork-navy) text-white">
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 lg:py-14">
          <h2
            className={`${manrope.className} text-2xl sm:text-3xl lg:text-[44px] font-bold text-center mb-8 lg:mb-10`}
          >
            It&apos;s easier in the apps
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-342.5 mx-auto place-items-center">
            <Link
              href="/app/fixes"
              className="flex items-center gap-6 md:gap-8 bg-white p-6 md:p-10 w-full hover:shadow-xl transition-all duration-300 group rounded-[23px]"
              style={{ maxWidth: '675px', minHeight: '237px' }}
            >
              <div className="shrink-0 w-32 h-32 md:w-40 md:h-40 overflow-hidden relative flex items-center justify-center">
                <Image
                  src="/qr-fixes-client.png"
                  alt="Scan to download Fixes"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover rounded-[14px]"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black w-6 h-2.5 rounded-[2px] flex items-center justify-center">
                    <FixesQRLogo />
                  </div>
                </div>
              </div>
              <div className="grow min-w-0 flex flex-col justify-center">
                <p className="text-xl md:text-2xl font-bold text-black mb-2">Download the Fixes app</p>
                <p className="text-sm md:text-base text-gray-400 font-medium">Scan to download</p>
              </div>
              <ArrowRight className="w-6 h-6 md:w-8 md:h-8 text-black opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
            </Link>

            <Link
              href="/app/fixer"
              className="flex items-center gap-6 md:gap-8 bg-white p-6 md:p-10 w-full hover:shadow-xl transition-all duration-300 group rounded-[23px]"
              style={{ maxWidth: '675px', minHeight: '237px' }}
            >
              <div className="shrink-0 w-32 h-32 md:w-40 md:h-40 overflow-hidden relative flex items-center justify-center">
                <Image
                  src="/qr-fixer-tradie.png"
                  alt="Scan to download Fixer"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover rounded-[14px]"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black w-6 h-2.5 rounded-[2px] flex items-center justify-center">
                    <FixerQRLogo />
                  </div>
                </div>
              </div>
              <div className="grow min-w-0 flex flex-col justify-center">
                <p className="text-xl md:text-2xl font-bold text-black mb-2">Download the Fixer Tradie app</p>
                <p className="text-sm md:text-base text-gray-400 font-medium">Scan to download</p>
              </div>
              <ArrowRight className="w-6 h-6 md:w-8 md:h-8 text-black opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          </div>
        </div>
      </div>

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
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm text-gray-400">Follow us</span>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                const href = process.env[social.envKey] || "#"
                return (
                  <Link
                    key={social.label}
                    href={href}
                    target={href !== "#" ? "_blank" : undefined}
                    rel={href !== "#" ? "noopener noreferrer" : undefined}
                    className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={80}
                height={28}
                className="h-5 w-auto brightness-0 invert"
              />
              <span className="text-sm text-gray-400">© 2026 All rights reserved.</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {bottomLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
