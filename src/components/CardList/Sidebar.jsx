import React from "react";
import { BankSection } from "./BankSection";
import { ChevronDown, ChevronUp } from "lucide-react";
import BanksList from "./BanksList";
export const Sidebar = ({
  banksData,
  selectedCard,
  onCardSelect,
  isOpenVisible,
  setIsOpenVisible,
  isResolvedVisible,
  setIsResolvedVisible,
}) => {
  const totalCards = Object.values(banksData).reduce(
    (total, bank) => total + bank.open.length + bank.resolve.length,
    0
  );

  return (
    <aside
      id="default-sidebar"
      className="fixed top-0 left-0 z-40 h-screen transition-transform -translate-x-full sm:translate-x-0"
      style={{
        width: "min(90vw, max(300px, 25%))",
        maxWidth: "500px",
      }}
      aria-label="Sidebar"
    >
      <div className="h-full px-3 py-8 overflow-y-auto bg-gray-50 D:bg-gray-800">
        <ul className="space-y-2 font-medium">
          <li className="px-0">
            <h6 className="text-lg font-bold D:text-white">
              Total Cards in DB: {totalCards}
            </h6>
          </li>{" "}
          {Object.entries(banksData).map(([bankName, data]) => (
            <BanksList
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
