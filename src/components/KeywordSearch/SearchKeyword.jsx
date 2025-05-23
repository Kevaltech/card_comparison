import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronLeft, X, ArrowRight, Home } from "lucide-react";
import axios from "axios";
import { formatDate } from "../../utils/formateDate";
import {
  Link,
  useSearchParams,
  useParams,
  useNavigate,
} from "react-router-dom";
import KeywordCardContent from "./KeywordCardContent";

// Define banks with multiple aliases and a display label
const BANKS = [
  {
    key: "amex",
    label: "Amex",
    aliases: ["Amex", "American Express"],
  },
  { key: "axis", label: "Axis", aliases: ["Axis", "Axis Bank"] },
  {
    key: "au",
    label: "AU",
    aliases: ["AU", "AU Small Finance Bank"],
  },
  {
    key: "federal",
    label: "Federal",
    aliases: ["Federal Bank", "Federal"],
  },
  { key: "hdfc", label: "HDFC", aliases: ["HDFC Bank", "HDFC"] },
  { key: "hsbc", label: "HSBC", aliases: ["HSBC", "HSBC Bank"] },
  { key: "icici", label: "ICICI", aliases: ["ICICI Bank", "ICICI"] },
  // { key: "idbi", label: "IDBI", aliases: ["IDBI", "IDBI Bank"] },
  { key: "idfc", label: "IDFC", aliases: ["IDFC First", "IDFC"] },
  {
    key: "indusind",
    label: "IndusInd",
    aliases: ["IndusInd", "IndusInd Bank"],
  },
  {
    key: "kotak",
    label: "Kotak",
    aliases: ["Kotak", "Kotak Mahindra Bank"],
  },
  { key: "rbl", label: "RBL", aliases: ["RBL Bank", "Ratnakar Bank"] },
  {
    key: "sbi",
    label: "SBI",
    aliases: ["SBI", "State Bank of India"],
  },
  {
    key: "scb",
    label: "SCB",
    aliases: ["Std. Chartered", "Standard Chartered", "SCB"],
  },
  { key: "yes", label: "Yes", aliases: ["Yes Bank", "Yes"] },
];

// Cache expiry time set to 5 minutes.
const CACHE_EXPIRY = 12 * 60 * 60 * 1000;

