// src/components/Pools.jsx
import React, { useState, useEffect } from "react";

const Pools = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, you would fetch this data from a blockchain API or subgraph
    // Here we'll use mock data for demonstration
    const mockPools = [
      {
        id: "0xBa8Dcd8d97e97fB9adcd2A825A66c29A8308dc23",
        token0: {
          symbol: "USDC",
          name: "USD Coin",
          address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          logoURI: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
        },
        token1: {
          symbol: "wETH",
          name: "Ethereum",
          address: "",
          logoURI: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
        },
        tvlUSD: 134891324.56,
        fee: 0.3,
      },
    ];

    // Simulate API call delay
    setTimeout(() => {
      setPools(mockPools);
      setLoading(false);
    }, 500);
  }, []);

  // Format numbers to be more readable
  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Format address to be shorter
  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Liquidity Pools</h3>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading pools data...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Pool</th>
                        <th>Pair</th>
                        <th>Fee</th>
                        <th className="text-end">TVL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pools.map((pool) => (
                        <tr key={pool.id}>
                          <td>
                            <a
                              href={`https://etherscan.io/address/${pool.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-decoration-none"
                            >
                              {formatAddress(pool.id)}
                            </a>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div
                                className="position-relative"
                                style={{ width: "48px", height: "24px" }}
                              >
                                <img
                                  src={pool.token0.logoURI}
                                  alt={pool.token0.symbol}
                                  className="position-absolute"
                                  style={{
                                    width: "24px",
                                    height: "24px",
                                    left: 0,
                                    zIndex: 2,
                                    borderRadius: "50%",
                                  }}
                                  onError={(e) => {
                                    e.target.src = "/api/placeholder/24/24";
                                  }}
                                />
                                <img
                                  src={pool.token1.logoURI}
                                  alt={pool.token1.symbol}
                                  className="position-absolute"
                                  style={{
                                    width: "24px",
                                    height: "24px",
                                    left: "16px",
                                    zIndex: 1,
                                    borderRadius: "50%",
                                  }}
                                  onError={(e) => {
                                    e.target.src = "/api/placeholder/24/24";
                                  }}
                                />
                              </div>
                              <div className="ms-3">
                                <strong>
                                  {pool.token0.symbol}/{pool.token1.symbol}
                                </strong>
                              </div>
                            </div>
                          </td>
                          <td>{pool.fee * 100}%</td>
                          <td className="text-end">{formatNumber(pool.tvlUSD)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pools;
