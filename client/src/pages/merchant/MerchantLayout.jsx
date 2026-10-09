import { NavLink, Outlet } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";

const NAV_ITEMS = [
  {
    path: "/merchant",
    icon: "⊞",
    label: "Dashboard",
    end: true,
  },
  {
    path: "/merchant/listings",
    icon: "☰",
    label: "My Listings",
  },
  {
    path: "/merchant/offers",
    icon: "🏷️",
    label: "Offers",
  },
  {
    path: "/merchant/insights",
    icon: "📊",
    label: "Insights",
  },
  {
    path: "/merchant/account",
    icon: "⚙️",
    label: "Account",
  },
];

export default function MerchantLayout() {
  return (
    <div className="min-h-screen bg-[#F7F6FA]">
      <Navbar />

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside
        className="
          fixed
          left-0
          top-[65px]
          z-40
          hidden
          h-[calc(100vh-65px)]
          w-60
          overflow-y-auto
          border-r
          border-[#EFEDF5]
          bg-white
          px-3
          py-6
          lg:block
        "
      >
        {/* Merchant identity */}

        <div className="mb-6 flex items-center gap-3 px-2">
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-purple-700
              font-bold
              text-white
            "
          >
            S
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink">
              Saffron Kitchen
            </p>

            <p className="text-xs font-medium text-emerald-500">Verified ✓</p>
          </div>
        </div>

        {/* Navigation */}

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-2.5
                  text-left
                  text-sm
                  transition
                  ${
                    isActive
                      ? "bg-purple-50 font-semibold text-purple-700"
                      : "font-medium text-ink-soft hover:bg-[#F7F6FA] hover:text-ink"
                  }
                `
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#EFEDF5] bg-white lg:hidden">
        <nav className="grid grid-cols-5 gap-1 p-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `
                  flex
                  flex-col
                  items-center
                  justify-center
                  rounded-xl
                  px-2
                  py-2
                  text-[11px]
                  transition
                  ${
                    isActive
                      ? "bg-purple-50 font-semibold text-purple-700"
                      : "text-ink-soft"
                  }
                `
              }
            >
              <span className="mb-1 text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      <main
        className="
          min-h-[calc(100vh-65px)]
          min-w-0
          pt-[65px]
          lg:ml-60
        "
      >
        <div className="p-5 pb-24 sm:p-8 lg:pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
