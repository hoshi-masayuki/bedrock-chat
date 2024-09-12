import { useState } from "react";

interface DropdownProps<T> {
    label: string;
    options: T[];
    selectedOption: T | null;
    setSelectedOption: (option: T) => void;
  }
  
  const Dropdown = <T extends string>({
    label,
    options,
    selectedOption,
    setSelectedOption,
  }:  DropdownProps<T>) => {
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
  
    return (
      <div className="mb-4 relative">
        <label className="block font-semibold mb-2">{label}</label>
        <button
          className="flex gap-2t px-4 py-2 rounded-lg border bg-gray-200"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {selectedOption ? selectedOption : "選択してください"}
        </button>
        {showDropdown && (
          <ul className="absolute left-0 w-full bg-white border mt-2 z-10 rounded-lg shadow-lg">
            {options.map((option) => (
              <li
                key={option}
                className="px-4 py-2 hover:bg-blue-500 hover:text-white cursor-pointer"
                onClick={() => {
                  setSelectedOption(option);
                  setShowDropdown(false); // ドロップダウンを閉じる
                }}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  
  export default Dropdown;