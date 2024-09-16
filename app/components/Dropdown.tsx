interface DropdownProps<T> {
    label: string;
    options: T[];
    setSelectedOption: (option: T) => void;
  }
  
  const Dropdown = <T extends string>({
    label,
    options,
    setSelectedOption,
  }:  DropdownProps<T>) => {
  
    return (
      <div className="mb-4">
        <label className="block font-semibold mb-2">{label}</label>
        <select
          className="flex gap-2 px-4 py-2 rounded-lg border bg-white w-full shadow-2xl"
          onChange={(e) => setSelectedOption(e.target.value as T)}
        >
          <option value="">選択してください</option>
          {options.map((option) => (
            <option
              key={option}
              className="px-4 py-2 hover:bg-blue-500 hover:text-white cursor-pointer"
              value={option}
            >
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  };
  
  export default Dropdown;