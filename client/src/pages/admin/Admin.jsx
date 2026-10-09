import { Outlet } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Footer from "../../components/layout/Footer";

import "./Admin.css";

export default function Admin() {
  return (
    <div className="admin-shell">

      {/* ==================================================
                            PUBLIC NAVBAR
      ================================================== */}

      <Navbar />


      {/* ==================================================
                            ADMIN AREA
      ================================================== */}

      <div className="admin-layout">

        {/* SIDEBAR */}

        <AdminSidebar />


        {/* PAGE CONTENT */}

        <main
          className="admin-content"
          role="main"
        >
          <Outlet />
        </main>

      </div>


      {/* ==================================================
                            FOOTER
      ================================================== */}

      <Footer />

    </div>
  );
}