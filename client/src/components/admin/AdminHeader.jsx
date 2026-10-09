import { Bell, Settings, UserCircle, Search } from "lucide-react";

import "../../pages/admin/Admin.css";

function AdminHeader({
  title,
  subtitle = "",

  buttonText = "",
  buttonIcon = null,
  onButtonClick,

  search = "",
  setSearch,

  placeholder = "Search...",

  onNotificationClick,
  onSettingsClick,
  onProfileClick,
}) {
  const handleSearchChange = (event) => {
    if (typeof setSearch === "function") {
      setSearch(event.target.value);
    }
  };

  const handleButtonClick = () => {
    if (typeof onButtonClick === "function") {
      onButtonClick();
    }
  };

  const handleNotificationClick = () => {
    if (typeof onNotificationClick === "function") {
      onNotificationClick();
    }
  };

  const handleSettingsClick = () => {
    if (typeof onSettingsClick === "function") {
      onSettingsClick();
    }
  };

  const handleProfileClick = () => {
    if (typeof onProfileClick === "function") {
      onProfileClick();
    }
  };

  return (
    <header className="admin-page-header">
      {/* ==================================================
                        HEADER TOP
      ================================================== */}

      <div className="admin-page-header-top">
        <div className="admin-page-header-content">
          <h1>{title}</h1>

          {subtitle && <p>{subtitle}</p>}
        </div>

        {/* ==================================================
                        HEADER ACTIONS
        ================================================== */}

        <div className="admin-header-actions">
          <button
            type="button"
            className="header-icon-btn"
            aria-label="Notifications"
            title="Notifications"
            onClick={handleNotificationClick}
          >
            <Bell size={19} />
          </button>

          <button
            type="button"
            className="header-icon-btn"
            aria-label="Settings"
            title="Settings"
            onClick={handleSettingsClick}
          >
            <Settings size={19} />
          </button>

          <button
            type="button"
            className="header-icon-btn"
            aria-label="Admin profile"
            title="Admin profile"
            onClick={handleProfileClick}
          >
            <UserCircle size={20} />
          </button>
        </div>
      </div>

      {/* ==================================================
                        TOOLBAR
      ================================================== */}

      <div className="admin-toolbar">
        {/* SEARCH */}

        <div className="admin-search-wrapper">
          <Search size={18} className="admin-search-icon" />

          <input
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder={placeholder}
            className="admin-search"
            aria-label={placeholder}
          />
        </div>

        {/* ACTION BUTTON */}

        {buttonText && (
          <button
            type="button"
            className="admin-add-btn"
            onClick={handleButtonClick}
          >
            {buttonIcon && (
              <span className="admin-button-icon">{buttonIcon}</span>
            )}

            <span>{buttonText}</span>
          </button>
        )}
      </div>
    </header>
  );
}

export default AdminHeader;
