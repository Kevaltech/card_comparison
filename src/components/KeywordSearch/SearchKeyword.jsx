import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronLeft, SlidersHorizontal } from "lucide-react";
import axios from "axios";
import { formatDate } from "../../utils/formateDate";
import { Link } from "react-router-dom";
import KeywordCardContent from "./KeywordCardContent";

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
  const [allResults, setAllResults] = useState(null); // Initially null
  const [displayedResults, setDisplayedResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const containerRef = useRef(null);

  console.log("allResults", allResults);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError("Please enter a search keyword.");
      return;
    }

    setLoading(true);
    setError("");
    setAllResults(null); // Reset results before fetching

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SEARCH_KEYWORDS_URL}=${encodeURIComponent(
          keyword
        )}`,
        {
          headers: { "ngrok-skip-browser-warning": "234242" },
        }
      );

      setAllResults(response.data); // Store entire response
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
  };

  const handleBankFilter = (bank) => {
    const newSelection = selectedBanks.includes(bank)
      ? selectedBanks.filter((b) => b !== bank)
      : [...selectedBanks, bank];

    setSelectedBanks(newSelection);
    filterResults(allResults?.results, newSelection);
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleBack = () => {
    setSelectedCard(null);
  };

  return (
    <div className="h-screen mt-10 flex flex-col bg-gray-50">
      {/* Top Search Bar */}
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
            {/* <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button> */}
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
          {error && <p className="mt-2 text-red-600">{error}</p>}
        </div>
      </div>

      <div className="flex-0 overflow-hidden">
        <div className="h-full flex">
          {/* Left Filters Panel */}
          <div
            className={`w-64 bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300  lg:translate-x-0`}
          >
            <div className="p-4 pl-20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Filter by Bank
              </h3>
              <div className="space-y-2">
                {BANKS.map((bank) => {
                  const count =
                    allResults?.results.filter(
                      (card) =>
                        card.bank_name.trim().toLowerCase() ===
                        bank.trim().toLowerCase()
                    ).length || 0;
                  return (
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
                      <span className="text-gray-700">
                        {bank} ({count})
                      </span>
                    </label>
                  );
                })}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 my-2">
                Total results: {allResults?.results?.length}
              </h2>
            </div>
          </div>

          {/* Results / Card Details */}
          <div ref={containerRef} className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 py-2">
              {loading ? (
                // Display fetching message when loading is true.
                <div className="text-center py-12">
                  <p className="text-gray-500">Fetching results...</p>
                </div>
              ) : selectedCard ? (
                // When a card is selected, show Back to results and card details.
                <>
                  <div className="sticky top-0 bg-white z-10 py-2">
                    <button
                      onClick={handleBack}
                      className="flex items-center text-blue-600 hover:text-blue-700 mb-1"
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
              ) : displayedResults && displayedResults.length > 0 ? (
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Total results: {displayedResults.length}
                  </h2>
                  {displayedResults.map((result, index) => (
                    <div
                      key={`${result.cardId}-${index}`}
                      onClick={() => handleCardClick(result)}
                      className="bg-white rounded-lg shadow-sm p-1 px-4 cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
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
                    {allResults
                      ? allResults.count === 0
                        ? "No matches found"
                        : "Enter a keyword to search"
                      : "Enter a keyword to search"}
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
