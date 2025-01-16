import React, { useEffect, useRef, memo } from "react";

const TradingViewWidget = ({ selectedSymbol = "BINANCE:BTCUSDT" }) => {
  const container = useRef();
  const scriptRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && container.current) {
      // Remove existing widget if any
      while (container.current.firstChild) {
        container.current.removeChild(container.current.firstChild);
      }

      // Create new script element
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "autosize": true,
        "height": 610,
        "symbol": selectedSymbol,
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "isTransparent": true,
        "style": "1",
        "locale": "en",
        "details": true,
        "toolbar_bg": "#f1f3f6",
        "withdateranges": true,
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": "tradingview_widget"
      });

      // Store script reference
      scriptRef.current = script;
      container.current.appendChild(script);
    }

    // Cleanup function
    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
    };
  }, [selectedSymbol]);

  return (
    <div 
      id="tradingview_widget" 
      ref={container} 
      className="w-full h-[610px]"
    />
  );
};

export default memo(TradingViewWidget);