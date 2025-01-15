import React, { useEffect, useRef, memo } from "react";
import { them

const TradingViewWidget = () => {
  const container = useRef();

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      //TradingView widget configuration
      "height": 610,
      "symbol": "BINANCE:BTCUSDT",
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": `${theme}`,
      "style": "1",
      "locale": "en",
      "details": true,
      "toolbar_bg": "#f1f3f6",
      "withdateranges": true,
      "enable_publishing": false,
      "allow_symbol_change": true,
      "container_id": "tradingview_widget"
    });
    container.current.appendChild(script);
  }, []);

  return <div id="tradingview_widget" ref={container}></div>;
};

export default memo(TradingViewWidget);