"use client";
import React, { useEffect, useRef, useState } from 'react';

const TradingViewWidget = ({ selectedSymbol = "BINANCE:BTCUSDT" }) => {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    try {
      const widgetConfig = {
        autosize: true,
        symbol: selectedSymbol,
        interval: "D",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: "tradingview_widget",
        hide_side_toolbar: false,
        withdateranges: true,
        details: true,
        hotlist: true,
        calendar: false,
        studies: ["MASimple@tv-basicstudies"],
        show_popup_button: true,
        popup_width: "1000",
        popup_height: "650"
      };

      // Load TradingView script
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.type = "text/javascript";
      script.onload = function() {
        if (typeof TradingView !== 'undefined') {
          new TradingView.widget({
            ...widgetConfig,
            container: containerRef.current
          });
        }
      };

      document.head.appendChild(script);

      return () => {
        // Cleanup script
        const existingScript = document.querySelector(`script[src="${script.src}"]`);
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
        // Clear container
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      };
    } catch (error) {
      console.error('TradingView widget error:', error);
    }
  }, [mounted, selectedSymbol]);

  if (!mounted) {
    return (
      <div className="w-full h-[610px] bg-background/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading chart...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="tradingview_widget"
      ref={containerRef}
      className="w-full h-[610px]"
    />
  );
};

export default TradingViewWidget;