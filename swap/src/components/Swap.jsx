// src/components/Swap.jsx
import React, { useState } from 'react';

const Swap = () => {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDT');
  const [amount, setAmount] = useState('');

  const handleSwap = (e) => {
    e.preventDefault();
    console.log('Swapping tokens:', { fromToken, toToken, amount });
    alert(`Swapping ${amount} ${fromToken} to ${toToken}`);
    // Implement actual swap logic here
  };

  const handleFromTokenChange = (e) => {
    const symbol = e.target.value;
    console.log('From token changed to:', symbol);
    setFromToken(symbol);
  };

  const handleToTokenChange = (e) => {
    const symbol = e.target.value;
    console.log('To token changed to:', symbol);
    setToToken(symbol);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
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
                    <option value="ETH">ETH</option>
                    <option value="BTC">BTC</option>
                    <option value="USDT">USDT</option>
                    <option value="USDC">USDC</option>
                  </select>
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
                    <option value="ETH">ETH</option>
                    <option value="BTC">BTC</option>
                    <option value="USDT">USDT</option>
                    <option value="USDC">USDC</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="amount" className="form-label">
                    Amount
                  </label>
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
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Swap
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swap;
