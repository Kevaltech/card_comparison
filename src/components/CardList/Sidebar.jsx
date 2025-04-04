import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import BanksList from "./BanksList";
import BackToTop from "../CardDetails/BackToTop";

export const Sidebar = ({
  banksData,
  selectedCard,
  onCardSelect,
  generalBankData,
  setOverview,
  showOverview,
  fetchCardsData,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [areCardsExpanded, setAreCardsExpanded] = useState(false);
  const searchRef = useRef(null);

  // Calculate totals
  const totalCards = Object.values(banksData).reduce(
    (total, bank) => total + bank?.open?.length + bank?.resolve?.length,
    0
  );
  const totalGeneralCards = Object.values(generalBankData).reduce(
    (total, bank) => total + bank?.open?.length + bank?.resolve?.length,
    0
  );

  // Function to flatten the card data for searching
  const getAllCards = () => {
    const cards = [];
    Object.entries(banksData).forEach(([bankName, data]) => {
      if (data.open) {
        data.open.forEach((card) => {
          cards.push({ ...card, bankName, type: "open" });
        });
      }
      if (data.resolve) {
        data.resolve.forEach((card) => {
          cards.push({ ...card, bankName, type: "resolve" });
        });
      }
    });
    Object.entries(generalBankData).forEach(([bankName, data]) => {
      if (data.open) {
        data.open.forEach((card) => {
          cards.push({ ...card, bankName, type: "open", isGeneral: true });
        });
      }
      if (data.resolve) {
        data.resolve.forEach((card) => {
          cards.push({ ...card, bankName, type: "resolve", isGeneral: true });
        });
      }
    });
    return cards;
  };

  // Toggle expand/collapse all cards
  const toggleCardsExpanded = () => {
    setAreCardsExpanded((prev) => !prev);
  };

  function sortObjectByKeys(obj) {
    return Object.keys(obj)
      .sort()
      .reduce((sortedObj, key) => {
        sortedObj[key] = obj[key];
        return sortedObj;
      }, {});
  }

  const sortedBankData = sortObjectByKeys(banksData);
  const sortedGeneralBankData = sortObjectByKeys(generalBankData);

  // console.log("sortedBankData", sortedBankData);

  // Search function
  useEffect(() => {
    if (searchTerm.trim()) {
      const allCards = getAllCards();
      const filtered = allCards
        .filter(
          (card) =>
            card.cardId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.bref.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 10); // Limit to 8 results
      setSearchResults(filtered);
      setIsSearching(true);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchTerm, banksData, generalBankData]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearching(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchResultClick = (card) => {
    onCardSelect(card.cardId);
    setSearchTerm("");
    setIsSearching(false);
  };

  return (
    <aside
      id="default-sidebar"
      className="fixed top-0 left-0 z-40 h-screen transition-transform -translate-x-full sm:translate-x-0"
      style={{
        width: "min(90vw, max(300px, 27%))",
        maxWidth: "600px",
      }}
      aria-label="Sidebar"
    >
      {/* Search Input */}
      <div className="relative p-4 pb-2" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full p-4 pl-10 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search Cards or Cards Id"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {/* Search Results Dropdown */}
        {isSearching && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            {searchResults.map((card, index) => (
              <div
                key={`${card.cardId}-${index}`}
                onClick={() => handleSearchResultClick(card)}
                className="flex flex-col p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              >
                <span className="font-medium text-gray-900">{card.name}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">{card.bankName}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    #{card.cardId}
                  </span>
                  {card.isGeneral && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                      General
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Container for fixed Overview and scrollable content */}
      <div className="h-full flex flex-col">
        {/* Fixed Overview Section */}
        <div className="px-3 py-2 bg-gray-50 D:bg-gray-800">
          <ul className="space-y-2 font-medium">
            <li className="px-0">
              <button
                onClick={() => setOverview(!showOverview)}
                className="w-full flex items-center justify-between  text-sm font-medium text-left text-gray-900 rounded-lg hover:bg-gray-100 D:hover:bg-gray-700 D:text-white D:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100"
              >
                <h6 className="text-lg font-bold D:text-white">Overview</h6>
              </button>
            </li>
          </ul>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 px-3 py-4 pb-20 overflow-y-auto bg-gray-50 D:bg-gray-800">
          <ul className="space-y-2 font-medium">
            <li className="px-0 flex justify-between items-center">
              <h6 className="text-lg font-bold D:text-white">
                Cards ({totalCards})
              </h6>
              <span
                className="cursor-pointer text-sm text-blue-600"
                onClick={toggleCardsExpanded}
              >
                {areCardsExpanded ? "Collapse all" : "Expand all"}
              </span>
            </li>
            {Object.entries(sortedBankData).map(([bankName, data]) => (
              <BanksList
                key={bankName}
                bankName={bankName}
                data={data}
                selectedCard={selectedCard}
                onCardSelect={onCardSelect}
                fetchCardsData={fetchCardsData}
                expandAll={areCardsExpanded}
              />
            ))}
          </ul>
          <ul className="space-y-2 font-medium mt-6">
            <li className="px-0">
              <h6 className="text-lg font-bold D:text-white">
                General links ({totalGeneralCards})
              </h6>
            </li>
            {Object.entries(sortedGeneralBankData).map(([bankName, data]) => (
              <BanksList
                key={bankName}
                bankName={bankName}
                data={data}
                selectedCard={selectedCard}
                onCardSelect={onCardSelect}
                fetchCardsData={fetchCardsData}
                expandAll={areCardsExpanded}
              />
            ))}{" "}
          </ul>
        </div>
      </div>
    </aside>
  );
};