function SearchKeyword() {
  const { cardId, version } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Separate states
  const [inputValue, setInputValue] = useState("");
  const [committedKeyword, setCommittedKeyword] = useState("");
  const [allResults, setAllResults] = useState(null);
  const [displayedResults, setDisplayedResults] = useState([]);
  const [groupedResults, setGroupedResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [autoSearched, setAutoSearched] = useState(false);
  const containerRef = useRef(null);

  const makeStorageKey = (base, keyword) => `${base}-${keyword.toLowerCase()}`;

  const getCachedResults = (keyword) => {
    const cacheKey = makeStorageKey("searchResults", keyword);
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const cachedObj = JSON.parse(cached);
        if (Date.now() - cachedObj.timestamp < CACHE_EXPIRY) {
          return cachedObj.data;
        }
      } catch (e) {
        console.error("Error parsing cached data:", e);
      }
    }
    return null;
  };

  const setCachedResults = (keyword, data) => {
    const cacheKey = makeStorageKey("searchResults", keyword);
    const cacheObj = { data, timestamp: Date.now() };
    localStorage.setItem(cacheKey, JSON.stringify(cacheObj));
  };

  // Initial load effect
  useEffect(() => {
    const urlKeyword = searchParams.get("keyword");
    if (urlKeyword) {
      setInputValue(urlKeyword);
      setCommittedKeyword(urlKeyword);
      const cached = getCachedResults(urlKeyword);
      if (cached) {
        setAllResults(cached);
        filterResults(cached.results, selectedBanks);
        if (cardId && version) {
          const match = cached.results.find(
            (c) => c.cardId === cardId && c.version.toString() === version
          );
          if (match) setSelectedCard(match);
        }
      }
    } else {
      setInputValue("");
      setCommittedKeyword("");
      setAllResults(null);
      setGroupedResults({});
    }
  }, [cardId, version, searchParams]);

  // Handle search trigger from URL hash
  useEffect(() => {
    const urlKeyword = searchParams.get("keyword");
    if (
      urlKeyword &&
      window.location.hash === "#search" &&
      inputValue.trim() &&
      !autoSearched
    ) {
      handleSearch();
      setAutoSearched(true);
    }
  }, [searchParams, inputValue, autoSearched]);

  const handleSearch = async () => {
    if (!inputValue.trim()) {
      setError("Please enter a search keyword.");
      return;
    }
    setLoading(true);
    setError("");
    setAllResults(null);
    setGroupedResults({});
    setSelectedCard(null);

    setCommittedKeyword(inputValue);
    setSearchParams({ keyword: inputValue });

    const cached = getCachedResults(inputValue);
    if (cached) {
      setAllResults(cached);
      filterResults(cached.results, selectedBanks);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SEARCH_KEYWORDS_URL}=${encodeURIComponent(
          inputValue
        )}`,
        { headers: { "ngrok-skip-browser-warning": "234242" } }
      );
      setAllResults(response.data);
      setCachedResults(inputValue, response.data);
      filterResults(response.data.results, selectedBanks);
    } catch (err) {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced filter: accept banks array of keys
  const filterResults = (results, bankKeys) => {
    if (!results) return;
    const filtered = bankKeys.length
      ? results.filter((card) =>
          bankKeys.some((key) => {
            const bank = BANKS.find((b) => b.key === key);
            return bank.aliases
              .map((a) => a.toLowerCase())
              .includes(card.bank_name.trim().toLowerCase());
          })
        )
      : results;
    setDisplayedResults(filtered);

    const grouped = filtered.reduce((acc, card) => {
      const groupKey = `${card.cardName}-${card.bank_name}`;
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(card);
      return acc;
    }, {});
    Object.values(grouped).forEach((arr) =>
      arr.sort((a, b) => a.version - b.version)
    );
    setGroupedResults(grouped);
  };

  const handleBankFilter = (key) => {
    const next = selectedBanks.includes(key)
      ? selectedBanks.filter((k) => k !== key)
      : [...selectedBanks, key];
    setSelectedBanks(next);
    filterResults(allResults?.results, next);
  };

  const handleToggleAllBanks = () => {
    if (selectedBanks.length === BANKS.length) {
      setSelectedBanks([]);
      filterResults(allResults?.results, []);
    } else {
      const allKeys = BANKS.map((b) => b.key);
      setSelectedBanks(allKeys);
      filterResults(allResults?.results, allKeys);
    }
  };

  const handleOnlySelectBank = (key) => {
    setSelectedBanks([key]);
    filterResults(allResults?.results, [key]);
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const calculateTotalGroupedCards = (results) => {
    if (!results) return 0;
    const unique = new Set(results.map((c) => `${c.cardName}-${c.bank_name}`));
    return unique.size;
  };

  const totalGrouped = calculateTotalGroupedCards(allResults?.results);

  const sortedResults = useMemo(() => {
    return Object.entries(groupedResults)
      .map(([key, cards]) => {
        const first = cards[0];
        return {
          key,
          cards,
          bank_name: first.bank_name,
          cardName: first.cardName,
        };
      })
      .sort((a, b) => {
        const cmp = a.bank_name.localeCompare(b.bank_name);
        return cmp === 0 ? a.cardName.localeCompare(b.cardName) : cmp;
      });
  }, [groupedResults]);

  const handleBack = () => {
    setSelectedCard(null);
    navigate(`/searchKeyword?keyword=${encodeURIComponent(committedKeyword)}`);
  };

  const handleClearSearch = () => setInputValue("");

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Search Bar */}
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
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search within cards..."
                className="w-full pl-10 pr-4 py-2 h-11 border-none bg-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              {inputValue && (
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
          {/* Filters Panel */}
          <div className="w-60 bg-white border-r border-gray-100 overflow-y-auto pt-4">
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
                {BANKS.map((b) => {
                  const count = allResults?.results
                    ? new Set(
                        allResults.results
                          .filter((c) =>
                            b.aliases
                              .map((a) => a.toLowerCase())
                              .includes(c.bank_name.trim().toLowerCase())
                          )
                          .map((c) => `${c.cardName}-${c.bank_name}`)
                      ).size
                    : 0;
                  return (
                    <div key={b.key} className="group relative">
                      <div className="flex items-center py-1 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <label className="flex items-center space-x-2 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={selectedBanks.includes(b.key)}
                            onChange={() => handleBankFilter(b.key)}
                            className="rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span
                            className={`text-sm ${
                              selectedBanks.includes(b.key)
                                ? "text-blue-600 font-medium"
                                : "text-gray-700"
                            }`}
                          >
                            {b.label}{" "}
                            <span className="text-gray-400 text-xs">
                              ({count})
                            </span>
                          </span>
                        </label>
                        <button
                          onClick={() => handleOnlySelectBank(b.key)}
                          className={`opacity-0 group-hover:opacity-100 transition-opacity text-xs text-blue-500 px-2 py-1 rounded ${
                            selectedBanks.length === 1 &&
                            selectedBanks[0] === b.key
                              ? "bg-blue-50 font-medium"
                              : "hover:bg-gray-100"
                          }`}
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
                  {totalGrouped} cards found
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

          {/* Results */}
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
                      <ChevronLeft className="w-4 h-4 mr-1" /> Back to results
                    </button>
                  </div>
                  <KeywordCardContent
                    cardData2={selectedCard}
                    keyword={committedKeyword}
                  />
                </>
              ) : Object.keys(groupedResults).length ? (
                <div className="space-y-2">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    {Object.keys(groupedResults).length} cards found for "
                    {committedKeyword}"
                  </h2>
                  {sortedResults.map((item) => {
                    const versions = item.cards;
                    const first = versions[0];
                    const latest = versions[versions.length - 1];
                    return (
                      <Link
                        key={item.key}
                        to={`/searchKeyword/${latest.cardId}/${
                          latest.version
                        }?keyword=${encodeURIComponent(committedKeyword)}`}
                        className="no-underline"
                      >
                        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow px-3 py-1 border border-gray-50 group">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <div className="flex-1 flex items-center gap-2">
                                  <h2 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {first.cardName} ({first.cardId})
                                  </h2>
                                  <p className="text-xs text-gray-500">
                                    {first.bank_name} • {versions.length}{" "}
                                    version{versions.length > 1 ? "s" : ""}
                                  </p>
                                </div>
                                <span className="text-xs text-gray-400 mr-2 whitespace-nowrap">
                                  Updated {formatDate(latest.last_updated)}
                                </span>
                              </div>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {versions.map((c) => (
                                  <button
                                    key={`${c.cardId}-${c.version}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleCardClick(c);
                                    }}
                                    className="px-2 py-1 text-xs bg-gray-50 text-gray-600 border border-gray-100 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors"
                                  >
                                    v{c.version}
                                  </button>
                                ))}
                                <button
                                  className="ml-auto flex items-center text-xs text-blue-500 hover:text-blue-700 font-medium"
                                  onClick={(e) => e.preventDefault()}
                                >
                                  View latest
                                  <ArrowRight className="w-3 h-3 ml-1" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
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
                        : "Enter a keyword to search within cards"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {allResults && allResults.count === 0
                        ? "Try using different keywords or removing filters"
                        : ""}
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
