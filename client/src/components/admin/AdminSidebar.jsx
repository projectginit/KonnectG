import { NavLink } from "react-router-dom";
import useAuth from "../../context/useAuth";
import "../../pages/admin/Admin.css";

const ADMIN_LINKS = [
  {
    label: "Dashboard Overview",
    path: "dashboard",
    icon: "🖥️",
  },
  {
    label: "Merchants",
    path: "merchants",
    icon: "🤝",
  },
  {
    label: "Users",
    path: "users",
    icon: "👥",
  },
  {
    label: "Verification",
    path: "verification",
    icon: "🔒",
  },
  {
    label: "Offers",
    path: "offers",
    icon: "🎉",
  },
  {
    label: "Reviews",
    path: "reviews",
    icon: "⭐",
  },
  {
    label: "Analytics",
    path: "analytics",
    icon: "📊",
  },
  {
    label: "Approval",
    path: "approval",
    icon: "🏠",
  },
];

function AdminSidebar() {
  const { user } = useAuth();

  return (
    <aside className="admin-sidebar">
      {/* ==================================================
                            NAVIGATION
      ================================================== */}

      <nav className="admin-sidebar-nav">
        {ADMIN_LINKS.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end
            className={({ isActive }) =>
              `admin-sidebar-button ${
                isActive ? "admin-sidebar-button-active" : ""
              }`
            }
          >
            <span className="admin-sidebar-icon" aria-hidden="true">
              {link.icon}
            </span>

            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ==================================================
                            PROFILE
      ================================================== */}

      <NavLink
        to="profile"
        className={({ isActive }) =>
          `dash-profile ${isActive ? "dash-profile-active" : ""}`
        }
      >
        <span className="dash-profile-icon" aria-hidden="true">
          👤
        </span>

        <span className="dash-profile-name">{user?.name || "Admin"}</span>
      </NavLink>
    </aside>
  );
}

export default AdminSidebar;
