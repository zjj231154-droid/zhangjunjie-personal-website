import React, { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import "./SplitText.css";

const playedOnceKeys = new Set();

function splitIntoParts(text, splitType) {
  if (splitType === "words") {
    return text.split(/(\s+)/).map((part) => ({
      value: part,
      isSpace: /^\s+$/.test(part),
    }));
  }

  return Array.from(text).map((part) => ({
    value: part,
    isSpace: /^\s+$/.test(part),
  }));
}

export default function SplitText({
  tag: Tag = "span",
  text,
  className = "",
  splitType = "chars",
  delay = 0.028,
  duration = 0.75,
  ease = "power3.out",
  from = { opacity: 0, yPercent: 115, rotateX: -24, filter: "blur(8px)" },
  to = { opacity: 1, yPercent: 0, rotateX: 0, filter: "blur(0px)" },
  onceKey,
  textAlign,
}) {
  const rootRef = useRef(null);
  const key = onceKey || `${text}-${splitType}`;
  const parts = useMemo(() => splitIntoParts(text, splitType), [text, splitType]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const targets = root.querySelectorAll("[data-split-unit='true']");
    if (!targets.length) return undefined;

    if (playedOnceKeys.has(key)) {
      gsap.set(targets, to);
      return undefined;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(targets, from, {
        ...to,
        duration,
        ease,
        stagger: delay,
        clearProps: "transform,filter",
        onComplete: () => playedOnceKeys.add(key),
      });
    }, root);

    return () => ctx.revert();
  }, [delay, duration, ease, from, key, to]);

  return (
    <Tag
      ref={rootRef}
      className={`split-text ${className}`.trim()}
      style={textAlign ? { textAlign } : undefined}
      data-split-once-key={key}
    >
      {parts.map((part, index) => {
        if (part.isSpace) {
          return splitType === "words" ? " " : "\u00A0";
        }

        return (
          <span className="split-mask" aria-hidden="true" key={`${part.value}-${index}`}>
            <span className="split-unit" data-split-unit="true">
              {part.value}
            </span>
          </span>
        );
      })}
      <span className="split-reader">{text}</span>
    </Tag>
  );
}
