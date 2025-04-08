import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Loader2,
  Building2,
  Calendar,
  User,
  Star,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Filter,
  X,
  Search,
} from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";

export const Home = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchKeywordRedirect = () => {
    navigate("/searchKeyword");
  };
  const isActive = (path) => {
    return location.pathname === path;
  };

  // New state for filters
  const [filters, setFilters] = useState({
    card_details: { isOpen: false, selectedItems: [], searchTerm: "" },
    bank_name: { isOpen: false, selectedItems: [], searchTerm: "" },
    last_update: { isOpen: false, selectedItems: [], searchTerm: "" },
  });

  // Refs for dropdown containers
  const dropdownRefs = {
    card_details: useRef(null),
    bank_name: useRef(null),
    last_update: useRef(null),
  };

  // const navigate = useNavigate();

  const handleSearchRedirect = (cardId) => {
    navigate(`/compare/${cardId}`);
  };

  const clearSearch = (columnKey) => {
    setFilters((prev) => ({
      ...prev,
      [columnKey]: {
        ...prev[columnKey],
        searchTerm: "",
      },
    }));
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(dropdownRefs).forEach((key) => {
        if (
          dropdownRefs[key].current &&
          !dropdownRefs[key].current.contains(event.target)
        ) {
          setFilters((prev) => ({
            ...prev,
            [key]: {
              ...prev[key],
              isOpen: false,
            },
          }));
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
    document.body.style.position = "static";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.position = "";
    };
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_DASHBOARD_URL}`,
        {
          headers: { "ngrok-skip-browser-warning": "234242" },
        }
      );
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Toggle filter dropdown
  const toggleFilterDropdown = (columnKey) => {
    setFilters((prev) => ({
      ...prev,
      [columnKey]: {
        ...prev[columnKey],
        isOpen: !prev[columnKey].isOpen,
      },
    }));
  };

  // Handle search within filter
  const handleFilterSearch = (columnKey, searchTerm) => {
    setFilters((prev) => ({
      ...prev,
      [columnKey]: {
        ...prev[columnKey],
        searchTerm,
      },
    }));
  };

  // Handle checkbox selection in filter
  const handleFilterSelect = (columnKey, item) => {
    setFilters((prev) => {
      const currentSelectedItems = prev[columnKey].selectedItems;
      const newSelectedItems = currentSelectedItems.includes(item)
        ? currentSelectedItems.filter((i) => i !== item)
        : [...currentSelectedItems, item];

      return {
        ...prev,
        [columnKey]: {
          ...prev[columnKey],
          selectedItems: newSelectedItems,
        },
      };
    });
  };

  // Reset filters for a specific column
  const resetColumnFilter = (columnKey) => {
    setFilters((prev) => ({
      ...prev,
      [columnKey]: {
        ...prev[columnKey],
        selectedItems: [],
        searchTerm: "",
      },
    }));
  };

  const getSortedCards = () => {
    if (!stats || !stats.openCardsList) return [];

    let sortedCards = [...stats.openCardsList];

    // Apply sorting
    if (sortConfig.key !== null) {
      sortedCards.sort((a, b) => {
        let aValue = a[sortConfig.key] || "";
        let bValue = b[sortConfig.key] || "";

        if (sortConfig.key === "last_update") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    // Apply filtering
    sortedCards = sortedCards.filter((card) => {
      // Combine card name and ID for searching
      const cardDetails = `${card.card_name} #${card.CardId}`.toLowerCase();

      // Check card details filter
      const cardDetailsFilter =
        filters.card_details.selectedItems.length === 0 ||
        filters.card_details.selectedItems.some((item) =>
          cardDetails.includes(item.toLowerCase())
        );

      // Check bank name filter
      const bankNameFilter =
        filters.bank_name.selectedItems.length === 0 ||
        filters.bank_name.selectedItems.includes(card.bank_name);

      // Check last update filter (converting to date for comparison)
      const lastUpdateFilter =
        filters.last_update.selectedItems.length === 0 ||
        filters.last_update.selectedItems.includes(
          new Date(card.last_update).toLocaleDateString()
        );

      return cardDetailsFilter && bankNameFilter && lastUpdateFilter;
    });

    return sortedCards;
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return (
        <ArrowUpDown className="w-4 h-4 ml-1 inline-block text-gray-400" />
      );
    }
    return sortConfig.direction === "ascending" ? (
      <ArrowUp className="w-4 h-4 ml-1 inline-block text-blue-500" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1 inline-block text-blue-500" />
    );
  };

  // Function to get unique values for filtering
  const getUniqueFilterValues = (key) => {
    if (!stats || !stats.openCardsList) return [];

    let values = stats.openCardsList.map((card) => {
      if (key === "last_update") {
        return new Date(card[key]).toLocaleDateString(); // Keep last_update as is
      } else if (key === "card_details") {
        return `${card.card_name} #${card.CardId}`;
      }
      return card[key];
    });

    // Remove duplicates
    let uniqueValues = [...new Set(values)];

    // Sort only for card_details and bank_name
    if (key === "card_details" || key === "bank_name") {
      uniqueValues.sort((a, b) => a.localeCompare(b));
    }

    return uniqueValues;
  };

  // Render filter dropdown
  const renderFilterDropdown = (columnKey) => {
    const { isOpen, selectedItems, searchTerm } = filters[columnKey];
    const uniqueValues = getUniqueFilterValues(columnKey);

    if (!isOpen) return null;

    return (
      <div
        ref={dropdownRefs[columnKey]}
        className="absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
      >
        <div className="p-2">
          <div className="relative mb-2">
            <input
              type="text"
              placeholder={`Search ${columnKey}...`}
              className="w-full px-2 py-1 border rounded pr-7"
              value={searchTerm}
              onChange={(e) => handleFilterSearch(columnKey, e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilterSearch(columnKey, "");
                }}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="max-h-48 overflow-y-auto">
            {uniqueValues
              .filter((value) =>
                value
                  .toString()
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              )
              .map((value) => (
                <label
                  key={value}
                  className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={selectedItems.includes(value)}
                    onChange={() => handleFilterSelect(columnKey, value)}
                  />
                  {value}
                </label>
              ))}
          </div>
          <div className="flex justify-between mt-2">
            <button
              onClick={() => resetColumnFilter(columnKey)}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              Reset
            </button>
            <button
              onClick={() => toggleFilterDropdown(columnKey)}
              className="text-sm text-gray-500 hover:text-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <AlertCircle className="w-6 h-6 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen overflow-auto">
      <div className="flex items-start gap-4 justify-between">
        <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
        <div className="w-1/8 flex justify-end ">
          {/* <button
            onClick={handleSearchKeywordRedirect}
            type="button"
            className={`flex items-center gap-2 text-white ${
              isActive("/searchKeyword")
                ? "bg-blue-800 dark:bg-blue-700"
                : "bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
            } focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:focus:ring-blue-800`}
          >
            <Search className="w-4 h-4" />
          
          </button> */}
          <Link
            to={"/searchKeyword"}
            target="_blank"
            //  onClick={handleSearchRedirect}
            type="button"
            className={`flex items-center gap-2 text-white ${
              isActive("/searchKeyword")
                ? "bg-blue-800 dark:bg-blue-700"
                : "bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
            } focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:focus:ring-blue-800`}
          >
            <Search className="w-4 h-4" />
          </Link>
        </div>
      </div>{" "}
      {/* Main Cards Stats */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="bg-white rounded-lg shadow hover:shadow-lg p-3 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
                <h3 className="text-sm font-medium text-gray-500">Total</h3>
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-bold">
                  {stats.mainCards.total}
                </span>
                {/* <span className="ml-1 text-xs text-gray-500">cards</span> */}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow hover:shadow-lg p-3 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                <h3 className="text-sm font-medium text-gray-500">Open</h3>
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-bold">
                  {stats.mainCards.open}
                </span>
                {/* <span className="ml-1 text-xs text-gray-500">pending</span> */}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow hover:shadow-lg p-3 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                <h3 className="text-sm font-medium text-gray-500">Closed</h3>
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-bold">
                  {stats.mainCards.resolved}
                </span>
                {/* <span className="ml-1 text-xs text-gray-500">completed</span> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* General Links */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">General Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="bg-white rounded-lg shadow hover:shadow-lg p-3 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
                <h3 className="text-sm font-medium text-gray-500">Total</h3>
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-bold">
                  {stats.generalCards.total}
                </span>
                {/* <span className="ml-1 text-xs text-gray-500">cards</span> */}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow hover:shadow-lg p-3 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                <h3 className="text-sm font-medium text-gray-500">Open</h3>
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-bold">
                  {stats.generalCards.open}
                </span>
                {/* <span className="ml-1 text-xs text-gray-500">pending</span> */}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow hover:shadow-lg p-3 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                <h3 className="text-sm font-medium text-gray-500">Closed</h3>
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-bold">
                  {stats.generalCards.resolved}
                </span>
                {/* <span className="ml-1 text-xs text-gray-500">completed</span> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Open Cards List */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Open Cards</h2>
        <div
          className="overflow-x-auto"
          style={{
            minHeight: "600px", // Initial minimum height
            height: "auto", // Grow with content
            maxHeight: "80vh", // Prevent excessive height
          }}
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 bg-gray-50 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Id
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative">
                  <div className="flex items-center">
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => requestSort("card_name")}
                    >
                      Card Details {getSortIcon("card_name")}
                    </div>
                    <button
                      onClick={() => toggleFilterDropdown("card_details")}
                      className="pl-2"
                    >
                      <Filter
                        className={`w-4 h-4 ${
                          filters.card_details.selectedItems.length > 0
                            ? "text-blue-500"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                    <div className="flex gap-2 pl-1">
                      {filters.card_details.selectedItems.length > 0 && (
                        <button
                          onClick={() => resetColumnFilter("card_details")}
                          className="text-gray-400 hover:text-gray-600"
                          title="Clear selection"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  {renderFilterDropdown("card_details")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative">
                  <div className="flex items-center">
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => requestSort("bank_name")}
                    >
                      Bank {getSortIcon("bank_name")}
                    </div>
                    <button
                      onClick={() => toggleFilterDropdown("bank_name")}
                      className="pl-2"
                    >
                      <Filter
                        className={`w-4 h-4 ${
                          filters.bank_name.selectedItems.length > 0
                            ? "text-blue-500"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                    <div className="flex gap-2 pl-1">
                      {filters.bank_name.selectedItems.length > 0 && (
                        <button
                          onClick={() => resetColumnFilter("bank_name")}
                          className="text-gray-400 hover:text-gray-600"
                          title="Clear selection"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  {renderFilterDropdown("bank_name")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative">
                  <div className="flex items-center">
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => requestSort("last_update")}
                    >
                      Last Updated {getSortIcon("last_update")}
                    </div>
                    <button
                      onClick={() => toggleFilterDropdown("last_update")}
                      className="pl-2"
                    >
                      <Filter
                        className={`w-4 h-4 ${
                          filters.last_update.selectedItems.length > 0
                            ? "text-blue-500"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                    <div className="flex gap-2 pl-1">
                      {filters.last_update.selectedItems.length > 0 && (
                        <button
                          onClick={() => resetColumnFilter("last_update")}
                          className="text-gray-400 hover:text-gray-600"
                          title="Clear selection"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  {renderFilterDropdown("last_update")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getSortedCards().map((card, index) => (
                <tr
                  key={card.CardId}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSearchRedirect(card.CardId)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {card.card_name} #{card.CardId}
                          {card.is_general && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <Star className="w-3 h-3 mr-1" />
                              General
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {card.bank_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">
                        {new Date(card.last_update).toLocaleDateString()} at{" "}
                        {new Date(card.last_update).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleSearchRedirect(card.CardId)}
                      className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
                    >
                      <span className="text-sm">View Details</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
