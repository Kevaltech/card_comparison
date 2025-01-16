import React from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/formateDate";

export const CardContent = ({ cardData, onStatusToggle, containerRef }) => {
  console.log("cardData.url?.url", cardData.url);
  return (
    <>
      <div className="mx-auto max-w-screen-md text-center mb-4 lg:mb-4">
        <h3 className="mb-4 text-3xl tracking-tight font-extrabold text-gray-900">
          <Link
            to={cardData?.url}
            target="_blank"
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          >
            {cardData.bank_name} {cardData.cardName} ({cardData.cardId})
          </Link>
        </h3>
        <div className="flex items-center justify-center">
          <h4 className="mb-0 text-2xl tracking-tight font-extrabold text-gray-900">
            Total Version: {cardData.version}
          </h4>
          <div className="flex me-4">
            <label className="ms-2 ml-10 text-md font-medium text-gray-900">
              Last updated: {formatDate(cardData.last_updated)}
            </label>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <h4 className="mb-0 text-2xl tracking-tight font-extrabold text-gray-900">
            Status:{" "}
            <span
              id="badge-dismiss-green"
              className="inline-flex items-center px-2 py-1 me-2 text-sm font-medium text-green-800 bg-green-100 rounded D:bg-green-900 D:text-green-300"
            >
              {cardData.cardStatus}
            </span>
          </h4>
          <div className="flex me-4">
            <button
              onClick={onStatusToggle}
              className="focus:outline-none text-white bg-yellow-400 hover:bg-yellow-500 font-small rounded-lg text-sm px-3 py-2"
            >
              {cardData.cardStatus === "Open" ? "Resolve" : "Open"}
            </button>
          </div>
        </div>
      </div>
      <div
        className="p-4 py-0 border-2 border-gray-200 border-dashed rounded-lg"
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: cardData.cardHtml }}
      />
    </>
  );
};
