import React, { useEffect, useRef } from "react";
import { Mail } from "lucide-react";
import { gsap } from "gsap";
import "./PillNav.css";

export default function PillNav({
  logoText = "ZJJ",
  items,
  activeHref,
  contactHref,
  contactLabel = "联系我",
  ease = "power3.easeOut",
}) {
  const circleRefs = useRef([]);
  const timelineRefs = useRef([]);
  const navItemsRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const { width, height } = pill.getBoundingClientRect();
        const radius = ((width * width) / 4 + height * height) / (2 * height);
        const diameter = Math.ceil(2 * radius) + 2;
        const delta = Math.ceil(radius - Math.sqrt(Math.max(0, radius * radius - (width * width) / 4))) + 1;
        const originY = diameter - delta;

        circle.style.width = `${diameter}px`;
        circle.style.height = `${diameter}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector(".pill-label");
        const hoverLabel = pill.querySelector(".pill-label-hover");
        if (label) gsap.set(label, { y: 0 });
        if (hoverLabel) gsap.set(hoverLabel, { y: height + 12, opacity: 0 });

        timelineRefs.current[index]?.kill();
        const timeline = gsap.timeline({ paused: true });
        timeline.to(circle, { scale: 1.2, xPercent: -50, duration: 1.1, ease, overwrite: "auto" }, 0);
        if (label) timeline.to(label, { y: -(height + 8), duration: 1.1, ease, overwrite: "auto" }, 0);
        if (hoverLabel) timeline.to(hoverLabel, { y: 0, opacity: 1, duration: 1.1, ease, overwrite: "auto" }, 0);
        timelineRefs.current[index] = timeline;
      });
    };

    layout();
    window.addEventListener("resize", layout);
    document.fonts?.ready?.then(layout).catch(() => {});

    if (logoRef.current) {
      gsap.fromTo(logoRef.current, { scale: 0.88, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease });
    }
    if (navItemsRef.current) {
      gsap.fromTo(navItemsRef.current, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.45, ease });
    }

    return () => window.removeEventListener("resize", layout);
  }, [items, ease]);

  const handleEnter = (index) => {
    timelineRefs.current[index]?.tweenTo(timelineRefs.current[index].duration(), {
      duration: 0.28,
      ease,
      overwrite: "auto",
    });
  };

  const handleLeave = (index) => {
    timelineRefs.current[index]?.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: "auto",
    });
  };

  const handleLogoEnter = () => {
    if (!logoRef.current) return;
    gsap.fromTo(logoRef.current, { rotate: 0 }, { rotate: 360, duration: 0.35, ease, overwrite: "auto" });
  };

  const allItems = [...items, { label: contactLabel, href: contactHref, ariaLabel: contactLabel, icon: Mail, isCta: true }];

  return (
    <div className="pill-nav-shell">
      <nav className="pill-nav" aria-label="主导航">
        <a className="pill-logo" href="#top" aria-label="返回首页" onMouseEnter={handleLogoEnter} ref={logoRef}>
          {logoText}
        </a>
        <div className="pill-nav-items" ref={navItemsRef}>
          <ul className="pill-list" role="menubar">
            {allItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={`${item.href}-${item.label}`} role="none">
                  <a
                    role="menuitem"
                    href={item.href}
                    className={`pill${activeHref === item.href ? " is-active" : ""}${item.isCta ? " is-cta" : ""}`}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(index)}
                    onMouseLeave={() => handleLeave(index)}
                  >
                    <span
                      className="hover-circle"
                      aria-hidden="true"
                      ref={(el) => {
                        circleRefs.current[index] = el;
                      }}
                    />
                    <span className="label-stack">
                      <span className="pill-label">
                        {Icon ? <Icon size={16} /> : null}
                        {item.label}
                      </span>
                      <span className="pill-label-hover" aria-hidden="true">
                        {Icon ? <Icon size={16} /> : null}
                        {item.label}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
}
