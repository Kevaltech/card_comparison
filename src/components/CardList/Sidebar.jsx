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
  generalBankData,
}) => {
  const totalCards = Object.values(banksData).reduce(
    (total, bank) => total + bank?.open?.length + bank?.resolve?.length,
    0
  );
  const totalGeneralCards = Object.values(generalBankData).reduce(
    (total, bank) => total + bank?.open?.length + bank?.resolve?.length,
    0
  );

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
      <form class="max-w-md mx-auto p-4">
        <label
          for="default-search"
          class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
        >
          Search
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              class="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            id="default-search"
            class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search Cards or Cards Id"
            required
          />
          <button
            type="submit"
            class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Search
          </button>
        </div>
      </form>
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
        <ul className="space-y-2 font-medium">
          <li className="px-0">
            <h6 className="text-lg font-bold D:text-white">
              General links {totalGeneralCards}
            </h6>
          </li>{" "}
          {Object.entries(generalBankData).map(([bankName, data]) => (
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
