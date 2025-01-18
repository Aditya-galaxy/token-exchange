"use client";
import React, { useEffect, useState } from 'react';

const TradingViewWidget = ({ selectedSymbol = "BINANCE:BTCUSDT" }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const loadTradingView = () => {
      const widget = new window.TradingView.widget({
        width: "100%",
        height: 600,
        symbol: selectedSymbol,
        interval: "D",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        details: true,
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: "tradingview_chart"
      });
    };

    // Check if TradingView is already loaded
    if (window.TradingView) {
      loadTradingView();
      return;
    }

    // Load TradingView script
    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = loadTradingView;
    document.head.appendChild(script);

    // Cleanup
    return () => {
      const container = document.getElementById('tradingview_chart');
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [isClient, selectedSymbol]);

  if (!isClient) {
    return (
      <div className="w-full h-[600px] bg-slate-800 flex items-center justify-center">
        <div className="text-white">Loading chart...</div>
      </div>
    );
  }

  return (
    <div id="tradingview_chart" className="w-full h-[600px]" />
  );
};

export default TradingViewWidget;