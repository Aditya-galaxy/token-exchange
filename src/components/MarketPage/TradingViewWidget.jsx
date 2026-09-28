"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

const TV_SCRIPT_SRC = "https://s3.tradingview.com/tv.js";
const TV_SCRIPT_ID = "tradingview-script";

/** Load tv.js once and reuse it across mounts. */
function loadTradingView() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.TradingView) return Promise.resolve(window.TradingView);

  return new Promise((resolve, reject) => {
    let script = document.getElementById(TV_SCRIPT_ID);
    if (!script) {
      script = document.createElement("script");
      script.id = TV_SCRIPT_ID;
      script.src = TV_SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", () => resolve(window.TradingView), { once: true });
    script.addEventListener("error", () => reject(new Error("Failed to load TradingView")), { once: true });
  });
}

const TradingViewWidget = ({ selectedSymbol = "BINANCE:BTCUSDT" }) => {
  const containerRef = useRef(null);
  // Follow the app's own light/dark toggle instead of hardcoding "dark".
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Copy the ref for the cleanup closure (react-hooks/exhaustive-deps).
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    loadTradingView()
      .then((TradingView) => {
        if (cancelled || !TradingView) return;
        new TradingView.widget({
          autosize: true,
          symbol: selectedSymbol,
          interval: "D",
          timezone: "Etc/UTC",
          theme: resolvedTheme === "light" ? "light" : "dark",
          style: "1",
          locale: "en",
          enable_publishing: false,
          allow_symbol_change: true,
          hide_side_toolbar: false,
          withdateranges: true,
          details: true,
          studies: ["MASimple@tv-basicstudies"],
          container_id: container.id,
        });
      })
      .catch((error) => {
        console.error("TradingView widget error:", error);
        if (!cancelled && container) {
          container.innerHTML =
            '<div class="flex h-full items-center justify-center text-sm text-muted-foreground">Chart unavailable</div>';
        }
      });

    return () => {
      cancelled = true;
      // Leave the shared <script> in place; just clear this instance.
      if (container) container.innerHTML = "";
    };
  }, [selectedSymbol, resolvedTheme]);

  return <div id="tradingview_widget" ref={containerRef} className="w-full h-[610px]" />;
};

export default TradingViewWidget;
