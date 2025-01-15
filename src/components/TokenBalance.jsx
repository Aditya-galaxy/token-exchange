import React from "react";

const TokenBalance = ({ token }) => {
  return (
    <div>
      ≈ ${(token.balance * token.price).toFixed(2)}
    </div>
  );
};

export default TokenBalance;