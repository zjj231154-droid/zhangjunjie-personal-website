import React, { useRef } from "react";
import VariableProximity from "./VariableProximity.jsx";

export default function VariableTitle({
  label,
  as: Tag = "span",
  className = "",
  textClassName = "",
  radius = 150,
  falloff = "gaussian",
  from = "'wght' 650, 'opsz' 12",
  to = "'wght' 1000, 'opsz' 72",
}) {
  const containerRef = useRef(null);

  return (
    <Tag className={`variable-title ${className}`.trim()} ref={containerRef}>
      <VariableProximity
        label={label}
        className={textClassName}
        containerRef={containerRef}
        radius={radius}
        falloff={falloff}
        fromFontVariationSettings={from}
        toFontVariationSettings={to}
      />
    </Tag>
  );
}
