import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export const BankSection = ({
  bankName,
  cards,
  selectedCard,
  onCardSelect,
}) => {
  if (cards.length === 0) return null;

  const openSortedData = cards?.open?.sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const resolveSortedData = cards?.resolve?.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const [isOpenVisible, setIsOpenVisible] = useState(false);
  const [isResolveVisible, setIsResolveVisible] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpenVisible(!isOpenVisible)}
        className="flex items-center justify-between w-full p-2 px-4 text-gray-900 rounded-lg hover:bg-gray-100"
      >
        <span className="flex items-center">
          <span>Open Cards ({cards?.open.length})</span>
        </span>
        {isOpenVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpenVisible && (
        <ul className="py-2 space-y-2">
          {openSortedData?.map((card) => (
            <li key={card.cardId}>
              <button
                onClick={() => onCardSelect(card.cardId)}
                className={`flex items-center w-full p-2 rounded-lg group ${
                  selectedCard === card.cardId
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-900 hover:bg-gray-100"
                }`}
                title={`${bankName} ${card.name} (ID ${card.cardId})`}
              >
                <div className="w-full text-left truncate">
                  {bankName} {card.name} ({card.cardId})
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={() => setIsResolveVisible(!isResolveVisible)}
        className="flex items-center justify-between w-full p-2 px-4 text-gray-900 rounded-lg hover:bg-gray-100"
      >
        <span className="flex items-center">
          <span>Resolved Cards ({cards?.resolve.length})</span>
        </span>
        {isResolveVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isResolveVisible && (
        <ul className="py-2 space-y-2">
          {resolveSortedData?.map((card) => (
            <li key={card.cardId}>
              <button
                onClick={() => onCardSelect(card.cardId)}
                className={`flex items-center w-full p-2 rounded-lg group ${
                  selectedCard === card.cardId
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-900 hover:bg-gray-100"
                }`}
                title={`${bankName} ${card.name} (ID ${card.cardId})`}
              >
                <div className="w-full text-left truncate">
                  {bankName} {card.name} ({card.cardId})
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
