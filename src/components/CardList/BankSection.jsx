import React, { useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  CircleDot,
  CheckCircle2,
  Calendar,
  X,
  MoveRight,
  MoveLeft,
  Focus,
  Filter,
} from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";

const BankSection = ({
  bankName,
  cards,
  selectedCard,
  onCardSelect,
  fetchCardsData,
  expansionLevel,
  collapseTrigger,
  expandTrigger,
}) => {
  const [isOpenSectionVisible, setIsOpenSectionVisible] = React.useState(false);
  const [isResolveSectionVisible, setIsResolveSectionVisible] =
    React.useState(false);
  const [openSortDropdownVisible, setOpenSortDropdownVisible] =
    React.useState(false);
  const [resolveSortDropdownVisible, setResolveSortDropdownVisible] =
    React.useState(false);
  const [selectedOpenDates, setSelectedOpenDates] = React.useState([]);
  const [selectedResolveDates, setSelectedResolveDates] = React.useState([]);
  const [selectedOpenCards, setSelectedOpenCards] = React.useState([]);
  const [selectedResolveCards, setSelectedResolveCards] = React.useState([]);
  const openDropdownRef = useRef(null);
  const resolveDropdownRef = useRef(null);

  // console.log("BankSection", bankName, cards);
  const updateMultipleCardsStatus = async (cardIds, newStatus) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BULK_UPDATE_CARD_STATUS}`,
        {
          card_ids: cardIds,
          status: newStatus,
        }
      );

      if (response.data.status === "success") {
        console.log(`Successfully updated ${response.data.data.length} cards.`);
        fetchCardsData();
        // Clear selections after successful update
        if (newStatus === 0) {
          setSelectedOpenCards([]);
        } else {
          setSelectedResolveCards([]);
        }
        return response.data.data;
      } else {
        console.error(`Error: ${response.data.message}`);
        return null;
      }
    } catch (error) {
      console.error(
        "Error updating cards:",
        error.response?.data || error.message
      );
      return null;
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openDropdownRef.current &&
        !openDropdownRef.current.contains(event.target)
      ) {
        setOpenSortDropdownVisible(false);
      }
      if (
        resolveDropdownRef.current &&
        !resolveDropdownRef.current.contains(event.target)
      ) {
        setResolveSortDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (expansionLevel >= 2) {
      setIsOpenSectionVisible(true);
      setIsResolveSectionVisible(true);
    } else {
      setIsOpenSectionVisible(false);
      setIsResolveSectionVisible(false);
    }
  }, [expansionLevel, collapseTrigger, expandTrigger]);

  React.useEffect(() => {
    if (selectedCard) {
      const isInOpenSection = cards?.open?.some(
        (card) => card.cardId === selectedCard
      );
      const isInResolveSection = cards?.resolve?.some(
        (card) => card.cardId === selectedCard
      );

      if (isInOpenSection) {
        setIsOpenSectionVisible(true);
      }
      if (isInResolveSection) {
        setIsResolveSectionVisible(true);
      }
    }
  }, [selectedCard, cards]);

  if (!cards?.open?.length && !cards?.resolve?.length) return null;

  const openSortedData =
    cards?.open?.sort((a, b) => a.name.localeCompare(b.name)) || [];

  const resolveSortedData =
    cards?.resolve?.sort((a, b) => a.name.localeCompare(b.name)) || [];

function formatDate(date1) {
  const date = new Date(date1);

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-IN", { month: "short" });
  const year = date.getFullYear();

  // let hours = date.getHours();
  // const minutes = String(date.getMinutes()).padStart(2, "0");
  // const ampm = hours >= 12 ? "pm" : "am";

  // hours = hours % 12 || 12; // Convert to 12-hour format
  // const formattedHour = String(hours).padStart(2, "0");

  return `${day}-${month}-${year}`;
}


  const getUniqueDates = (data) => {
    const dates = data.map((card) => formatDate(card.last_update));
    return [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
  };

  const filterCardsByDates = (cards, selectedDates) => {
    if (!selectedDates.length) return cards;
    return cards.filter((card) =>
      selectedDates.includes(formatDate(card.last_update))
    );
  };

  const openUniqueDates = getUniqueDates(openSortedData);
  const resolveUniqueDates = getUniqueDates(resolveSortedData);

  const filteredOpenCards = filterCardsByDates(
    openSortedData,
    selectedOpenDates
  );
  const filteredResolveCards = filterCardsByDates(
    resolveSortedData,
    selectedResolveDates
  );

  const handleOpenCardSelect = (cardId) => {
    setSelectedOpenCards((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleResolveCardSelect = (cardId) => {
    setSelectedResolveCards((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleSelectAllOpen = () => {
    if (selectedOpenCards.length === filteredOpenCards.length) {
      setSelectedOpenCards([]);
    } else {
      setSelectedOpenCards(filteredOpenCards.map((card) => card.cardId));
    }
  };

  const handleSelectAllResolve = () => {
    if (selectedResolveCards.length === filteredResolveCards.length) {
      setSelectedResolveCards([]);
    } else {
      setSelectedResolveCards(filteredResolveCards.map((card) => card.cardId));
    }
  };

  const handleOnlySelectOpen = (cardId) => {
    setSelectedOpenCards([cardId]);
  };

  const handleOnlySelectResolve = (cardId) => {
    setSelectedResolveCards([cardId]);
  };

  const SortDropdown = ({ visible, dates, selectedDates, onDateSelect }) => {
    const toggleDate = (date) => {
      if (selectedDates.includes(date)) {
        onDateSelect(selectedDates.filter((d) => d !== date));
      } else {
        onDateSelect([...selectedDates, date]);
      }
    };

    if (!visible) return null;

    return (
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
        <div className="p-2">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">
              Filter by dates
            </span>
            <div className="flex gap-2">
              {selectedDates.length > 0 && (
                <button
                  onClick={() => onDateSelect([])}
                  className="text-gray-400 hover:text-gray-600"
                  title="Clear selection"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          <ul className="space-y-1 max-h-60 overflow-auto">
            {dates.map((date) => (
              <li key={date}>
                <button
                  onClick={() => toggleDate(date)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${
                    selectedDates.includes(date)
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{date}</span>
                  {selectedDates.includes(date) && (
                    // <CheckCircle2 size={14} className="text-blue-600" />
                    <X size={16} className="text-red-400" />
                  )}
                </button>
              </li>
            ))}
          </ul>
          {selectedDates.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                {selectedDates.length} date{selectedDates.length > 1 ? "s" : ""}{" "}
                selected
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="pl-4">
      {/* Open Section */}
      {openSortedData.length >= 0 && (
        <>
          <div className="relative">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsOpenSectionVisible(!isOpenSectionVisible)}
                className="flex items-center flex-1 p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
              >
                <span className="flex items-center gap-2">
                  <CircleDot className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">
                    Open ({filteredOpenCards.length})
                  </span>
                  {selectedOpenDates.length > 0 && (
                    <Filter
                      size={14}
                      className="text-blue-600"
                      title="Filters applied"
                    />
                  )}
                </span>
                {isOpenSectionVisible ? (
                  <ChevronUp
                    size={18}
                    className="text-gray-400 group-hover:text-gray-600"
                  />
                ) : (
                  <ChevronDown
                    size={18}
                    className="text-gray-400 group-hover:text-gray-600"
                  />
                )}
              </button>
              {isOpenSectionVisible && selectedOpenCards.length > 0 && (
                <button
                  onClick={() =>
                    updateMultipleCardsStatus(selectedOpenCards, 0)
                  }
                  className="p-1.5 mr-2 text-gray-500 hover:text-blue-700 bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                  title="Close selected cards"
                >
                  {/* <MoveRight size={16} /> */}
                  <span className="text-sm">
                    Close ({selectedOpenCards.length})
                  </span>
                </button>
              )}

              {isOpenSectionVisible && (
                <div className="flex items-center gap-2">
                  {filteredOpenCards.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Select all</span>
                      <button
                        onClick={handleSelectAllOpen}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          selectedOpenCards.length ===
                            filteredOpenCards.length &&
                          filteredOpenCards.length > 0
                            ? "bg-blue-600"
                            : "bg-gray-200"
                        }`}
                      >
                        <span className="sr-only">Toggle switch</span>
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ease-in-out ${
                            selectedOpenCards.length ===
                              filteredOpenCards.length &&
                            filteredOpenCards.length > 0
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  <div className="relative" ref={openDropdownRef}>
                    <button
                      onClick={() =>
                        setOpenSortDropdownVisible(!openSortDropdownVisible)
                      }
                      className={`p-2 rounded-lg transition-colors ${
                        selectedOpenDates.length > 0
                          ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      }`}
                      title={`Filter by dates${
                        selectedOpenDates.length
                          ? ` (${selectedOpenDates.length} selected)`
                          : ""
                      }`}
                    >
                      <Calendar
                        size={16}
                        className={
                          selectedOpenDates.length > 0
                            ? "text-blue-600"
                            : "text-gray-500"
                        }
                      />
                    </button>
                    <SortDropdown
                      visible={openSortDropdownVisible}
                      dates={openUniqueDates}
                      selectedDates={selectedOpenDates}
                      onDateSelect={setSelectedOpenDates}
                    />

                    {selectedOpenDates.length > 0 && (
                      <button
                        onClick={() => setSelectedOpenDates([])}
                        className="text-gray-400 hover:text-gray-600"
                        title="Clear selection"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {isOpenSectionVisible && (
            <ul className="space-y-1 pl-6">
              {filteredOpenCards.map((card) => (
                <li key={card.cardId} className="group relative">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedOpenCards.includes(card.cardId)}
                      onChange={() => handleOpenCardSelect(card.cardId)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Link
                      to={`/compare/${card.cardId}`}
                      className={`flex-1 flex items-center w-full p-2 text-sm rounded-lg transition-colors ${
                        selectedCard === card.cardId
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      title={`${bankName} ${card.name} (ID ${card.cardId})`}
                    >
                      <div
                        className="w-full text-left truncate"
                        onClick={() => handleOpenCardSelect(card.cardId)}
                      >
                        <span className="font-medium">{card.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          #{card.cardId} -
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          {formatDate(card.open_update)}
                        </span>
                      </div>
                      {/* Google Flights-style "Only" button */}
                      <button
                        onClick={() => handleOnlySelectOpen(card.cardId)}
                        className={`
                              opacity-0 group-hover:opacity-100 transition-opacity
                              text-xs text-blue-500 px-2 py-1 rounded
                              ${
                                selectedOpenCards.length === 1 &&
                                selectedOpenCards[0] === card.cardId
                                  ? "bg-blue-50 font-medium"
                                  : "hover:bg-gray-100"
                              }
               `}
                        title="Select only this card"
                      >
                        Only
                      </button>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* Resolved Section */}
      <>
        <div className="relative">
          <div className="flex items-center justify-between">
            <button
              onClick={() =>
                setIsResolveSectionVisible(!isResolveSectionVisible)
              }
              className="flex items-center flex-1 p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">
                  Closed ({filteredResolveCards.length})
                </span>
                {selectedResolveDates.length > 0 && (
                  <Filter
                    size={14}
                    className="text-blue-600"
                    title="Filters applied"
                  />
                )}
              </span>
              {isResolveSectionVisible ? (
                <ChevronUp
                  size={18}
                  className="text-gray-400 group-hover:text-gray-600"
                />
              ) : (
                <ChevronDown
                  size={18}
                  className="text-gray-400 group-hover:text-gray-600"
                />
              )}
            </button>
            {isResolveSectionVisible && (
              <div className="flex items-center gap-2">
                {selectedResolveCards.length > 0 && (
                  <button
                    onClick={() =>
                      updateMultipleCardsStatus(selectedResolveCards, 1)
                    }
                    className="p-1.5 mr-2 text-gray-500 bg-blue-100 hover:text-blue-700  rounded-lg transition-colors flex items-center gap-1"
                    title="Reopen selected cards"
                  >
                    {/* <MoveLeft size={16} /> */}
                    <span className="text-sm">
                      Open ({selectedResolveCards.length})
                    </span>
                  </button>
                )}

                {filteredResolveCards.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Select all</span>
                    <button
                      onClick={handleSelectAllResolve}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        selectedResolveCards.length ===
                          filteredResolveCards.length &&
                        filteredResolveCards.length > 0
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                    >
                      <span className="sr-only">Toggle switch</span>
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ease-in-out ${
                          selectedResolveCards.length ===
                            filteredResolveCards.length &&
                          filteredResolveCards.length > 0
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                )}

                <div className="relative" ref={resolveDropdownRef}>
                  <button
                    onClick={() =>
                      setResolveSortDropdownVisible(!resolveSortDropdownVisible)
                    }
                    className={`p-2 rounded-lg transition-colors ${
                      selectedResolveDates.length > 0
                        ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                    title={`Filter by dates${
                      selectedResolveDates.length
                        ? ` (${selectedResolveDates.length} selected)`
                        : ""
                    }`}
                  >
                    <Calendar
                      size={16}
                      className={
                        selectedResolveDates.length > 0
                          ? "text-blue-600"
                          : "text-gray-500"
                      }
                    />
                  </button>
                  <SortDropdown
                    visible={resolveSortDropdownVisible}
                    dates={resolveUniqueDates}
                    selectedDates={selectedResolveDates}
                    onDateSelect={setSelectedResolveDates}
                  />
                  {selectedResolveDates.length > 0 && (
                    <button
                      onClick={() => setSelectedResolveDates([])}
                      className="text-gray-400 hover:text-gray-600"
                      title="Clear selection"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {isResolveSectionVisible && (
          <ul className="space-y-1 pl-6">
            {filteredResolveCards.map((card) => (
              <li key={card.cardId} className="group relative">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedResolveCards.includes(card.cardId)}
                    onChange={() => handleResolveCardSelect(card.cardId)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Link
                    // onClick={() => onCardSelect(card.cardId)}
                    to={`/compare/${card.cardId}`}
                    className={`flex-1 flex items-center w-full p-2 text-sm rounded-lg transition-colors ${
                      selectedCard === card.cardId
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    title={`${bankName} ${card.name} (ID ${card.cardId})`}
                  >
                    <div
                      className="w-full text-left truncate "
                      onClick={() => handleResolveCardSelect(card.cardId)}
                    >
                      <span className="font-medium">{card.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        #{card.cardId} -
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        {formatDate(card.last_update)}
                      </span>
                    </div>
                    {/* Google Flights-style "Only" button */}
                    <button
                      onClick={() => handleOnlySelectResolve(card.cardId)}
                      className={`
                            opacity-0 group-hover:opacity-100 transition-opacity
                            text-xs text-blue-500 px-2 py-1 rounded
                            ${
                              selectedResolveCards.length === 1 &&
                              selectedResolveCards[0] === card.cardId
                                ? "bg-blue-50 font-medium"
                                : "hover:bg-gray-100"
                            }
                          `}
                      title="Select only this card"
                    >
                      Only
                    </button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </>
    </div>
  );
};

export default BankSection;
