import { useState } from "react";
import { CiSearch } from "react-icons/ci";
import { AiOutlineClose } from "react-icons/ai";
import "./index.scss";

const InputSearch = ({
  id,
  placeholder = "Search...",
  onSearch,
  onPressEnter,
  onInput,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (onInput) {
      onInput(e.target.value);
    }
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(inputValue);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (onSearch) onSearch(inputValue);
      if (onPressEnter) onPressEnter();
    }
  };

  const handleClear = () => {
    setInputValue("");
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <div className={`search${isFocused ? " search--focus" : ""}`}>
      <input
        id={id}
        onInput={(e) => handleInputChange(e)}
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {inputValue && (
        <span
          className="search__clear"
          onClick={handleClear}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleClear();
          }}
        >
          <AiOutlineClose size={18} />
        </span>
      )}
      <button className="search__button" onClick={handleSearch} tabIndex={-1}>
        <CiSearch size={22} />
      </button>
    </div>
  );
};

export default InputSearch;
