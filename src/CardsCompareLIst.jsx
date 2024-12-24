import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatDate } from "./utils/formateDate";
import { Link } from "react-router-dom";

function CardsCompareLIst() {
  const navigate = useNavigate();
  const { cardId: routeCardId } = useParams();
  const containerRef = useRef(null);

  const [htmlContent, setHtmlContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cardData, setCardData] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isOpenDropdownVisible, setIsOpenDropdownVisible] = useState(true);
  const [isResolvedDropdownVisible, setIsResolvedDropdownVisible] =
    useState(true);
  const [cardsData, setCardsData] = useState({
    open: [],
    resolve: [],
  });
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Base URLs for API calls
  const BASE_COMPARE_URL = "https://eefd-59-162-82-6.ngrok-free.app/compare/";
  const CARDS_STATUS_URL =
    "https://eefd-59-162-82-6.ngrok-free.app/cards-by-status/";
  const UPDATE_STATUS_URL =
    "https://eefd-59-162-82-6.ngrok-free.app/update-card-status/";

  // Fetch cards data
  const fetchCardsData = async () => {
    try {
      const response = await axios.get(CARDS_STATUS_URL, {
        headers: {
          "ngrok-skip-browser-warning": "234242",
        },
      });
      const { data } = response;

      if (!data || typeof data !== "object") {
        throw new Error("Invalid data format received from server");
      }

      const normalizedData = {
        open: Array.isArray(data.open) ? data.open : [],
        resolve: Array.isArray(data.resolve) ? data.resolve : [],
      };

      setCardsData(normalizedData);

      // Select first card if none selected
      if (!selectedCard && normalizedData.open.length > 0) {
        fetchHtmlContent(normalizedData.open[0].cardId);
      }
    } catch (err) {
      console.error("Error fetching cards data:", err);
      handleApiError(err, "Failed to load cards data");
      setCardsData({
        open: [],
        resolve: [],
      });
    }
  };

  const handleApiError = (err, defaultMessage) => {
    let errorMessage = defaultMessage;

    if (err.response) {
      errorMessage =
        err.response.data?.message || `Server error: ${err.response.status}`;
    } else if (err.request) {
      errorMessage =
        "Could not connect to the server. Please check your internet connection.";
    }

    setError(errorMessage);
    setStatusMessage({ type: "error", text: errorMessage });

    // Clear error message after 5 seconds
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  };

  const fetchHtmlContent = async (cardId) => {
    if (!cardId) return;

    setIsLoading(true);
    setError(null);
    setSelectedCard(cardId);

    navigate(`/compare/${cardId}`, { replace: true });

    try {
      const response = await axios.get(`${BASE_COMPARE_URL}${cardId}`, {
        headers: {
          "ngrok-skip-browser-warning": "234242",
        },
      });
      setCardData(response.data);
      setHtmlContent(response.data);
    } catch (err) {
      console.error("Fetch error:", err);
      handleApiError(err, "Failed to fetch card details");
      if (cardId !== cardsData.open[0]?.cardId && cardsData.open.length > 0) {
        fetchHtmlContent(cardsData.open[0].cardId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle card status toggle
  const handleStatusToggle = async () => {
    if (!selectedCard || !cardData || statusUpdateLoading) return;

    setStatusUpdateLoading(true);
    setError(null);

    try {
      const response = await axios.put(`${UPDATE_STATUS_URL}${selectedCard}/`, {
        headers: {
          "ngrok-skip-browser-warning": "234242",
        },
      });

      if (response.data.status === "success") {
        setStatusMessage({
          type: "success",
          text: `Successfully updated card status to ${response.data.data.status}`,
        });

        // Refresh the cards data to update the sidebar
        await fetchCardsData();

        // Update the current card data
        setCardData((prev) => ({
          ...prev,
          cardStatus: response.data.data.status,
        }));
      }
    } catch (err) {
      handleApiError(err, "Failed to update card status");
    } finally {
      setStatusUpdateLoading(false);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
    }
  };

  // Initial load effect
  useEffect(() => {
    fetchCardsData();
  }, []);

  useEffect(() => {
    if (routeCardId && cardsData) {
      const allCards = [...cardsData.open, ...cardsData.resolve];
      const validCard = allCards.find((card) => card.cardId === routeCardId);

      if (validCard) {
        fetchHtmlContent(validCard.cardId);
      } else if (cardsData.open.length > 0) {
        fetchHtmlContent(cardsData.open[0].cardId);
      }
    }
  }, [routeCardId, cardsData]);

  // Handle styles and scripts
  useEffect(() => {
    if (!htmlContent || !containerRef.current) return;

    const handleStyleTags = () => {
      const styleTags = containerRef.current.getElementsByTagName("style");
      Array.from(styleTags).forEach((styleTag) => {
        if (styleTag.getAttribute("data-processed")) return;

        const newStyleElement = document.createElement("style");
        Array.from(styleTag.attributes).forEach((attr) => {
          if (attr.name !== "data-processed") {
            newStyleElement.setAttribute(attr.name, attr.value);
          }
        });

        newStyleElement.textContent = styleTag.textContent;
        styleTag.setAttribute("data-processed", "true");
        document.head.appendChild(newStyleElement);
      });
    };

    const handleScriptTags = () => {
      const scripts = containerRef.current.getElementsByTagName("script");
      Array.from(scripts).forEach((script) => {
        if (script.getAttribute("data-executed")) return;

        const newScript = document.createElement("script");
        Array.from(script.attributes).forEach((attr) => {
          if (attr.name !== "data-executed") {
            newScript.setAttribute(attr.name, attr.value);
          }
        });

        newScript.textContent = script.textContent;
        script.setAttribute("data-executed", "true");
        script?.parentNode?.removeChild(script);
        document.body.appendChild(newScript);
      });
    };

    handleStyleTags();
    handleScriptTags();

    if (typeof window.initializeTabs === "function") {
      try {
        window.initializeTabs();
      } catch (err) {
        console.error("Error initializing tabs:", err);
      }
    }

    if (typeof window.cleanupDOMElements === "function") {
      try {
        window.cleanupDOMElements();
      } catch (err) {
        console.error("Error cleaning up DOM elements:", err);
      }
    }
  }, [htmlContent]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {statusMessage && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 D:bg-gray-800 D:text-yellow-300"
            role="alert"
          >
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        </div>
      )}

      <aside
        id="default-sidebar"
        className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
        aria-label="Sidebar"
      >
        <div className="h-full px-0 py-8 overflow-y-auto bg-gray-50 D:bg-gray-800">
          <ul className="space-y-2 font-medium">
            {/* Open Cards Section */}
            <li>
              <h6 className="text-lg font-bold dark:text-white">
                {" "}
                Total Cards in DB:{" "}
                {cardsData.open.length + cardsData.resolve.length}
              </h6>
            </li>
            <li className="border-b border-gray-200">
              <button
                onClick={() => setIsOpenDropdownVisible(!isOpenDropdownVisible)}
                className="flex items-center justify-between w-full p-2 pl-0 text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <span className="flex items-center">
                  <span className="">Open Cards ({cardsData.open.length})</span>
                </span>
                {isOpenDropdownVisible ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              {isOpenDropdownVisible && (
                <ul className="py-2 space-y-2">
                  {cardsData.open.map((card) => (
                    <li key={card.cardId}>
                      <button
                        onClick={() => fetchHtmlContent(card.cardId)}
                        className={`flex items-center p-2 pl-0 w-full rounded-lg whitespace-nowrap ${
                          selectedCard === card.cardId
                            ? "bg-blue-100 text-blue-800"
                            : "text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        HDFC {card?.name} (ID {card?.cardId?.split("hdfcc")})
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* Resolved Cards Section */}
            <li className="border-b border-gray-200">
              <button
                onClick={() =>
                  setIsResolvedDropdownVisible(!isResolvedDropdownVisible)
                }
                className="flex items-center justify-between w-full p-2 text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <span className="flex items-center">
                  <span className="">
                    Resolved Cards ({cardsData.resolve.length})
                  </span>
                </span>
                {isResolvedDropdownVisible ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              {isResolvedDropdownVisible && (
                <ul className="py-2 space-y-2">
                  {cardsData.resolve.map((card) => (
                    <li key={card.cardId}>
                      <button
                        onClick={() => fetchHtmlContent(card.cardId)}
                        className={`flex items-center p-2  w-full rounded-lg ${
                          selectedCard === card.cardId
                            ? "bg-blue-100 text-blue-800"
                            : "text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        {card.name}- {card.cardId}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </div>
      </aside>

      <div className="p-4 sm:ml-64">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : cardData ? (
          <>
            <div className="mx-auto max-w-screen-md text-center mb-4 lg:mb-4">
              <h3 className="mb-4 text-3xl tracking-tight font-extrabold text-gray-900">
                <Link to={cardData.url} target="_blank">
                  {cardData.cardName}
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
                    onClick={handleStatusToggle}
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
        ) : (
          <div className="text-center p-8">
            <p className="text-gray-500">Select a card to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CardsCompareLIst;
