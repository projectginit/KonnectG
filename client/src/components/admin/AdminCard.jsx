import { NavLink } from "react-router-dom";
import "../../pages/admin/Admin.css";

function AdminCard({ icon, title, value, subtitle, link }) {
  const cardContent = (
    <>
      {/* ==================================================
                          ICON
      ================================================== */}

      <div className="admin-card-top">
        <span className="admin-card-icon" aria-hidden="true">
          {icon}
        </span>
      </div>

      {/* ==================================================
                          VALUE
      ================================================== */}

      <div className="admin-card-mid-text">{value}</div>

      {/* ==================================================
                          TITLE
      ================================================== */}

      <div className="admin-card-top-text">{title}</div>

      {/* ==================================================
                        SUBTITLE
      ================================================== */}

      {subtitle && <div className="admin-card-bottom-text">{subtitle}</div>}

      {/* ==================================================
                          LINK
      ================================================== */}

      {link && <div className="admin-card-link">View →</div>}
    </>
  );

  /*
    If no link is provided, render a normal card.

    This is useful for informational KPI cards such as:
    - New Users
    - Pending Tasks
    - Average Rating
  */

  if (!link) {
    return <div className="admin-card">{cardContent}</div>;
  }

  /*
    If a link is provided, render the entire card
    as a React Router navigation element.
  */

  return (
    <NavLink
      to={link}
      className="admin-card admin-card-clickable"
      aria-label={`${title}: ${value}. View details.`}
    >
      {cardContent}
    </NavLink>
  );
}

export default AdminCard;
