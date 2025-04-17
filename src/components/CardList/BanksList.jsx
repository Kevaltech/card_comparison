import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import BankSection from "./BankSection";

function BanksList({
  bankName,
  data,
  selectedCard,
  onCardSelect,
  fetchCardsData,
  expandAll, // new prop from parent
}) {
  const [isOpenVisible, setIsOpenVisible] = useState(false);
  // States moved from BankSection
  const [isOpenSectionVisible, setIsOpenSectionVisible] = useState(false);
  const [isResolveSectionVisible, setIsResolveSectionVisible] = useState(false);
  const [openSortDropdownVisible, setOpenSortDropdownVisible] = useState(false);
  const [resolveSortDropdownVisible, setResolveSortDropdownVisible] =
    useState(false);
  const [selectedOpenDates, setSelectedOpenDates] = useState([]);
  const [selectedResolveDates, setSelectedResolveDates] = useState([]);
  const [selectedOpenCards, setSelectedOpenCards] = useState([]);
  const [selectedResolveCards, setSelectedResolveCards] = useState([]);

  // Ref for this bank’s <li>
  const bankRef = useRef(null);

  // Check if any filters are applied
  const hasActiveFilters =
    selectedOpenDates.length > 0 || selectedResolveDates.length > 0;

  // Update local expand/collapse state when global expandAll prop changes
  useEffect(() => {
    setIsOpenVisible(expandAll);
  }, [expandAll]);

  // Auto-expand and scroll into view if this bank contains the selected card
  useEffect(() => {
    if (selectedCard) {
      const hasSelectedCard =
        data?.open?.some((card) => card.cardId === selectedCard) ||
        data?.resolve?.some((card) => card.cardId === selectedCard);

      if (hasSelectedCard) {
        setIsOpenVisible(true);

        // Scroll this bank into view
        bankRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [selectedCard, data]);

  return (
    <li ref={bankRef} className="px-2">
      <button
        onClick={() => setIsOpenVisible((v) => !v)}
        className="flex items-center justify-between w-full p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
      >
        <span className="flex items-center gap-2">
          <span>
            {bankName} ({data?.open?.length}, {data?.resolve?.length})
          </span>
          {hasActiveFilters && (
            <Filter
              size={16}
              className="text-blue-600"
              title="Filters applied"
            />
          )}
        </span>
        {isOpenVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpenVisible && (
        <BankSection
          bankName={bankName}
          cards={data}
          selectedCard={selectedCard}
          onCardSelect={onCardSelect}
          fetchCardsData={fetchCardsData}
          isOpenSectionVisible={isOpenSectionVisible}
          setIsOpenSectionVisible={setIsOpenSectionVisible}
          isResolveSectionVisible={isResolveSectionVisible}
          setIsResolveSectionVisible={setIsResolveSectionVisible}
          openSortDropdownVisible={openSortDropdownVisible}
          setOpenSortDropdownVisible={setOpenSortDropdownVisible}
          resolveSortDropdownVisible={resolveSortDropdownVisible}
          setResolveSortDropdownVisible={setResolveSortDropdownVisible}
          selectedOpenDates={selectedOpenDates}
          setSelectedOpenDates={setSelectedOpenDates}
          selectedResolveDates={selectedResolveDates}
          setSelectedResolveDates={setSelectedResolveDates}
          selectedOpenCards={selectedOpenCards}
          setSelectedOpenCards={setSelectedOpenCards}
          selectedResolveCards={selectedResolveCards}
          setSelectedResolveCards={setSelectedResolveCards}
        />
      )}
    </li>
  );
}

export default BanksList;
