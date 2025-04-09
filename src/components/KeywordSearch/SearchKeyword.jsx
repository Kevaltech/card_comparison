import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronLeft, X, ArrowRight, Home } from "lucide-react";
import axios from "axios";
import { formatDate } from "../../utils/formateDate";
import { Link, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [allResults, setAllResults] = useState(null);
  const [displayedResults, setDisplayedResults] = useState([]);
  const [groupedResults, setGroupedResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const containerRef = useRef(null);

  // Load persisted search results on mount and check for query params.
  useEffect(() => {
    const stored = sessionStorage.getItem("searchResults");
    if (stored) {
      const parsedData = JSON.parse(stored);
      setAllResults(parsedData);
      filterResults(parsedData.results, selectedBanks);
    }
    const selectedCardParam = searchParams.get("selectedCard");
    const keywordParam = searchParams.get("keyword");
    if (keywordParam) {
      setKeyword(keywordParam);
    }
    if (selectedCardParam && stored) {
      const { results } = JSON.parse(stored);
      const matchingCard = results.find(
        (card) => `${card.cardId}_${card.version}` === selectedCardParam
      );
      if (matchingCard) {
        setSelectedCard(matchingCard);
      }
    }
  }, []);

  // Global click to close custom context menu
  useEffect(() => {
    const handleClick = () => {
      if (contextMenu) setContextMenu(null);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [contextMenu]);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError("Please enter a search keyword.");
      return;
    }
    setLoading(true);
    setError("");
    setAllResults(null);
    setGroupedResults({});
    setSelectedCard(null);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SEARCH_KEYWORDS_URL}=${encodeURIComponent(
          keyword
        )}`,
        { headers: { "ngrok-skip-browser-warning": "234242" } }
      );
      setAllResults(response.data);
      sessionStorage.setItem("searchResults", JSON.stringify(response.data));
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

    // Group results by card name and bank.
    const grouped = filtered.reduce((acc, card) => {
      const key = `${card.cardName}-${card.bank_name}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(card);
      return acc;
    }, {});
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
      setSelectedBanks([]);
      filterResults(allResults?.results, []);
    } else {
      setSelectedBanks([...BANKS]);
      filterResults(allResults?.results, [...BANKS]);
    }
  };

  const handleOnlySelectBank = (bank) => {
    setSelectedBanks([bank]);
    filterResults(allResults?.results, [bank]);
  };

  // Left-click: show card details in same tab.
  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  // Right-click: show custom context menu.
  const handleContextMenu = (e, card) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, card });
  };

  // Open card details in new tab using URL with query parameters.
  const openCardInNewTab = (card) => {
    const cardIdentifier = `${card.cardId}_${card.version}`;
    const detailsUrl = `${
      window.location.origin
    }/searchKeyword?selectedCard=${cardIdentifier}&keyword=${encodeURIComponent(
      keyword
    )}`;
    window.open(detailsUrl, "_blank");
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

  const totalGroupedCardsCount = calculateTotalGroupedCards(
    allResults?.results
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Search Bar */}
      <div className="flex-none bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </Link>
            <div className="flex-1 relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search in card comparisons..."
                className="w-full pl-10 pr-4 py-2 h-11 border-none bg-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
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
              className="h-11 px-6 min-w-[120px] bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 font-medium transition-all flex items-center justify-center"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-center text-red-600 text-sm">{error}</p>
          )}
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    selectedBanks.length === BANKS.length
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  }`}
                >
                  <span className="sr-only">Toggle switch</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ease-in-out ${
                      selectedBanks.length === BANKS.length
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
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
                    <div key={bank} className="group relative">
                      <div className="flex items-center py-1 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <label className="flex items-center space-x-2 cursor-pointer flex-1">
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
                            <span className="text-gray-400 text-xs">
                              ({count})
                            </span>
                          </span>
                        </label>

                        {/* Google Flights-style "Only" button */}
                        <button
                          onClick={() => handleOnlySelectBank(bank)}
                          className={`
                            opacity-0 group-hover:opacity-100 transition-opacity
                            text-xs text-blue-500 px-2 py-1 rounded
                            ${
                              selectedBanks.length === 1 &&
                              selectedBanks[0] === bank
                                ? "bg-blue-50 font-medium"
                                : "hover:bg-gray-100"
                            }
                        `}
                          title="Select only this bank"
                        >
                          Only
                        </button>
                      </div>
                    </div>
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
          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto pr-28 relative"
          >
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
                    const latestCard = versions[versions.length - 1];
                    return (
                      <div
                        key={cardKey}
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-3 border border-gray-50 group"
                        onContextMenu={(e) => handleContextMenu(e, latestCard)}
                      >
                        <div className="flex justify-between items-center">
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => handleCardClick(latestCard)}
                          >
                            <div className="flex items-center">
                              <div className="flex-1">
                                <h2 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {firstCard.cardName} ({firstCard.cardId})
                                </h2>
                                <p className="text-xs text-gray-500">
                                  {firstCard.bank_name} • {versions.length}{" "}
                                  version
                                  {versions.length > 1 ? "s" : ""}
                                </p>
                              </div>
                              <span className="text-xs text-gray-400 mr-2 whitespace-nowrap">
                                Updated {formatDate(latestCard.last_updated)}
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
                                onClick={() => handleCardClick(latestCard)}
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
            {contextMenu && (
              <div
                style={{
                  position: "fixed",
                  top: contextMenu.y,
                  left: contextMenu.x,
                  zIndex: 1000,
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
                }}
              >
                <div
                  onClick={() => openCardInNewTab(contextMenu.card)}
                  style={{ padding: "8px 12px", cursor: "pointer" }}
                >
                  Open in New Tab
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchKeyword;
