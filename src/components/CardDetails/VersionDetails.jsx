import React, { useState, useEffect } from "react";

const VersionStatusList = ({ data, onStatusToggle }) => {
  const [localData, setLocalData] = useState([]);
  const [loading, setLoading] = useState({});

  useEffect(() => {
    // Sort and set initial data
    const sortedData = [...data].sort((a, b) => a.version - b.version);
    setLocalData(sortedData);
  }, [data]);

  const handleStatusToggle = async (version) => {
    try {
      setLoading((prev) => ({ ...prev, [version]: true }));

      // Call the parent's onStatusToggle function and wait for it to complete
      await onStatusToggle(version);

      // Update local state to reflect the change
      setLocalData((prevData) =>
        prevData.map((item) => {
          if (item.version === version) {
            return {
              ...item,
              status: item.status === "Open" ? "Resolved" : "Open",
            };
          }
          return item;
        })
      );
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setLoading((prev) => ({ ...prev, [version]: false }));
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-2">
      <ul className="space-y-2 p-0">
        {localData.map(({ version, status }) => (
          <li
            key={version}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
          >
            <span className="font-medium">Version {version}</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Status:</span>
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  status.toLowerCase() === "open"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {status}
              </span>
              <button
                onClick={() => handleStatusToggle(version)}
                disabled={loading[version]}
                className={`focus:outline-none text-white font-small rounded-lg text-sm px-3 py-2
                  ${
                    loading[version]
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-yellow-400 hover:bg-yellow-500"
                  }`}
              >
                {loading[version]
                  ? "Updating..."
                  : status === "Open"
                  ? "Resolve"
                  : "Open"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VersionStatusList;
