/* eslint-disable react/prop-types */
import { Input } from "antd";
import  { useEffect, useState } from "react";
import "./index.scss";

const CInputLabel = ({
  label,
  defaultValue,
  value,
  onChange,
  disabled,
  type = "text",
  ...inputProps
}) => {
  const [hasFocus, setHasFocus] = useState(false);
  const [inputValue, setInputValue] = useState(value || defaultValue);

  useEffect(() => {
    // Cập nhật inputValue khi value thay đổi
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [defaultValue, value]);

  const handleInputChange = (e) => {
    let value = e.target.value;
    if (type === "number") {
      value = value.replace(/[^0-9]/g, "");
    }
    setInputValue(value);
    if (onChange) {
      onChange({
        ...e,
        target: { ...e.target, value },
      });
    }
  };

  return (
    <div className={`input-with-label${inputProps.prefix ? " has-prefix" : ""}`}>
      <div className="input-wrapper">
        <Input
          {...inputProps}
          value={inputValue}
          disabled={disabled}
          onChange={handleInputChange}
          onFocus={() => setHasFocus(true)}
          onBlur={() => setHasFocus(false)}
          className="input-field"
          {...(inputProps.prefix && {
            prefix: (
              <span style={{ color: "#128DBA", fontSize: 20 }}>
                {inputProps.prefix}
              </span>
            ),
          })}
        />
        <div
          className={`label
    ${
      hasFocus ||
      (inputValue !== undefined && inputValue !== "") ||
      (defaultValue !== undefined && defaultValue !== "") ||
      disabled
        ? "active"
        : ""
    }
    ${disabled ? "disabled" : ""}`}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

export default CInputLabel;
