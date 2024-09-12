interface SelectableButtonGroupProps<T> {
    label: string;
    options: T[];
    selectedOption: T | null;
    setSelectedOption: (option: T) => void;
  }
  
  const SelectableButtonGroup = <T extends string>({
    label,
    options,
    selectedOption,
    setSelectedOption,
  }: SelectableButtonGroupProps<T>) => {
    return (
      <div className="mb-4">
        <label className="block font-semibold mb-2">{label}</label>
        <div className="flex gap-2 flex-wrap">
          {options.map((option) => (
            <button
              key={option}
              className={`px-4 py-2 rounded-lg border ${
                selectedOption === option
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => setSelectedOption(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  };
  

export default SelectableButtonGroup;