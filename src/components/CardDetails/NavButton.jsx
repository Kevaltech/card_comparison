import React from "react";
import { ChevronRight } from "lucide-react";

const NavButton = (props) => {
  const { icon, label, active, hasDropdown } = props;

  const buttonClass = `
    flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-gray-100
    ${active ? "bg-blue-50 text-blue-600" : "text-gray-700"}
    transition-colors duration-150 ease-in-out
  `;

  return (
    <button className={buttonClass}>
      {icon}
      <span>{label}</span>
      {hasDropdown && (
        <ChevronRight size={14} className="text-gray-400 rotate-90" />
      )}
    </button>
  );
};

export default NavButton;
