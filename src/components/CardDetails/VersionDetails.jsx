import React, { useState, useEffect } from "react";
import { ChevronRight, AlertCircle, CheckCircle, FileText } from "lucide-react";

const VersionStatusList = ({ data, onStatusToggle, onVersionChange }) => {
  const [localData, setLocalData] = useState([]);
  const [loading, setLoading] = useState({});

  useEffect(() => {
    const sortedData = [...data]?.sort((a, b) => a.version - b.version);
    setLocalData(sortedData);
  }, [data]);

  const handleStatusToggle = async (version) => {
    try {
      setLoading((prev) => ({ ...prev, [version]: true }));
      await onStatusToggle(version);
      setLocalData((prevData) =>
        prevData.map((item) => {
          if (item.version === version) {
            return {
              ...item,
              status: item.status === "Open" ? "Closed" : "Pending",
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
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Total versions ({localData.length})
          </span>
        </div>
      </div>
      <div className="max-h-40 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Versions
              </th>
              <th className="text-left py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {localData?.map(
              ({ version, status }) =>
                version !== 1 && (
                  <tr key={version} className="hover:bg-gray-50">
                    <td className="py-2 px-4">
                      <button
                        onClick={() => onVersionChange(version)}
                        className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-500 hover:underline"
                      >
                        {version - 1} - {version}
                      </button>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1.5">
                        {/* {status.toLowerCase() === "open" ? (
                          <AlertCircle size={16} className="text-blue-500" />
                        ) : (
                          <CheckCircle size={16} className="text-green-500" />
                        )} */}
                        <span
                          className={`text-sm ${
                            status.toLowerCase() === "open"
                              ? "text-red-600"
                              : ""
                          }`}
                        >
                          {status === "Open" ? "Pending" : "Closed"}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2 ">
                      <button
                        onClick={() => handleStatusToggle(version)}
                        disabled={loading[version]}
                        className={`
                      inline-flex items-center gap-1 px-3 py-1 text-sm rounded
                      ${
                        loading[version]
                          ? "bg-gray-100 text-gray-400"
                          : status === "Open"
                          ? "bg-gray-100 text-black-400 hover:bg-blue-100"
                          : "bg-gray-100 text-black-400 hover:bg-green-100"
                      }
                      transition-colors duration-150 ease-in-out
                    `}
                      >
                        {loading[version]
                          ? "Updating..."
                          : status === "Open"
                          ? "Close"
                          : "Pending"}
                      </button>
                    </td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VersionStatusList;
