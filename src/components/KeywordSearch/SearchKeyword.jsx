import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronLeft, SlidersHorizontal } from "lucide-react";
import axios from "axios";
import { formatDate } from "../../utils/formateDate";
import { Link } from "react-router-dom";
import { CardContent } from "../CardDetails/CardContent";

const BANKS = [
  "SBI",
  "Axis",
  "RBL",
  "IndusInd",
  "HDFC",
  "ICICI",
  "Yes",
  "IDFC",
  "Standard Chartered",
  "AU",
  "Amex",
  "HSBC",
  "Federal",
];

function SearchKeyword() {
  const [keyword, setKeyword] = useState("");
  const [allResults, setAllResults] = useState([]); // Store all fetched results
  const [displayedResults, setDisplayedResults] = useState([]); // Store filtered results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const containerRef = useRef(null);
  const resultsContainerRef = useRef(null);

  const UPDATE_STATUS_URL =
    "https://c9e5-59-162-82-6.ngrok-free.app/update-card-status/";

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError("Please enter a search keyword");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `https://c9e5-59-162-82-6.ngrok-free.app/search-cards/?keyword=${encodeURIComponent(
          keyword
        )}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "234242",
          },
        }
      );

      setAllResults(response.data.results);
      filterResults(response.data.results, selectedBanks);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  // Function to filter results based on selected banks
  const filterResults = (results, banks) => {
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
  };

  const handleBankFilter = (bank) => {
    const newSelection = selectedBanks.includes(bank)
      ? selectedBanks.filter((b) => b !== bank)
      : [...selectedBanks, bank];
    setSelectedBanks(newSelection);
    filterResults(allResults, newSelection);
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleBack = () => {
    setSelectedCard(null);
  };

  const handleStatusToggle = async () => {
    if (!selectedCard || !cardData || statusUpdateLoading) return;

    setStatusUpdateLoading(true);
    setError(null);

    try {
      const response = await axios.put(`${UPDATE_STATUS_URL}${selectedCard}/`, {
        headers: { "ngrok-skip-browser-warning": "234242" },
      });

      if (response.data.status === "success") {
        setStatusMessage({
          text: `Successfully updated card status to ${response.data.data.status}`,
        });

        await fetchCardsData();
        setCardData((prev) =>
          prev
            ? {
                ...prev,
                cardStatus: response.data.data.status,
              }
            : null
        );
      }
    } catch (err) {
      handleApiError(err, "Failed to update card status");
    } finally {
      setStatusUpdateLoading(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  useEffect(() => {
    if (!selectedCard?.cardHtml || !containerRef.current) return;

    const handleStyleTags = () => {
      const styleTags = containerRef.current?.getElementsByTagName("style");
      Array.from(styleTags || []).forEach((styleTag) => {
        if (styleTag.getAttribute("data-processed")) return;

        const newStyleElement = document.createElement("style");
        Array.from(styleTag.attributes).forEach((attr) => {
          if (attr.name !== "data-processed") {
            newStyleElement.setAttribute(attr.name, attr.value);
          }
        });

        newStyleElement.textContent = styleTag.textContent;
        styleTag.setAttribute("data-processed", "true");
        document.head.appendChild(newStyleElement);
      });
    };

    const handleScriptTags = () => {
      const scripts = containerRef.current?.getElementsByTagName("script");
      Array.from(scripts || []).forEach((script) => {
        if (script.getAttribute("data-executed")) return;

        const newScript = document.createElement("script");
        Array.from(script.attributes).forEach((attr) => {
          if (attr.name !== "data-executed") {
            newScript.setAttribute(attr.name, attr.value);
          }
        });

        newScript.textContent = script.textContent;
        script.setAttribute("data-executed", "true");
        script.parentNode?.removeChild(script);
        document.body.appendChild(newScript);
      });
    };

    handleStyleTags();
    handleScriptTags();

    // Initialize custom functions if they exist
    if (typeof window.initializeTabs === "function") {
      try {
        window.initializeTabs();
      } catch (err) {
        console.error("Error initializing tabs:", err);
      }
    }

    if (typeof window.cleanupDOMElements === "function") {
      try {
        window.cleanupDOMElements();
      } catch (err) {
        console.error("Error cleaning up DOM elements:", err);
      }
    }
  }, [selectedCard?.cardHtml, handleSearch]);

  console.log("serachke", selectedCard);

  return (
    <div className="h-screen mt-14 flex flex-col bg-gray-50">
      {/* Search Header */}
      <div className="flex-none bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search in card comparisons..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
          {error && <p className="mt-2 text-red-600">{error}</p>}
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex-0 overflow-hidden">
        <div className="h-full flex">
          {/* Filter Sidebar */}
          <div
            className={`w-64 bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 ${
              showFilters ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0`}
          >
            <div className="p-4 pl-20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Filter by Bank
              </h3>
              <div className="space-y-2">
                {BANKS.map((bank) => (
                  <label
                    key={bank}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBanks.includes(bank)}
                      onChange={() => handleBankFilter(bank)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{bank}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div ref={resultsContainerRef} className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 py-2">
              {selectedCard ? (
                <div>
                  <button
                    onClick={handleBack}
                    className="flex items-center text-blue-600 hover:text-blue-700 mb-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to results
                  </button>
                  <CardContent
                    cardData={selectedCard}
                    onStatusToggle={handleStatusToggle}
                    containerRef={containerRef}
                  />
                </div>
              ) : displayedResults.length > 0 ? (
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Total results: {displayedResults.length}
                  </h2>
                  {displayedResults.map((result, index) => (
                    <div
                      key={`${result.cardId}-${index}`}
                      onClick={() => handleCardClick(result)}
                      className="bg-white rounded-lg shadow-sm p-6 pb-1 cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            {result.cardName}
                          </h2>
                          <p className="text-sm text-gray-500">
                            {result.bank_name} • Version {result.version}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          Last updated: {formatDate(result.last_updated)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {keyword ? "No results found" : "Enter a keyword to search"}
                  </p>
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
