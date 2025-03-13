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
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
];

const SYNCSWAP_ROUTER_ADDRESS = "0xDC33Cd0df1504cF5A3366C2522ca0a96E43Fec92";

// Uniswap Router address (V2)
const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

const Swap = () => {
  const [tokens, setTokens] = useState([]);
  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [amount, setAmount] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [connected, setConnected] = useState(false);

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

      const allowance = await tokenContract.allowance(account, UNISWAP_ROUTER_ADDRESS);

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
      const router = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, signer);

      const amountIn = ethers.utils.parseUnits(amount, fromTokenDetails.decimals);

      // Set amountOutMin to 0 for demo purposes - in production
      // you'd want to set a minimum amount to prevent slippage
      const amountOutMin = 0;

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
      const tx = await tokenContract.approve(UNISWAP_ROUTER_ADDRESS, amountWei);

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
