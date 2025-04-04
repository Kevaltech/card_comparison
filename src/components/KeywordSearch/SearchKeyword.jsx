import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronLeft, X, ArrowRight, Check } from "lucide-react";
import axios from "axios";
import { formatDate } from "../../utils/formateDate";
import { Link } from "react-router-dom";
import KeywordCardContent from "./KeywordCardContent";

const BANKS = [
  "Amex",
  "AU",
  "Axis",
  "Federal",
  "HDFC",
  "HSBC",
  "ICICI",
  "IDFC",
  "IndusInd",
  "RBL",
  "SBI",
  "SCB",
  "Yes",
];

function SearchKeyword() {
  const [keyword, setKeyword] = useState("");
  const [allResults, setAllResults] = useState(null);
  const [displayedResults, setDisplayedResults] = useState([]);
  const [groupedResults, setGroupedResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const containerRef = useRef(null);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError("Please enter a search keyword.");
      return;
    }

    setLoading(true);
    setError("");
    setAllResults(null);
    setGroupedResults({});

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SEARCH_KEYWORDS_URL}=${encodeURIComponent(
          keyword
        )}`,
        {
          headers: { "ngrok-skip-browser-warning": "234242" },
        }
      );

      setAllResults(response.data);
      filterResults(response.data.results, selectedBanks);
    } catch (err) {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterResults = (results, banks) => {
    if (!results) return;

    const filtered =
      banks.length > 0
        ? results.filter((card) =>
            banks.some(
              (bank) =>
                bank.trim().toLowerCase() ===
                card.bank_name.trim().toLowerCase()
            )
          )
        : results;

    setDisplayedResults(filtered);

    // Group results by card name
    const grouped = filtered.reduce((acc, card) => {
      // Create a key combining card name and bank name to avoid conflicts
      const key = `${card.cardName}-${card.bank_name}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(card);
      return acc;
    }, {});

    // Sort versions within each group
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => a.version - b.version);
    });

    setGroupedResults(grouped);
  };

  const handleBankFilter = (bank) => {
    const newSelection = selectedBanks.includes(bank)
      ? selectedBanks.filter((b) => b !== bank)
      : [...selectedBanks, bank];

    setSelectedBanks(newSelection);
    filterResults(allResults?.results, newSelection);
  };

  const handleToggleAllBanks = () => {
    if (selectedBanks.length === BANKS.length) {
      // Clear all selections
      setSelectedBanks([]);
      filterResults(allResults?.results, []);
    } else {
      // Select all banks
      setSelectedBanks([...BANKS]);
      filterResults(allResults?.results, [...BANKS]);
    }
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleBack = () => {
    setSelectedCard(null);
  };

  const handleClearSearch = () => {
    setKeyword("");
  };

  const calculateTotalGroupedCards = (results) => {
    const uniqueCards = new Set();
    results?.forEach((card) => {
      const key = `${card.cardName}-${card.bank_name}`;
      uniqueCards.add(key);
    });
    return uniqueCards.size;
  };

  // After fetching results
  const totalGroupedCardsCount = calculateTotalGroupedCards(
    allResults?.results
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Search Bar */}
      <div className="flex-none bg-white shadow-sm pl-32">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search in card comparisons..."
                className="w-full px-4 py-2 pl-10 h-11 border-none bg-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              {keyword && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="h-11 px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 font-medium transition-all flex items-center"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
          {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Left Filters Panel */}
          <div className="w-60 bg-white border-r border-gray-100 overflow-y-auto transition-all duration-300 lg:translate-x-0 pt-4">
            <div className="px-4 pl-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium uppercase tracking-wide text-gray-500">
                  Filter by Bank
                </h3>

                <button
                  onClick={handleToggleAllBanks}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full
                    transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                    ${
                      selectedBanks.length === BANKS.length
                        ? "bg-indigo-600"
                        : "bg-gray-200"
                    }
                  `}
                >
                  <span className="sr-only">Toggle switch</span>
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ease-in-out
                      ${
                        selectedBanks.length === BANKS.length
                          ? "translate-x-6"
                          : "translate-x-1"
                      }
                    `}
                  />
                </button>
              </div>

              <div className="space-y-1 overflow-y-auto pr-2">
                {BANKS.map((bank) => {
                  const count = allResults?.results
                    ? new Set(
                        allResults.results
                          .filter(
                            (card) =>
                              card.bank_name.trim().toLowerCase() ===
                              bank.trim().toLowerCase()
                          )
                          .map((card) => `${card.cardName}-${card.bank_name}`)
                      ).size
                    : 0;
                  return (
                    <label
                      key={bank}
                      className="flex items-center space-x-2 py-1 px-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBanks.includes(bank)}
                        onChange={() => handleBankFilter(bank)}
                        className="rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                      />
                      <span
                        className={`text-sm ${
                          selectedBanks.includes(bank)
                            ? "text-blue-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {bank}{" "}
                        <span className="text-gray-400 text-xs">({count})</span>
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-6 mb-2 pt-4 border-t border-gray-100">
                <h2 className="text-sm font-medium text-gray-500">
                  {totalGroupedCardsCount} cards found
                </h2>
                {selectedBanks.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Filtering: {selectedBanks.length} bank
                    {selectedBanks.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Results / Card Details */}
          <div ref={containerRef} className="flex-1 overflow-y-auto pr-28">
            <div className="max-w-5xl mx-auto px-6 py-6">
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-pulse space-y-4 w-full max-w-md">
                    <div className="h-8 bg-gray-200 rounded-md w-1/3"></div>
                    <div className="h-28 bg-gray-200 rounded-lg w-full"></div>
                    <div className="h-28 bg-gray-200 rounded-lg w-full"></div>
                  </div>
                </div>
              ) : selectedCard ? (
                <>
                  <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-2 w-52">
                    <button
                      onClick={handleBack}
                      className="flex items-center text-blue-600 hover:text-blue-800 mb-1 font-medium text-sm"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back to results
                    </button>
                  </div>
                  <KeywordCardContent
                    cardData2={selectedCard}
                    keyword={keyword}
                  />
                </>
              ) : Object.keys(groupedResults).length > 0 ? (
                <div className="space-y-3">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    {Object.keys(groupedResults).length} cards found for "
                    {keyword}"
                  </h2>
                  {Object.entries(groupedResults).map(([cardKey, versions]) => {
                    const firstCard = versions[0];
                    return (
                      <div
                        key={cardKey}
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-3 border border-gray-50 group"
                      >
                        <div className="flex justify-between items-center">
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() =>
                              handleCardClick(versions[versions.length - 1])
                            }
                          >
                            <div className="flex items-center">
                              <div className="flex-1">
                                <h2 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {firstCard.cardName} ({firstCard.cardId})
                                </h2>
                                <p className="text-xs text-gray-500">
                                  {firstCard.bank_name} • {versions.length}{" "}
                                  version{versions.length > 1 ? "s" : ""}
                                </p>
                              </div>
                              <span className="text-xs text-gray-400 mr-2 whitespace-nowrap">
                                Updated{" "}
                                {formatDate(
                                  versions[versions.length - 1].last_updated
                                )}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {versions.map((card) => (
                                <button
                                  key={`${card.cardId}-${card.version}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCardClick(card);
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-50 text-gray-600 border border-gray-100 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors"
                                >
                                  v{card.version}
                                </button>
                              ))}

                              <button
                                onClick={() =>
                                  handleCardClick(versions[versions.length - 1])
                                }
                                className="ml-auto flex items-center text-xs text-blue-500 hover:text-blue-700 font-medium"
                              >
                                View latest
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="text-center max-w-sm">
                    <Search className="w-10 h-10 text-gray-300 mb-3 mx-auto" />
                    <p className="text-gray-600 mb-1 text-lg">
                      {allResults
                        ? allResults.count === 0
                          ? "No matches found"
                          : "Ready to search"
                        : "Enter a keyword to search"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {allResults && allResults.count === 0
                        ? "Try using different keywords or removing filters"
                        : "Search for card comparisons by keyword"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchKeyword;
