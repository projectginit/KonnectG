import "../../../pages/admin/Admin.css";

function ApprovalCard({
  merchant,
  onApprove,
  onReject,
  actionLoading = false,
}) {
  if (!merchant) {
    return null;
  }

  /*
   * BUSINESS NAME
   */
  const businessName =
    merchant.name || merchant.businessName || "Unnamed Business";

  /*
   * CATEGORY
   *
   * Supports:
   * categoryRef: { name: "Restaurant" }
   * category: { name: "Restaurant" }
   * category: "Restaurant"
   */
  const category =
    merchant.categoryRef?.name ||
    merchant.category?.name ||
    (typeof merchant.category === "string" ? merchant.category : null) ||
    "Uncategorized";

  /*
   * OWNER
   *
   * Supports:
   * owner: { name: "John" }
   * owner: { email: "john@example.com" }
   * owner: "John"
   */
  const owner =
    merchant.owner?.name ||
    merchant.owner?.email ||
    (typeof merchant.owner === "string" ? merchant.owner : null) ||
    "Unknown";

  /*
   * LOCATION
   *
   * Your API is returning:
   *
   * location: {
   *   latitude: ...,
   *   longitude: ...
   * }
   *
   * React cannot render that object directly.
   *
   * We therefore prefer:
   * area + city
   * then address
   * then latitude/longitude.
   */
  let location = "Not provided";

  if (merchant.area || merchant.city) {
    location = [merchant.area, merchant.city].filter(Boolean).join(", ");
  } else if (merchant.address && typeof merchant.address === "string") {
    location = merchant.address;
  } else if (merchant.location && typeof merchant.location === "object") {
    const latitude = merchant.location.latitude;

    const longitude = merchant.location.longitude;

    if (latitude !== undefined && longitude !== undefined) {
      location = `Lat: ${latitude}, Lng: ${longitude}`;
    }
  } else if (typeof merchant.location === "string") {
    location = merchant.location;
  }

  /*
   * PHONE
   */
  const phone = merchant.phone || "Not provided";

  /*
   * BUSINESS ID
   */
  const businessId = merchant._id || merchant.id || "N/A";

  /*
   * APPROVAL STATUS
   */
  const rawStatus = merchant.approvalStatus || "pending";

  const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

  /*
   * CREATED DATE
   */
  const createdDate = merchant.createdAt
    ? new Date(merchant.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  return (
    <div className="approval-card">
      {/* LEFT */}
      <div className="approval-card-left">
        <div className="approval-business">{businessName}</div>

        <div className="approval-category">{category}</div>

        <div className="approval-owner">👤 {owner}</div>

        <div className="approval-location">📍 {location}</div>
      </div>

      {/* MIDDLE */}
      <div className="approval-card-middle">
        <div>🆔 {businessId}</div>

        <div>📞 {phone}</div>

        <div>📅 {createdDate}</div>
      </div>

      {/* RIGHT */}
      <div className="approval-card-right">
        <span className={`status-badge ${rawStatus}`}>{status}</span>

        {rawStatus === "pending" && (
          <div className="approval-actions">
            <button
              className="approve-btn"
              onClick={() => onApprove?.(merchant._id)}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Approve"}
            </button>

            <button
              className="reject-btn"
              onClick={() => onReject?.(merchant._id)}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Reject"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApprovalCard;
