import React, { useState, useEffect } from "react";
import { ChevronRight, AlertCircle, CheckCircle, FileText } from "lucide-react";
import { formatDate } from "../../utils/formateDate";

const VersionStatusList = ({
  data,
  onStatusToggle,
  onVersionChange,
  activeVersion,
}) => {
  const [localData, setLocalData] = useState([]);
  const [loading, setLoading] = useState({});
  console.log("locatData", data);

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
              status: item.status === "Open" ? "Closed" : "Open",
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

  function formatDatelocal(date1) {
    const date = new Date(date1);

    // Create a formatter for just day, month, year
    const formatter = new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });

    // Break into parts
    const parts = formatter.formatToParts(date);

    // Extract
    const day = parts.find((p) => p.type === "day").value;
    const month = parts.find((p) => p.type === "month").value;
    const year = parts.find((p) => p.type === "year").value;

    // Reassemble with hyphens
    return `${day}-${month}-${year}`;
  }

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
                V1-date
              </th>
              <th className="text-left py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                V2-date
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
            {localData?.map(({ version, status, v_date }, index) => {
              if (version === 1) return null; // Skip version 1, as there is no previous version

              const prevVersion = localData.find(
                (item) => item.version === version - 1
              );
              const v1_date = prevVersion ? prevVersion.v_date : "N/A"; // Get v_date of version (N-1)
              const v2_date = v_date; // Current version’s date

              return (
                <tr
                  key={version}
                  className={`hover:bg-gray-50 cursor-pointer ${
                    activeVersion === version ? "bg-blue-100" : ""
                  }`}
                  onClick={() => onVersionChange(version)}
                >
                  <td className="py-2 px-4">
                    <button
                      onClick={() => onVersionChange(version)}
                      className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-500"
                    >
                      {version - 1} - {version}
                    </button>
                  </td>
                  <td className="py-2 px-4">{formatDatelocal(v1_date)}</td>
                  <td className="py-2 px-4">{formatDatelocal(v2_date)}</td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-sm ${
                          status.toLowerCase() === "open" ? "text-red-600" : ""
                        }`}
                      >
                        {status === "Open" ? "Open" : "Closed"}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-2 relative group">
                    <button
                      onClick={() => handleStatusToggle(version)}
                      disabled={activeVersion !== version}
                      className={`
      inline-flex items-center gap-1 px-3 py-1 text-sm rounded border
      ${
        loading[version] || activeVersion !== version
          ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
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
                        : "Open"}
                    </button>

                    {/* Tooltip positioned to the left */}
                    {activeVersion !== version && (
                      <div
                        className="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-48 
        rounded-lg bg-white px-3 py-2 text-xs text-gray-900 border border-gray-200 shadow-md z-10
        opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      >
                        Cannot change status unless the version is accessed
                        first.
                        <div className="absolute top-1/2 -translate-y-1/2 left-full ml-1 w-2 h-2 rotate-45 bg-white border border-gray-200"></div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VersionStatusList;
