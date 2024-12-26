import React from "react";
import { BankSection } from "./BankSection";
import { ChevronDown, ChevronUp } from "lucide-react";
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
      className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="h-full px-0 py-8 overflow-y-auto bg-gray-50 D:bg-gray-800">
        <ul className="space-y-2 font-medium">
          <li className="px-0">
            <h6 className="text-lg font-bold D:text-white">
              Total Cards in DB: {totalCards}
            </h6>
          </li>{" "}
          {Object.entries(banksData).map(([bankName, data]) => (
            <li className="px-2">
              <button
                onClick={() => setIsOpenVisible(!isOpenVisible)}
                className="flex items-center justify-between w-full p-2 text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <span className="flex items-center">
                  <span>
                    {bankName} ({data.open.length + data.resolve.length})
                  </span>
                </span>
                {isOpenVisible ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              {isOpenVisible ? (
                <React.Fragment key={bankName}>
                  <BankSection
                    bankName={bankName}
                    cards={data}
                    isVisible={isOpenVisible}
                    setIsVisible={setIsOpenVisible}
                    selectedCard={selectedCard}
                    onCardSelect={onCardSelect}
                  />
                  {/* <BankSection
                  bankName={bankName}
                  cards={data.resolve}
                  isVisible={isResolvedVisible}
                  setIsVisible={setIsResolvedVisible}
                  selectedCard={selectedCard}
                  onCardSelect={onCardSelect}
                  type="resolve"
                /> */}
                </React.Fragment>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};
