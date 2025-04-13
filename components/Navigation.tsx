// components/Navigation.tsx
// Enhanced navigation bar component for Wellington Bus Timetable

export default function Navigation({ active = "home" }: { active?: string }) {
    return (
      <nav className="bg-gradient-to-r from-sky-700 to-blue-900 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="flex-shrink-0 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l-4-4m4 4l4-4" />
                </svg>
                <span className="font-bold text-xl text-white tracking-wide">Wellington Bus</span>
              </a>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink href="/" active={active === "home"}>
                  Home
                </NavLink>
                <NavLink href="/departures" active={active === "departures"}>
                  Departures
                </NavLink>
                <NavLink href="/service-alerts" active={active === "alerts"}>
                  Service Alerts
                </NavLink>
              </div>
            </div>
            
            {/* Mobile navigation */}
            <div className="md:hidden">
              <div className="flex items-center space-x-1">
                <MobileNavLink href="/" active={active === "home"}>
                  Home
                </MobileNavLink>
                <MobileNavLink href="/departures" active={active === "departures"}>
                  Departures
                </MobileNavLink>
                <MobileNavLink href="/service-alerts" active={active === "alerts"}>
                  Alerts
                </MobileNavLink>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }
  
  // Desktop navigation link component
  function NavLink({ href, active, children }: { href: string; active: boolean; children: any }) {
    return (
      <a 
        href={href} 
        className={`
          px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
          ${active 
            ? "bg-white text-blue-800 shadow-md" 
            : "text-gray-100 hover:bg-blue-700 hover:text-white"
          }
          focus:outline-none focus:ring-2 focus:ring-yellow-400
        `}
      >
        {children}
      </a>
    );
  }
  
  // Mobile navigation link component
  function MobileNavLink({ href, active, children }: { href: string; active: boolean; children: any }) {
    return (
      <a 
        href={href} 
        className={`
          px-3 py-1 rounded-md text-sm font-medium transition-all duration-200
          ${active 
            ? "bg-white text-blue-800" 
            : "text-gray-200 hover:bg-blue-700"
          }
        `}
      >
        {children}
      </a>
    );
  }