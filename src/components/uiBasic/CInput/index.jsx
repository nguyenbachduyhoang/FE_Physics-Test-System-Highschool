/* eslint-disable react/prop-types */
import { Input } from "antd";
import { useState } from "react";
import "./index.scss";
import { ImParagraphLeft } from "react-icons/im";

export default function CInput(props) {
  const {
    label,
    value,
    onChange,
    type,
    name,
    disabled = false,
    prefix,
  } = props;

  const [isFocused, setIsFocused] = useState(false);
  const isActive = isFocused || value;

  return (
    <div
      className={`floating-input ${isActive ? "active" : ""} ${
        disabled ? "disabled" : ""
      }`}
    >
      <label className="floating-label">{label}</label>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        name={name}
        disabled={disabled}
      />
      {prefix ? (
        <span className="input-prefix">{prefix}</span>
      ) : (
        <span className="input-prefix-default">
          <ImParagraphLeft />
        </span>
      )}
    </div>
  );
}
