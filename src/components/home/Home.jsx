import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Loader2,
  Building2,
  Calendar,
  User,
  Star,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";

export const Home = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
    document.body.style.position = "static";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.position = "";
    };
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(
        "https://0491-59-162-82-6.ngrok-free.app/dashboard-stats/",
        {
          headers: { "ngrok-skip-browser-warning": "234242" },
        }
      );
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortedCards = () => {
    if (!stats || !stats.openCardsList) return [];

    const sortedCards = [...stats.openCardsList];
    if (sortConfig.key !== null) {
      sortedCards.sort((a, b) => {
        let aValue = a[sortConfig.key] || "";
        let bValue = b[sortConfig.key] || "";

        if (sortConfig.key === "last_update") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortedCards;
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return (
        <ArrowUpDown className="w-4 h-4 ml-1 inline-block text-gray-400" />
      );
    }
    return sortConfig.direction === "ascending" ? (
      <ArrowUp className="w-4 h-4 ml-1 inline-block text-blue-500" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1 inline-block text-blue-500" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <AlertCircle className="w-6 h-6 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen overflow-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      {/* Main Cards Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Main Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="p-2 bg-blue-50 rounded-lg w-fit mb-4">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Cards
            </h3>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold">
                {stats.mainCards.total}
              </span>
              <span className="ml-2 text-sm text-gray-500">cards</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="p-2 bg-yellow-50 rounded-lg w-fit mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Open Cards
            </h3>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold">{stats.mainCards.open}</span>
              <span className="ml-2 text-sm text-gray-500">pending</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="p-2 bg-green-50 rounded-lg w-fit mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Resolved Cards
            </h3>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold">
                {stats.mainCards.resolved}
              </span>
              <span className="ml-2 text-sm text-gray-500">completed</span>
            </div>
          </div>
        </div>
      </div>
      {/* General Cards Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">General Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="p-2 bg-purple-50 rounded-lg w-fit mb-4">
              <Star className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total General Cards
            </h3>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold">
                {stats.generalCards.total}
              </span>
              <span className="ml-2 text-sm text-gray-500">cards</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="p-2 bg-yellow-50 rounded-lg w-fit mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Open General Cards
            </h3>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold">
                {stats.generalCards.open}
              </span>
              <span className="ml-2 text-sm text-gray-500">pending</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="p-2 bg-green-50 rounded-lg w-fit mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Resolved General Cards
            </h3>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold">
                {stats.generalCards.resolved}
              </span>
              <span className="ml-2 text-sm text-gray-500">completed</span>
            </div>
          </div>
        </div>
      </div>
      {/* Open Cards List */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Open Cards</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("card_name")}
                >
                  Card Details {getSortIcon("card_name")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("bank_name")}
                >
                  Bank {getSortIcon("bank_name")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("last_update")}
                >
                  Last Updated {getSortIcon("last_update")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getSortedCards().map((card) => (
                <tr key={card.CardId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {card.card_name}
                          {card.is_general && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <Star className="w-3 h-3 mr-1" />
                              General
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          #{card.CardId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {card.bank_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">
                        {new Date(card.last_update).toLocaleDateString()} at{" "}
                        {new Date(card.last_update).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        (window.location.href = `/compare/${card.CardId}`)
                      }
                      className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
                    >
                      <span className="text-sm">View Details</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
