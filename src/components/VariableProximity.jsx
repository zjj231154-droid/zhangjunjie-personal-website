import React, { forwardRef, useEffect, useMemo, useRef } from "react";
import { motion } from "motion/react";
import "./VariableProximity.css";

function useAnimationFrame(callback) {
  useEffect(() => {
    let frameId;

    const loop = () => {
      callback();
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [callback]);
}

function useMousePositionRef(containerRef) {
  const positionRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const updatePosition = (x, y) => {
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        positionRef.current = { x: x - rect.left, y: y - rect.top };
      } else {
        positionRef.current = { x, y };
      }
    };

    const handleMouseMove = (ev) => updatePosition(ev.clientX, ev.clientY);
    const handleTouchMove = (ev) => {
      const touch = ev.touches[0];
      if (touch) updatePosition(touch.clientX, touch.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [containerRef]);

  return positionRef;
}

const VariableProximity = forwardRef(
  (
    {
      label,
      fromFontVariationSettings = "'wght' 650, 'opsz' 12",
      toFontVariationSettings = "'wght' 1000, 'opsz' 64",
      containerRef,
      radius = 120,
      falloff = "linear",
      className = "",
      onClick,
      style,
      ...restProps
    },
    ref,
  ) => {
    const letterRefs = useRef([]);
    const interpolatedSettingsRef = useRef([]);
    const mousePositionRef = useMousePositionRef(containerRef);
    const lastPositionRef = useRef({ x: null, y: null });

    const parsedSettings = useMemo(() => {
      const parseSettings = (settingsStr) =>
        new Map(
          settingsStr
            .split(",")
            .map((s) => s.trim())
            .map((s) => {
              const [name, value] = s.split(" ");
              return [name.replace(/['"]/g, ""), parseFloat(value)];
            }),
        );

      const fromSettings = parseSettings(fromFontVariationSettings);
      const toSettings = parseSettings(toFontVariationSettings);

      return Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
        axis,
        fromValue,
        toValue: toSettings.get(axis) ?? fromValue,
      }));
    }, [fromFontVariationSettings, toFontVariationSettings]);

    const fromWeight = parsedSettings.find((setting) => setting.axis === "wght")?.fromValue ?? 650;

    const calculateFalloff = (distance) => {
      const norm = Math.min(Math.max(1 - distance / radius, 0), 1);

      switch (falloff) {
        case "exponential":
          return norm ** 2;
        case "gaussian":
          return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
        case "linear":
        default:
          return norm;
      }
    };

    useAnimationFrame(() => {
      if (!containerRef?.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const { x, y } = mousePositionRef.current;

      if (lastPositionRef.current.x === x && lastPositionRef.current.y === y) return;
      lastPositionRef.current = { x, y };

      letterRefs.current.forEach((letterRef, index) => {
        if (!letterRef) return;

        const rect = letterRef.getBoundingClientRect();
        const letterCenterX = rect.left + rect.width / 2 - containerRect.left;
        const letterCenterY = rect.top + rect.height / 2 - containerRect.top;
        const distance = Math.sqrt((x - letterCenterX) ** 2 + (y - letterCenterY) ** 2);

        if (distance >= radius) {
          letterRef.style.fontVariationSettings = fromFontVariationSettings;
          letterRef.style.fontWeight = `${fromWeight}`;
          letterRef.style.transform = "translateY(0) scale(1)";
          letterRef.style.textShadow = "none";
          return;
        }

        const falloffValue = calculateFalloff(distance);
        let weightValue = fromWeight;
        const newSettings = parsedSettings
          .map(({ axis, fromValue, toValue }) => {
            const interpolatedValue = fromValue + (toValue - fromValue) * falloffValue;
            if (axis === "wght") weightValue = interpolatedValue;
            return `'${axis}' ${interpolatedValue}`;
          })
          .join(", ");

        interpolatedSettingsRef.current[index] = newSettings;
        letterRef.style.fontVariationSettings = newSettings;
        letterRef.style.fontWeight = `${Math.round(weightValue)}`;
        letterRef.style.transform = `translateY(${-1.5 * falloffValue}px) scale(${1 + 0.055 * falloffValue})`;
        letterRef.style.textShadow = `0 0 ${18 * falloffValue}px rgba(184, 255, 8, ${0.2 * falloffValue})`;
      });
    });

    const words = label.split(" ");
    let letterIndex = 0;

    return (
      <span
        ref={ref}
        className={`${className} variable-proximity`.trim()}
        onClick={onClick}
        style={{ display: "inline", ...style }}
        {...restProps}
      >
        {words.map((word, wordIndex) => (
          <span className="variable-word" key={`${word}-${wordIndex}`}>
            {word.split("").map((letter) => {
              const currentLetterIndex = letterIndex;
              letterIndex += 1;

              return (
                <motion.span
                  aria-hidden="true"
                  className="variable-letter"
                  key={`${letter}-${currentLetterIndex}`}
                  ref={(el) => {
                    letterRefs.current[currentLetterIndex] = el;
                  }}
                  style={{
                    fontVariationSettings: interpolatedSettingsRef.current[currentLetterIndex] || fromFontVariationSettings,
                    fontWeight: fromWeight,
                  }}
                >
                  {letter}
                </motion.span>
              );
            })}
            {wordIndex < words.length - 1 && <span className="variable-space">&nbsp;</span>}
          </span>
        ))}
        <span className="sr-only">{label}</span>
      </span>
    );
  },
);

VariableProximity.displayName = "VariableProximity";

export default VariableProximity;
