import { useState } from "react";
import { DatePicker } from "antd";
import { BiCalendar } from "react-icons/bi";
import "./index.scss";
import dayjs from "dayjs";

const CdatePicker = ({
  value,
  onChange,
  picker,
  className,
  placeholder,
  disabled,
  style,
  format,
  showTime,
  defaultValue,
  label,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const parsedValue = dayjs.isDayjs(value)
    ? value
    : value
    ? dayjs(value)
    : null;
  const parsedDefaultValue = dayjs.isDayjs(defaultValue)
    ? defaultValue
    : defaultValue
    ? dayjs(defaultValue)
    : null;

  const isLabelFloating =
    isFocused ||
    (parsedValue && parsedValue.isValid()) ||
    (parsedDefaultValue && parsedDefaultValue.isValid()) ||
    disabled;

  return (
    <div
      className={`custom-select-container has-prefix${
        isLabelFloating ? " focused" : ""
      }${disabled ? " disabled" : ""}`}
    >
      {label && <label className="floating-label">{label}</label>}
      <div className="datepicker-prefix-wrapper">
        <span className="datepicker-prefix-icon">
          <BiCalendar style={{ color: "#128DBA", fontSize: 20 }} />
        </span>
        <DatePicker
          defaultValue={parsedDefaultValue}
          picker={picker}
          className={`custom-select with-prefix ${className || ""}`}
          value={parsedValue}
          onChange={(val, option) => {
            onChange?.(val, option);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          style={style}
          format={format}
          showTime={showTime}
          placeholder={typeof placeholder !== "undefined" ? placeholder : ""}
          suffixIcon={null}
          inputReadOnly={true}
        />
      </div>
    </div>
  );
};

export default CdatePicker;
