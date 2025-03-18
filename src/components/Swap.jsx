// src/components/Swap.jsx
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import tokenList from "../assets/tokens.json";

// ABI for ERC20 token - we only need the approve function
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
];

// Simplified Uniswap Router ABI (just what we need)
const UNISWAP_ROUTER_ABI = [
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"];

const SYNCSWAP_ROUTER_ABI = ["function swap(SwapPath[] memory paths, uint amountOutMin, uint deadline) external payable ensure(deadline) returns (IPool.TokenAmount memory amountOut))"];

// https://github.com/syncswap/core-contracts/blob/master/contracts/pool/stable/SyncSwapStablePool.sol#L487
const OTHER_ABI =["function getAmountOut(address _tokenIn, uint _amountIn, address _sender) external view override returns (uint _amountOut)"];

const SYNCSWAP_ROUTER_ADDRESS = "0xDC33Cd0df1504cF5A3366C2522ca0a96E43Fec92";

// Uniswap Router address (V2)
// const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

const Swap = () => {
  const [tokens, setTokens] = useState([]);
  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [amount, setAmount] = useState("");
  const [expectedOut, setExpectedOut] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [connected, setConnected] = useState(false);

  // Mock function to simulate getAmountOut from a DEX
  const mockGetAmountOut = (fromToken, toToken, amountIn) => {
    if (!amountIn || parseFloat(amountIn) <= 0 || !fromToken || !toToken) {
      return "0";
    }
    
    const fromTokenDetails = getTokenBySymbol(fromToken);
    const toTokenDetails = getTokenBySymbol(toToken);
    
    if (!fromTokenDetails || !toTokenDetails) {
      return "0";
    }
    
    // Mock exchange rates (in a real implementation, this would come from the DEX contract)
    const exchangeRates = {
      'ETH_USDT': 3000,    // 1 ETH = 3000 USDT
      'ETH_WBTC': 0.07,    // 1 ETH = 0.07 WBTC
      'WBTC_ETH': 14.28,   // 1 WBTC = 14.28 ETH
      'WBTC_USDT': 45000,  // 1 WBTC = 45000 USDT
      'USDT_ETH': 0.00033, // 1 USDT = 0.00033 ETH
      'USDT_WBTC': 0.000022, // 1 USDT = 0.000022 WBTC
      'USDC_USDT': 1,      // 1 USDC = 1 USDT
      'USDT_USDC': 1,      // 1 USDT = 1 USDC
      'DAI_USDT': 0.998,   // 1 DAI = 0.998 USDT
      'USDT_DAI': 1.002,   // 1 USDT = 1.002 DAI
      'LINK_ETH': 0.016,   // 1 LINK = 0.016 ETH
      'ETH_LINK': 62.5,    // 1 ETH = 62.5 LINK
      'UNI_ETH': 0.006,    // 1 UNI = 0.006 ETH
      'ETH_UNI': 166.67,   // 1 ETH = 166.67 UNI
    };
    
    const pairKey = `${fromToken}_${toToken}`;
    const rate = exchangeRates[pairKey] || 1; // Default to 1:1 if rate not defined
    
    // Calculate the expected amount out
    const amountOut = parseFloat(amountIn) * rate;
    
    // Format according to token decimals
    return amountOut.toFixed(toTokenDetails.decimals > 6 ? 6 : toTokenDetails.decimals);
  };

  // Calculate amount out when inputs change
  useEffect(() => {
    if (amount && parseFloat(amount) > 0 && fromToken && toToken) {
      const amountOut = mockGetAmountOut(fromToken, toToken, amount);
      setExpectedOut(amountOut);
    } else {
      setExpectedOut("");
    }
  }, [amount, fromToken, toToken]);

  // Load tokens from JSON file
  useEffect(() => {
    setTokens(tokenList.tokens);
    // Set default tokens once the list is loaded
    if (tokenList.tokens.length > 0) {
      setFromToken(tokenList.tokens[0].symbol);
      setToToken(tokenList.tokens[2].symbol); // Default to USDT (index 2)
    }
  }, []);

  // Connect to wallet
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        // Connect to MetaMask
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const signer = provider.getSigner();
        const account = await signer.getAddress();

        setProvider(provider);
        setSigner(signer);
        setAccount(account);
        setConnected(true);

        console.log("Connected to wallet:", account);

        // Check for network changes
        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });

        // Check for account changes
        window.ethereum.on("accountsChanged", (accounts) => {
          if (accounts.length === 0) {
            setConnected(false);
            setAccount("");
          } else {
            setAccount(accounts[0]);
          }
        });
      } else {
        alert("MetaMask not found. Please install MetaMask to use this app.");
      }
    } catch (error) {
      console.error("Failed to connect to wallet:", error);
      alert("Failed to connect to wallet. Please try again.");
    }
  };

  // Check allowance and update approval status
  const checkAllowance = async () => {
    if (!connected || !fromToken) return;

    try {
      const fromTokenDetails = getTokenBySymbol(fromToken);

      // Skip allowance check for ETH
      if (fromTokenDetails.symbol === "ETH") {
        setIsApproved(true);
        return;
      }

      const tokenContract = new ethers.Contract(fromTokenDetails.address, ERC20_ABI, signer);
      const amountWei = ethers.utils.parseUnits(amount || "0", fromTokenDetails.decimals);
      const allowance = await tokenContract.allowance(account, SYNCSWAP_ROUTER_ADDRESS);

      setIsApproved(allowance.gte(amountWei));
      console.log(
        "Current allowance:",
        ethers.utils.formatUnits(allowance, fromTokenDetails.decimals)
      );
    } catch (error) {
      console.error("Error checking allowance:", error);
    }
  };

  // Check allowance when amount or tokens change
  useEffect(() => {
    if (connected && amount && parseFloat(amount) > 0) {
      checkAllowance();
    } else {
      setIsApproved(false);
    }
  }, [fromToken, amount, connected, account]);

  const handleSwap = async (e) => {
    e.preventDefault();

    if (!connected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!isApproved) {
      alert("Please approve the token first");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const fromTokenDetails = getTokenBySymbol(fromToken);
    const toTokenDetails = getTokenBySymbol(toToken);

    try {
      setIsSwapping(true);

      // Special handling for ETH
      if (fromTokenDetails.symbol === "ETH") {
        // Implementation for ETH to token swap would go here
        // This is more complex and would require using WETH
        alert("ETH to token swaps require additional implementation");
        setIsSwapping(false);
        return;
      }

      // Regular ERC20 token swap
      const router = new ethers.Contract(SYNCSWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, signer);
      const amountIn = ethers.utils.parseUnits(amount, fromTokenDetails.decimals);

      // Calculate minimum amount out based on slippage
      // In a real implementation, we would get this from the DEX
      const expectedOutUnits = ethers.utils.parseUnits(expectedOut, toTokenDetails.decimals);
      const slippageFactor = 10000 - Math.floor(slippage * 100); // 0.5% -> 9950
      const amountOutMin = expectedOutUnits.mul(slippageFactor).div(10000);

      console.log(`Expected out: ${expectedOut} ${toTokenDetails.symbol}`);
      console.log(`Minimum out (with ${slippage}% slippage): ${ethers.utils.formatUnits(amountOutMin, toTokenDetails.decimals)} ${toTokenDetails.symbol}`);

      // Create the token path
      const path = [fromTokenDetails.address, toTokenDetails.address];

      // Set deadline to 20 minutes from now
      const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

      // Execute the swap
      const tx = await router.swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        path,
        account,
        deadline
      );

      console.log("Swap transaction submitted:", tx.hash);
      alert(`Swap transaction submitted! Hash: ${tx.hash}`);

      // Wait for transaction to be mined
      await tx.wait();
      console.log("Swap transaction confirmed!");
      alert("Swap completed successfully!");
    } catch (error) {
      console.error("Swap failed:", error);
      alert(`Swap failed: ${error.message || error}`);
    } finally {
      setIsSwapping(false);
    }
  };

  const handleApprove = async () => {
    if (!connected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const fromTokenDetails = getTokenBySymbol(fromToken);

    // No need to approve ETH
    if (fromTokenDetails.symbol === "ETH") {
      setIsApproved(true);
      return;
    }

    try {
      setIsApproving(true);

      const tokenContract = new ethers.Contract(fromTokenDetails.address, ERC20_ABI, signer);

      // Convert amount to token decimals
      const amountWei = ethers.utils.parseUnits(amount, fromTokenDetails.decimals);

      // Approve the router to spend tokens
      const tx = await tokenContract.approve(SYNCSWAP_ROUTER_ADDRESS, amountWei);
      console.log("Approval transaction submitted:", tx.hash);

      // Wait for transaction to be mined
      await tx.wait();

      console.log("Approval confirmed!");
      setIsApproved(true);
    } catch (error) {
      console.error("Approval failed:", error);
      alert(`Approval failed: ${error.message || error}`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleFromTokenChange = (e) => {
    const symbol = e.target.value;
    console.log("From token changed to:", symbol);
    setFromToken(symbol);
    setIsApproved(false); // Reset approval when token changes
    
    // Update expected output
    if (amount && parseFloat(amount) > 0 && symbol && toToken) {
      const amountOut = mockGetAmountOut(symbol, toToken, amount);
      setExpectedOut(amountOut);
    }
  };

  const handleToTokenChange = (e) => {
    const symbol = e.target.value;
    console.log("To token changed to:", symbol);
    setToToken(symbol);
    
    // Update expected output
    if (amount && parseFloat(amount) > 0 && fromToken && symbol) {
      const amountOut = mockGetAmountOut(fromToken, symbol, amount);
      setExpectedOut(amountOut);
    }
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
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h3 className="mb-0">Swap Tokens</h3>
              {!connected ? (
                <button className="btn btn-light btn-sm" onClick={connectWallet}>
                  Connect Wallet
                </button>
              ) : (
                <span className="badge bg-light text-dark">
                  {account.substring(0, 6)}...{account.substring(account.length - 4)}
                </span>
              )}
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

                {expectedOut && amount && (
                  <div className="mb-3">
                    <div className="card">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Expected Output:</span>
                          <span className="fw-bold">{expectedOut} {toToken}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Minimum Received:</span>
                          <span>
                            {parseFloat(expectedOut) * (1 - slippage / 100).toFixed(6)} {toToken}
                          </span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted">Slippage Tolerance:</span>
                          <div className="btn-group">
                            {[0.1, 0.5, 1.0].map((value) => (
                              <button
                                key={value}
                                type="button"
                                className={`btn btn-sm ${slippage === value ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSlippage(value)}
                              >
                                {value}%
                              </button>
                            ))}
                            <div className="input-group ms-2" style={{ width: '80px' }}>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={slippage}
                                onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                                min="0.1"
                                max="20"
                                step="0.1"
                              />
                              <span className="input-group-text">%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="d-grid gap-2">
                  <button
                    type="button"
                    className="btn btn-warning mb-2"
                    onClick={handleApprove}
                    disabled={
                      !connected ||
                      isApproved ||
                      isApproving ||
                      !amount ||
                      parseFloat(amount) <= 0 ||
                      (fromTokenDetails && fromTokenDetails.symbol === "ETH") // No need to approve ETH
                    }
                  >
                    {isApproving ? "Approving..." : isApproved ? "Approved" : "Approve"}
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      !connected || !isApproved || !amount || parseFloat(amount) <= 0 || isSwapping
                    }
                  >
                    {isSwapping ? "Swapping..." : "Swap"}
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