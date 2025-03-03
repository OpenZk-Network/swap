// src/components/Swap.jsx
import React, { useState, useEffect } from "react";
import tokenList from "../assets/tokens.json";

const Swap = () => {
  const [tokens, setTokens] = useState([]);
  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [amount, setAmount] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Load tokens from JSON file
  useEffect(() => {
    setTokens(tokenList.tokens);
    // Set default tokens once the list is loaded
    if (tokenList.tokens.length > 0) {
      setFromToken(tokenList.tokens[0].symbol);
      setToToken(tokenList.tokens[2].symbol); // Default to USDT (index 2)
    }
  }, []);

  const handleSwap = (e) => {
    e.preventDefault();
    console.log("Swapping tokens:", { fromToken, toToken, amount });
    alert(`Swapping ${amount} ${fromToken} to ${toToken}`);
    // Implement actual swap logic here
  };

  const handleApprove = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setIsApproving(true);

    // Simulate approval process with timeout
    setTimeout(() => {
      setIsApproved(true);
      setIsApproving(false);
      console.log(`Approved ${amount} ${fromToken} for swap`);
    }, 1500);
  };

  // Reset approval when token or amount changes
  useEffect(() => {
    setIsApproved(false);
  }, [fromToken, toToken, amount]);

  const handleFromTokenChange = (e) => {
    const symbol = e.target.value;
    console.log("From token changed to:", symbol);
    setFromToken(symbol);
  };

  const handleToTokenChange = (e) => {
    const symbol = e.target.value;
    console.log("To token changed to:", symbol);
    setToToken(symbol);
  };

  // Find token details by symbol
  const getTokenBySymbol = (symbol) => {
    return tokens.find((token) => token.symbol === symbol) || null;
  };

  const fromTokenDetails = getTokenBySymbol(fromToken);
  const toTokenDetails = getTokenBySymbol(toToken);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Swap Tokens</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSwap}>
                <div className="mb-3">
                  <label htmlFor="fromToken" className="form-label">
                    From Token
                  </label>
                  <select
                    id="fromToken"
                    className="form-select"
                    value={fromToken}
                    onChange={handleFromTokenChange}
                    required
                  >
                    {tokens.map((token) => (
                      <option key={token.address} value={token.symbol}>
                        {token.symbol} - {token.name}
                      </option>
                    ))}
                  </select>
                  {fromTokenDetails && (
                    <div className="d-flex align-items-center mt-2">
                      <img
                        src={fromTokenDetails.logoURI}
                        alt={fromTokenDetails.symbol}
                        style={{ width: "24px", height: "24px", marginRight: "8px" }}
                        onError={(e) => {
                          e.target.src = "/api/placeholder/24/24";
                        }}
                      />
                      <small>
                        {fromTokenDetails.name} ({fromTokenDetails.symbol})
                      </small>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="toToken" className="form-label">
                    To Token
                  </label>
                  <select
                    id="toToken"
                    className="form-select"
                    value={toToken}
                    onChange={handleToTokenChange}
                    required
                  >
                    {tokens.map((token) => (
                      <option key={token.address} value={token.symbol}>
                        {token.symbol} - {token.name}
                      </option>
                    ))}
                  </select>
                  {toTokenDetails && (
                    <div className="d-flex align-items-center mt-2">
                      <img
                        src={toTokenDetails.logoURI}
                        alt={toTokenDetails.symbol}
                        style={{ width: "24px", height: "24px", marginRight: "8px" }}
                        onError={(e) => {
                          e.target.src = "/api/placeholder/24/24";
                        }}
                      />
                      <small>
                        {toTokenDetails.name} ({toTokenDetails.symbol})
                      </small>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="amount" className="form-label">
                    Amount
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      required
                      min="0"
                      step="0.000001"
                    />
                    <span className="input-group-text">{fromToken}</span>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="button"
                    className="btn btn-warning mb-2"
                    onClick={handleApprove}
                    disabled={isApproved || isApproving || !amount || parseFloat(amount) <= 0}
                  >
                    {isApproving ? "Approving..." : isApproved ? "Approved" : "Approve"}
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!isApproved || !amount || parseFloat(amount) <= 0}
                  >
                    Swap
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swap;
