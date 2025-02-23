"use client"
import React from "react";
import Navigation from "@/components/Navigation";
import TokenProvider from "@/Helper/Context";

const App = ({ children }) => {
  return (
    <TokenProvider>
      <Navigation />
      <main className="container mx-auto pt-24 pb-8 px-4">
        {children}
      </main>
    </TokenProvider>
  );
};

export default App;