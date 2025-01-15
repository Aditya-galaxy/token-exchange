import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navigation from "@/components/Navigation";
import MarketPage from "@/components/MarketPage/MarketPage";
import TradePage from "@/components/TradePage/TradePage";
import WalletPage from "@/components/WalletPage/WalletPage";
import TokenProvider from "@/Helper/Context";
import { Card, CardContent } from "../ui/card";
import TradingViewWidget from "../MarketPage/TradingViewWidget";

const App = () => {
  return (
      <TokenProvider>
        <Router>
            <Navigation />
          <main className="container mx-auto pt-24 pb-8 px-4">
          <Routes>
            <Route exact path="/" element={<><MarketPage />
              <Card>
            <CardContent />
            <TradingViewWidget />
            <CardContent />
          </Card></>}/>
              <Route path="/markets" element={<><MarketPage /><Card>
            <CardContent />
            <TradingViewWidget />
            <CardContent />
          </Card></>} />
              <Route path="/trade" element={<TradePage />} />
              <Route path="/wallet" element={<WalletPage />} />
            </Routes>
          </main>
      </Router>
    </TokenProvider>
  );
};

export default App;