import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { BankSection } from "./BankSection";

function BanksList({ bankName, data, selectedCard, onCardSelect }) {
  const [isOpenVisible, setIsOpenVisible] = useState(false);
  // Auto-expand the section if it contains the selected card
  React.useEffect(() => {
    if (selectedCard) {
      const hasSelectedCard =
        data?.open?.some((card) => card.cardId === selectedCard) ||
        data?.resolve?.some((card) => card.cardId === selectedCard);

      if (hasSelectedCard) {
        setIsOpenVisible(true);
      }
    }
  }, [selectedCard, data]);

  return (
    <li className="px-2">
      <button
        onClick={() => setIsOpenVisible(!isOpenVisible)}
        className="flex items-center justify-between w-full p-2 text-gray-900 rounded-lg hover:bg-gray-100"
      >
        <span className="flex items-center">
          <span>
            {bankName} ({data?.open?.length + data?.resolve?.length})
          </span>
        </span>
        {isOpenVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpenVisible && (
        <React.Fragment key={bankName}>
          <BankSection
            bankName={bankName}
            cards={data}
            selectedCard={selectedCard}
            onCardSelect={onCardSelect}
          />
        </React.Fragment>
      )}
    </li>
  );
}

export default BanksList;
