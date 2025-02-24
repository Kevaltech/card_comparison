import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Sidebar } from "./components/CardList/Sidebar";
import { CardContent } from "./components/CardDetails/CardContent";
import { Search } from "lucide-react";
import { Home } from "./components/home/Home";

function CardsCompareList() {
  const navigate = useNavigate();
  const { cardId: routeCardId } = useParams();
  const containerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cardData, setCardData] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isOpenDropdownVisible, setIsOpenDropdownVisible] = useState(true);
  const [isResolvedDropdownVisible, setIsResolvedDropdownVisible] =
    useState(true);
  const [banksData, setBanksData] = useState({});
  const [generalBanksData, setGeneralBanksData] = useState({});
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showOverview, setOverview] = useState(false);

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
    setStatusMessage({ text: errorMessage });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const fetchHtmlContent = async (cardId) => {
    setOverview(true);
    if (!cardId) return;

    setIsLoading(true);
    setError(null);
    setSelectedCard(cardId);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_COMPARE_URL}${cardId}`,
        {
          headers: { "ngrok-skip-browser-warning": "234242" },
        }
      );
      setCardData(response.data);
      navigate(`/compare/${cardId}`, { replace: true });
    } catch (err) {
      console.error("Fetch error:", err);
      handleApiError(err, "Failed to fetch card details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCardsData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_CARDS_STATUS_URL}`,
        {
          headers: { "ngrok-skip-browser-warning": "234242" },
        }
      );

      if (!response.data || typeof response.data !== "object") {
        throw new Error("Invalid data format received from server");
      }

      const { General, ...regularBanks } = response.data;
      setBanksData(regularBanks);
      setGeneralBanksData(General || {});

      // Only select first card if there's no routeCardId
      // if (!routeCardId) {
      //   const firstBank = Object.values(regularBanks)[0];
      //   if (firstBank?.open.length > 0) {
      //     fetchHtmlContent(firstBank.open[0].cardId);
      //   } else if (firstBank?.resolve.length > 0) {
      //     fetchHtmlContent(firstBank.resolve[0].cardId);
      //   }
      // }
    } catch (err) {
      console.error("Error fetching cards data:", err);
      handleApiError(err, "Failed to load cards data");
      setBanksData({});
      setGeneralBanksData({});
    }
  };

  // Initial data load
  useEffect(() => {
    fetchCardsData();
  }, []);

  // Watch for URL changes and update card data
  useEffect(() => {
    if (routeCardId && routeCardId !== selectedCard) {
      fetchHtmlContent(routeCardId);
    }
  }, [routeCardId]);

  const handleStatusToggle = async (version) => {
    if (!selectedCard || !cardData || statusUpdateLoading) return;

    setStatusUpdateLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_UPDATE_STATUS_URL}${selectedCard}/${version}/`,
        {
          headers: { "ngrok-skip-browser-warning": "234242" },
        }
      );

      if (response.data.status === "success") {
        setStatusMessage({
          text: `Successfully updated card status to ${response.data.data.status}`,
        });

        await fetchCardsData();
        setCardData((prev) =>
          prev
            ? {
                ...prev,
                cardStatus: response.data.data.status,
              }
            : null
        );
      }
    } catch (err) {
      handleApiError(err, "Failed to update card status");
    } finally {
      setStatusUpdateLoading(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  useEffect(() => {
    if (!cardData?.cardHtml || !containerRef.current) return;

    const handleStyleTags = () => {
      const styleTags = containerRef?.current?.getElementsByTagName("style");
      Array.from(styleTags || []).forEach((styleTag) => {
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
      const scripts = containerRef.current?.getElementsByTagName("script");
      Array.from(scripts || []).forEach((script) => {
        if (script.getAttribute("data-executed")) return;

        const newScript = document.createElement("script");
        Array.from(script.attributes).forEach((attr) => {
          if (attr.name !== "data-executed") {
            newScript.setAttribute(attr.name, attr.value);
          }
        });

        newScript.textContent = script.textContent;
        script.setAttribute("data-executed", "true");
        script.parentNode?.removeChild(script);
        document.body.appendChild(newScript);
      });
    };

    handleStyleTags();
    handleScriptTags();

    if (typeof window.initializeTabs === "function") {
      try {
        window.initializeTabs();
        // window.navigateDiff();
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
  }, [cardData?.cardHtml]);

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

      <Sidebar
        banksData={banksData}
        generalBankData={generalBanksData}
        selectedCard={selectedCard}
        onCardSelect={fetchHtmlContent}
        isOpenVisible={isOpenDropdownVisible}
        setIsOpenVisible={setIsOpenDropdownVisible}
        isResolvedVisible={isResolvedDropdownVisible}
        setIsResolvedVisible={setIsResolvedDropdownVisible}
        setOverview={setOverview}
        showOverview={showOverview}
      />
      <main
        className="flex-1 overflow-y-auto"
        style={{
          marginLeft: "min(90vw, max(300px, 23%))",
          height: "100vh",
        }}
      >
        {showOverview ? (
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : cardData ? (
              <CardContent
                key={cardData.cardId}
                cardData={cardData}
                onStatusToggle={handleStatusToggle}
                containerRef={containerRef}
              />
            ) : (
              <div className="text-center p-8">
                <p className="text-gray-500">Select a card to view details</p>
              </div>
            )}
          </div>
        ) : (
          <Home />
        )}
      </main>
    </div>
  );
}

export default CardsCompareList;
