import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import BanksList from "./BanksList";

export const Sidebar = ({
  banksData,
  selectedCard,
  onCardSelect,
  generalBankData,
  setOverview,
  showOverview,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

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
        width: "min(90vw, max(300px, 23%))",
        maxWidth: "500px",
      }}
      aria-label="Sidebar"
    >
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

      <div className="h-full px-3 py-4 pb-20 overflow-y-auto bg-gray-50 D:bg-gray-800">
        <ul className="space-y-2 font-medium">
          <li className="px-0">
            <button onClick={() => setOverview(!showOverview)}>
              <h6 className="text-lg font-bold D:text-white">Overview</h6>
            </button>
          </li>
          <li className="px-0">
            <h6 className="text-lg font-bold D:text-white">
              Total Cards in DB: {totalCards}
            </h6>
          </li>
          {Object.entries(banksData).map(([bankName, data]) => (
            <BanksList
              key={bankName}
              bankName={bankName}
              data={data}
              selectedCard={selectedCard}
              onCardSelect={onCardSelect}
            />
          ))}
        </ul>
        <ul className="space-y-2 font-medium mt-6">
          <li className="px-0">
            <h6 className="text-lg font-bold D:text-white">
              General links ({totalGeneralCards})
            </h6>
          </li>
          {Object.entries(generalBankData).map(([bankName, data]) => (
            <BanksList
              key={bankName}
              bankName={bankName}
              data={data}
              selectedCard={selectedCard}
              onCardSelect={onCardSelect}
            />
          ))}
        </ul>
      </div>
    </aside>
  );
};
