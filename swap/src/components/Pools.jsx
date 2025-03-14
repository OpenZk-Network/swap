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
        id: "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8",
        token0: {
          symbol: "USDC",
          name: "USD Coin",
          address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          logoURI: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png"
        },
        token1: {
          symbol: "ETH",
          name: "Ethereum",
          address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          logoURI: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png"
        },
        tvlUSD: 134891324.56,
        fee: 0.3
      },
      {
        id: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
        token0: {
          symbol: "USDT",
          name: "Tether USD",
          address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
          logoURI: "https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png"
        },
        token1: {
          symbol: "ETH",
          name: "Ethereum",
          address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          logoURI: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png"
        },
        tvlUSD: 127856123.89,
        fee: 0.05
      },
      {
        id: "0x3416cf6c708da44db2624d63ea0aaef7113527c6",
        token0: {
          symbol: "WBTC",
          name: "Wrapped Bitcoin",
          address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
          logoURI: "https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png"
        },
        token1: {
          symbol: "ETH",
          name: "Ethereum",
          address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          logoURI: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png"
        },
        tvlUSD: 103567890.12,
        fee: 0.3
      },
      {
        id: "0x5777d92f208679db4b9778590fa3cab3ac9e2168",
        token0: {
          symbol: "DAI",
          name: "Dai Stablecoin",
          address: "0x6b175474e89094c44da98b954eedeac495271d0f",
          logoURI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png"
        },
        token1: {
          symbol: "USDC",
          name: "USD Coin",
          address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          logoURI: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png"
        },
        tvlUSD: 89765432.10,
        fee: 0.01
      },
      {
        id: "0x4e68ccd3e89f51c3074ca5072bbac773960dfa36",
        token0: {
          symbol: "USDT",
          name: "Tether USD",
          address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
          logoURI: "https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png"
        },
        token1: {
          symbol: "USDC",
          name: "USD Coin",
          address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          logoURI: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png"
        },
        tvlUSD: 76543210.98,
        fee: 0.01
      },
      {
        id: "0xcbcdf9626bc03e24f779434178a73a0b4bad62ed",
        token0: {
          symbol: "LINK",
          name: "ChainLink Token",
          address: "0x514910771af9ca656af840dff83e8264ecf986ca",
          logoURI: "https://tokens.1inch.io/0x514910771af9ca656af840dff83e8264ecf986ca.png"
        },
        token1: {
          symbol: "ETH",
          name: "Ethereum",
          address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          logoURI: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png"
        },
        tvlUSD: 65432109.87,
        fee: 0.3
      }
    ];

    // Simulate API call delay
    setTimeout(() => {
      setPools(mockPools);
      setLoading(false);
    }, 500);
  }, []);

  // Format numbers to be more readable
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
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
                              <div className="position-relative" style={{ width: "48px", height: "24px" }}>
                                <img
                                  src={pool.token0.logoURI}
                                  alt={pool.token0.symbol}
                                  className="position-absolute"
                                  style={{ 
                                    width: "24px", 
                                    height: "24px", 
                                    left: 0,
                                    zIndex: 2,
                                    borderRadius: "50%"
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
                                    borderRadius: "50%"
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