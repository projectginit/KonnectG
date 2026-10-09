import { useCallback, useEffect, useState } from "react";
import "./Admin.css";
import AdminHeader from "../../components/admin/AdminHeader";
import ReviewCard from "../../components/admin/review/ReviewCard";
import ReviewModal from "../../components/admin/review/ReviewModal";
import apiRequest from "../../services/api";

function Reviews() {
  const [search, setSearch] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);

  const [ratingFilter, setRatingFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (ratingFilter !== "All") {
        params.set("rating", ratingFilter);
      }

      /*
       * The current review backend uses approved reviews as the
       * public review state. Hidden/flagged moderation states will
       * only be sent if your backend supports those query values.
       */
      if (statusFilter !== "All") {
        params.set("status", statusFilter.toLowerCase());
      }

      const sortMap = {
        Newest: "newest",
        "Highest Rating": "rating-desc",
        "Lowest Rating": "rating-asc",
      };

      params.set("sort", sortMap[sortBy] || "newest");
      params.set("page", pagination.page);
      params.set("limit", pagination.limit);

      const data = await apiRequest(`/reviews/admin/all?${params.toString()}`);

      setReviews(data.reviews || []);

      setPagination((prev) => ({
        ...prev,
        ...(data.pagination || {}),
      }));
    } catch (err) {
      console.error("Failed to load reviews:", err);

      setError(err.message || "Failed to load reviews.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [
    search,
    ratingFilter,
    statusFilter,
    sortBy,
    pagination.page,
    pagination.limit,
  ]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const showSuccess = (message) => {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const handleStatus = async (review) => {
    const reviewId = review._id || review.id;

    /*
     * We will connect this to the actual moderation endpoint
     * once ReviewCard/backend moderation fields are confirmed.
     */
    console.log("Review status action:", reviewId);
  };

  const handleDelete = async (review) => {
    const reviewId = review._id || review.id;

    const confirmed = window.confirm(
      "Delete this review? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(reviewId);
      setError("");

      const data = await apiRequest(`/reviews/${reviewId}`, {
        method: "DELETE",
      });

      showSuccess(data.message || "Review deleted successfully.");

      setSelectedReview(null);

      await loadReviews();
    } catch (err) {
      console.error("Failed to delete review:", err);

      setError(err.message || "Failed to delete review.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleView = (review) => {
    setSelectedReview(review);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) {
      return;
    }

    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleSearchChange = (value) => {
    setSearch(value);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handleRatingChange = (value) => {
    setRatingFilter(value);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handleSortChange = (value) => {
    setSortBy(value);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const totalReviews = pagination.total || reviews.length;

  const flaggedCount = reviews.filter(
    (review) =>
      review.status === "flagged" ||
      review.status === "Flagged" ||
      review.isFlagged === true,
  ).length;

  const hiddenCount = reviews.filter(
    (review) =>
      review.status === "hidden" ||
      review.status === "Hidden" ||
      review.isHidden === true,
  ).length;

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="reviews-page">
      <AdminHeader
        title="Reviews"
        subtitle="Moderate customer reviews across KonnectG."
        buttonText="Export"
        buttonIcon="📄"
        search={search}
        setSearch={handleSearchChange}
        placeholder="Search reviews..."
        onButtonClick={() => alert("Export CSV")}
      />

      {/* Messages */}

      {error && <div className="admin-alert error">{error}</div>}

      {successMessage && (
        <div className="admin-alert success">{successMessage}</div>
      )}

      {/* Summary */}

      <div className="merchant-summary">
        <div className="merchant-summary-card">
          <h3>Total Reviews</h3>
          <span>{totalReviews}</span>
        </div>

        <div className="merchant-summary-card">
          <h3>Flagged</h3>
          <span>{flaggedCount}</span>
        </div>

        <div className="merchant-summary-card">
          <h3>Hidden</h3>
          <span>{hiddenCount}</span>
        </div>

        <div className="merchant-summary-card">
          <h3>Average Rating</h3>
          <span>{averageRating}★</span>
        </div>
      </div>

      {/* Filters */}

      <div className="merchant-toolbar">
        <select
          value={ratingFilter}
          onChange={(e) => handleRatingChange(e.target.value)}
        >
          <option value="All">All Ratings</option>
          <option value="5">5 ★</option>
          <option value="4">4 ★</option>
          <option value="3">3 ★</option>
          <option value="2">2 ★</option>
          <option value="1">1 ★</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Visible">Visible</option>
          <option value="Hidden">Hidden</option>
          <option value="Flagged">Flagged</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          <option value="Newest">Newest</option>
          <option value="Highest Rating">Highest Rating</option>
          <option value="Lowest Rating">Lowest Rating</option>
        </select>
      </div>

      {/* Review List */}

      {loading ? (
        <div className="admin-empty-state">
          <p>Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="admin-empty-state">
          <p>No reviews found.</p>
        </div>
      ) : (
        <div className="merchant-list">
          {reviews.map((review) => {
            const reviewId = review._id || review.id;

            return (
              <ReviewCard
                key={reviewId}
                review={review}
                onView={() => handleView(review)}
                onHide={() => handleStatus(review)}
                onDelete={() => handleDelete(review)}
                actionLoading={actionLoadingId === reviewId}
              />
            );
          })}
        </div>
      )}

      {/* Pagination */}

      {!loading && pagination.pages > 1 && (
        <div className="merchant-pagination">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </button>

          <span>
            Page {pagination.page} of {pagination.pages}
          </span>

          <button
            type="button"
            disabled={pagination.page >= pagination.pages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Review Modal */}

      {selectedReview && (
        <ReviewModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </div>
  );
}

export default Reviews;
