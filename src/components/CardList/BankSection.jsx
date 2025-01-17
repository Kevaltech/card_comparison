import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, CircleDot, CheckCircle2 } from "lucide-react";

export const BankSection = ({
  bankName,
  cards,
  selectedCard,
  onCardSelect,
}) => {
  const [isOpenVisible, setIsOpenVisible] = useState(false);
  const [isResolveVisible, setIsResolveVisible] = useState(false);

  // Auto-expand sections if they contain the selected card
  useEffect(() => {
    if (selectedCard) {
      const isInOpenSection = cards?.open?.some(
        (card) => card.cardId === selectedCard
      );
      const isInResolveSection = cards?.resolve?.some(
        (card) => card.cardId === selectedCard
      );

      if (isInOpenSection) {
        setIsOpenVisible(true);
      }
      if (isInResolveSection) {
        setIsResolveVisible(true);
      }
    }
  }, [selectedCard, cards]);

  if (!cards?.open?.length && !cards?.resolve?.length) return null;

  const openSortedData =
    cards?.open?.sort((a, b) => a.name.localeCompare(b.name)) || [];

  const resolveSortedData =
    cards?.resolve?.sort((a, b) => a.name.localeCompare(b.name)) || [];

  return (
    <div className="pl-4">
      {/* Open Section */}
      {openSortedData.length >= 0 && (
        <>
          <button
            onClick={() => setIsOpenVisible(!isOpenVisible)}
            className="flex items-center justify-between w-full p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
          >
            <span className="flex items-center gap-2">
              <CircleDot className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">
                Open ({openSortedData.length})
              </span>
            </span>
            {isOpenVisible ? (
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
          {isOpenVisible && (
            <ul className="space-y-1 pl-6">
              {openSortedData.map((card) => (
                <li key={card.cardId}>
                  <button
                    onClick={() => onCardSelect(card.cardId)}
                    className={`flex items-center w-full p-2 text-sm rounded-lg transition-colors ${
                      selectedCard === card.cardId
                        ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    title={`${bankName} ${card.name} (ID ${card.cardId})`}
                  >
                    <div className="w-full text-left truncate">
                      <span className="font-medium">{card.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        #{card.cardId}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* Resolved Section */}
      {resolveSortedData.length > 0 && (
        <>
          <button
            onClick={() => setIsResolveVisible(!isResolveVisible)}
            className="flex items-center justify-between w-full p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">
                Resolved ({resolveSortedData.length})
              </span>
            </span>
            {isResolveVisible ? (
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
          {isResolveVisible && (
            <ul className="space-y-1 pl-6">
              {resolveSortedData.map((card) => (
                <li key={card.cardId}>
                  <button
                    onClick={() => onCardSelect(card.cardId)}
                    className={`flex items-center w-full p-2 text-sm rounded-lg transition-colors ${
                      selectedCard === card.cardId
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    title={`${bankName} ${card.name} (ID ${card.cardId})`}
                  >
                    <div className="w-full text-left truncate">
                      <span className="font-medium">{card.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        #{card.cardId}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};
