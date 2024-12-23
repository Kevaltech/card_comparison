export const formatDate = (dateString) => {
  const date = new Date(dateString);

  // Format options
  const options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // Ensures 12-hour format with am/pm
  };

  // Format date
  return date.toLocaleString("en-IN", options).replace(",", "");
};
