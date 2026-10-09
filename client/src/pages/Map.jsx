import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import apiRequest from "../services/api.js";

const LOCATIONS = ["Matigara", "Medical", "Shivamandir"];

const LOCATION_CENTERS = {
  Matigara: [26.7267, 88.3953],
  Medical: [26.7037, 88.4306],
  Shivamandir: [26.7445, 88.3729],
};

const DEFAULT_CENTER = [26.7267, 88.3953];

function getCoordinates(location) {
  if (!location) {
    return null;
  }

  if (typeof location.lat === "number" && typeof location.lng === "number") {
    return [location.lat, location.lng];
  }

  if (
    typeof location.latitude === "number" &&
    typeof location.longitude === "number"
  ) {
    return [location.latitude, location.longitude];
  }

  if (Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
    const [lng, lat] = location.coordinates;

    if (typeof lat === "number" && typeof lng === "number") {
      return [lat, lng];
    }
  }

  if (
    location.coordinates &&
    typeof location.coordinates.lat === "number" &&
    typeof location.coordinates.lng === "number"
  ) {
    return [location.coordinates.lat, location.coordinates.lng];
  }

  return null;
}

function MapViewUpdater({ center, businesses }) {
  const map = useMap();

  useEffect(() => {
    if (!center) {
      return;
    }

    if (businesses.length === 0) {
      map.setView(center, 13);
      return;
    }

    if (businesses.length === 1) {
      map.setView(businesses[0].coordinates, 15);
      return;
    }

    const bounds = businesses.map((business) => business.coordinates);

    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 15,
    });
  }, [map, center, businesses]);

  return null;
}

export default function MapPage() {
  const [businesses, setBusinesses] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("Matigara");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/businesses");

      setBusinesses(data?.businesses || []);
    } catch (err) {
      console.error("Failed to load businesses:", err);

      setError(err?.message || "Unable to load businesses right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((business) => {
      if (!business.isActive) {
        return false;
      }

      if (business.approvalStatus !== "approved") {
        return false;
      }

      return (
        String(business.area || "").toLowerCase() ===
        selectedLocation.toLowerCase()
      );
    });
  }, [businesses, selectedLocation]);

  const businessesWithCoordinates = useMemo(() => {
    return filteredBusinesses
      .map((business) => ({
        business,
        coordinates: getCoordinates(business.location),
      }))
      .filter((item) => item.coordinates);
  }, [filteredBusinesses]);

  const mapCenter = LOCATION_CENTERS[selectedLocation] || DEFAULT_CENTER;

  return (
    <div className="min-h-screen bg-[#F7F6FA]">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-6 sm:py-12">
        {/* Header */}

        <div className="mb-7">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
            Nearby Businesses
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Discover approved businesses around your selected area.
          </p>
        </div>

        {/* Location selector */}

        <div className="mb-6 flex flex-wrap gap-2">
          {LOCATIONS.map((location) => {
            const isActive = selectedLocation === location;

            return (
              <button
                key={location}
                type="button"
                onClick={() => setSelectedLocation(location)}
                className={`
                  rounded-full
                  border
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  transition
                  ${
                    isActive
                      ? "border-purple-700 bg-purple-700 text-white"
                      : "border-[#E5E0EE] bg-white text-slate-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
                  }
                `}
              >
                📍 {location}
              </button>
            );
          })}
        </div>

        {/* Result count */}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-500">
            {loading
              ? "Loading businesses..."
              : `${filteredBusinesses.length} ${
                  filteredBusinesses.length === 1 ? "business" : "businesses"
                } in ${selectedLocation}`}
          </p>

          {!loading &&
            businessesWithCoordinates.length < filteredBusinesses.length && (
              <p className="text-xs text-slate-400">
                Some businesses don&apos;t have map coordinates yet.
              </p>
            )}
        </div>

        {/* Map */}

        <section className="relative overflow-hidden rounded-3xl border border-[#EFEDF5] bg-white shadow-sm">
          <div className="h-[500px] w-full sm:h-[600px]">
            <MapContainer
              center={mapCenter}
              zoom={13}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapViewUpdater
                center={mapCenter}
                businesses={businessesWithCoordinates}
              />

              {businessesWithCoordinates.map(({ business, coordinates }) => {
                const category =
                  typeof business.categoryRef === "object"
                    ? business.categoryRef?.name
                    : business.category;

                return (
                  <CircleMarker
                    key={business._id}
                    center={coordinates}
                    radius={9}
                    pathOptions={{
                      color: "#8d2144",
                      fillColor: "#8d2144",
                      fillOpacity: 0.9,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div className="min-w-[190px]">
                        <h3 className="text-sm font-bold text-slate-800">
                          {business.name}
                        </h3>

                        {category && (
                          <p className="mt-1 text-xs text-slate-500">
                            {category}
                          </p>
                        )}

                        {business.area && (
                          <p className="mt-1 text-xs text-slate-500">
                            📍 {business.area}
                          </p>
                        )}

                        <Link
                          to={`/businesses/${business._id}`}
                          className="mt-3 inline-flex text-xs font-bold text-purple-700 hover:text-purple-600"
                        >
                          View business →
                        </Link>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          {/* Empty state */}

          {!loading && filteredBusinesses.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
              <div className="pointer-events-auto max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-2xl">
                  📍
                </div>

                <h2 className="mt-4 text-lg font-bold text-slate-800">
                  No businesses found
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  We don&apos;t have any approved businesses listed in{" "}
                  {selectedLocation} yet.
                </p>

                <Link
                  to="/listings"
                  className="mt-4 inline-flex rounded-full bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-600"
                >
                  Browse Listings
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* API error */}

        {error && (
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-700">{error}</p>

            <button
              type="button"
              onClick={loadBusinesses}
              className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        )}

        {/* No coordinates */}

        {!loading &&
          filteredBusinesses.length > 0 &&
          businessesWithCoordinates.length === 0 &&
          !error && (
            <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <h2 className="text-sm font-bold text-amber-900">
                Map locations aren&apos;t available yet
              </h2>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                The businesses in {selectedLocation} don&apos;t currently have usable
                map coordinates. They can still be discovered from the listings
                page.
              </p>

              <Link
                to="/listings"
                className="mt-4 inline-flex rounded-full bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-600"
              >
                Browse Listings →
              </Link>
            </div>
          )}

        {/* Quick discovery */}

        <section className="mt-6 rounded-2xl border border-[#EFEDF5] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Looking for a specific business?
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Browse all available businesses and filter them by category,
                rating, or offers.
              </p>
            </div>

            <Link
              to="/listings"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-purple-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-600"
            >
              Browse Listings →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
