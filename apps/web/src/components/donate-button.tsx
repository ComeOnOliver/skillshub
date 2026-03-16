"use client";

import { useState } from "react";
import { Heart, X, Loader2, ExternalLink, AlertTriangle } from "lucide-react";

const TOKEN_CONFIG = {
  USDT: {
    address: "0x55d398326f99059fF775485246999027B3197955",
    decimals: 18,
    label: "USDT",
    color: "text-green-400",
  },
  USDC: {
    address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    decimals: 18,
    label: "USDC",
    color: "text-blue-400",
  },
} as const;

type TokenType = keyof typeof TOKEN_CONFIG;

const PRESET_AMOUNTS = [1, 5, 10, 25];

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
];

interface DonateButtonProps {
  authorBscAddress: string | null;
  authorName: string;
  repoId: string;
  toUserId: string;
}

export function DonateButton({
  authorBscAddress,
  authorName,
  repoId,
  toUserId,
}: DonateButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [token, setToken] = useState<TokenType>("USDT");
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [step, setStep] = useState<
    "amount" | "connecting" | "sending" | "success" | "error"
  >("amount");
  const [txHashes, setTxHashes] = useState<{
    author: string;
    platform: string;
  } | null>(null);
  const [error, setError] = useState("");

  const platformAddress = process.env.NEXT_PUBLIC_PLATFORM_BSC_ADDRESS;

  function resetModal() {
    setAmount("");
    setCustomAmount("");
    setStep("amount");
    setTxHashes(null);
    setError("");
    setToken("USDT");
  }

  function openModal() {
    resetModal();
    setShowModal(true);
  }

  const finalAmount = customAmount || amount;
  const numAmount = parseFloat(finalAmount);
  const authorAmount = numAmount ? (numAmount * 0.95).toFixed(2) : "0.00";
  const platformAmount = numAmount ? (numAmount * 0.05).toFixed(2) : "0.00";

  async function handleDonate() {
    if (!finalAmount || !numAmount || numAmount <= 0) return;
    if (!authorBscAddress || !platformAddress) return;

    setStep("connecting");
    setError("");

    try {
      if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new Error(
          "No Web3 wallet detected. Please install MetaMask or another BSC-compatible wallet."
        );
      }

      const { ethers } = await import("ethers");
      const provider = new ethers.BrowserProvider((window as any).ethereum);

      // Request account access
      await provider.send("eth_requestAccounts", []);

      // Check we're on BSC (chain ID 56)
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(56)) {
        // Try to switch to BSC
        try {
          await provider.send("wallet_switchEthereumChain", [
            { chainId: "0x38" },
          ]);
        } catch (switchErr: any) {
          // If BSC isn't added, add it
          if (switchErr.code === 4902) {
            await provider.send("wallet_addEthereumChain", [
              {
                chainId: "0x38",
                chainName: "BNB Smart Chain",
                nativeCurrency: {
                  name: "BNB",
                  symbol: "BNB",
                  decimals: 18,
                },
                rpcUrls: ["https://bsc-dataseed.binance.org/"],
                blockExplorerUrls: ["https://bscscan.com/"],
              },
            ]);
          } else {
            throw new Error("Please switch to BSC network in your wallet.");
          }
        }
      }

      setStep("sending");

      const signer = await provider.getSigner();
      const tokenCfg = TOKEN_CONFIG[token];
      const contract = new ethers.Contract(
        tokenCfg.address,
        ERC20_ABI,
        signer
      );

      const total = ethers.parseUnits(numAmount.toString(), tokenCfg.decimals);
      const toAuthor = (total * BigInt(95)) / BigInt(100);
      const toPlatform = total - toAuthor;

      // TX 1: 95% to author
      const tx1 = await contract.transfer(authorBscAddress, toAuthor);
      await tx1.wait();

      // TX 2: 5% to platform
      const tx2 = await contract.transfer(platformAddress, toPlatform);
      await tx2.wait();

      setTxHashes({ author: tx1.hash, platform: tx2.hash });

      // Record donation in DB
      try {
        await fetch("/api/donations/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toUserId,
            repoId,
            authorTxHash: tx1.hash,
            platformTxHash: tx2.hash,
            amount: numAmount,
            token,
          }),
        });
      } catch {
        // Non-critical — donation went through on-chain even if recording fails
      }

      setStep("success");
    } catch (err: any) {
      console.error("Donation failed:", err);
      setError(
        err?.info?.error?.message ||
          err?.message ||
          "Transaction failed. Please try again."
      );
      setStep("error");
    }
  }

  // If author has no BSC address, show disabled state
  if (!authorBscAddress) {
    return (
      <button
        disabled
        className="flex items-center gap-2 rounded border border-neutral-800/30 px-4 py-2 font-mono text-xs text-neutral-700 cursor-not-allowed"
        title="Author hasn't set up donations yet"
      >
        <Heart className="h-3.5 w-3.5" />
        tip
      </button>
    );
  }

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-center gap-2 rounded border border-neutral-800/50 px-4 py-2 font-mono text-xs text-neutral-500 transition-all hover:border-neon-lime/30 hover:text-neon-lime glow-box"
      >
        <Heart className="h-3.5 w-3.5" />
        tip
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded border border-neutral-800/60 bg-[#0a0a0a] shadow-2xl overflow-hidden">
            {/* Terminal title bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800/40">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="font-mono text-[10px] text-neutral-600">
                  donate.sh
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded p-1 text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              {/* Amount selection step */}
              {step === "amount" && (
                <>
                  <div className="font-mono text-xs mb-5 space-y-1.5">
                    <div className="text-neutral-500">
                      <span className="text-neon-cyan">$</span> tip --to{" "}
                      {authorName}
                    </div>
                    <div className="text-neutral-400">
                      <span className="text-neon-lime">→</span> send{" "}
                      {token} (BEP-20) via connected wallet
                    </div>
                  </div>

                  {/* Token selector */}
                  <div className="mb-4">
                    <div className="font-mono text-[10px] text-neutral-600 uppercase tracking-wider mb-2">
                      token
                    </div>
                    <div className="flex gap-2">
                      {(Object.keys(TOKEN_CONFIG) as TokenType[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => setToken(t)}
                          className={`flex-1 rounded border px-3 py-2 font-mono text-xs transition-all ${
                            token === t
                              ? `border-neon-cyan/40 bg-neon-cyan/5 ${TOKEN_CONFIG[t].color}`
                              : "border-neutral-800/40 text-neutral-600 hover:border-neutral-700 hover:text-neutral-400"
                          }`}
                        >
                          {TOKEN_CONFIG[t].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preset amounts */}
                  <div className="mb-4">
                    <div className="font-mono text-[10px] text-neutral-600 uppercase tracking-wider mb-2">
                      amount ({token})
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {PRESET_AMOUNTS.map((preset) => (
                        <button
                          key={preset}
                          onClick={() => {
                            setAmount(String(preset));
                            setCustomAmount("");
                          }}
                          className={`rounded border px-3 py-2 font-mono text-xs transition-all ${
                            amount === String(preset) && !customAmount
                              ? "border-neon-cyan/40 bg-neon-cyan/5 text-neon-cyan"
                              : "border-neutral-800/40 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300"
                          }`}
                        >
                          ${preset}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="custom amount..."
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setAmount("");
                      }}
                      className="w-full rounded border border-neutral-800/40 bg-[#050505] px-3 py-2 font-mono text-xs text-neutral-300 placeholder-neutral-700 focus:border-neon-cyan/30 focus:outline-none"
                    />
                  </div>

                  {/* Split preview */}
                  {numAmount > 0 && (
                    <div className="mb-4 rounded border border-neutral-800/40 bg-[#050505] p-3 font-mono text-xs">
                      <div className="flex justify-between text-neutral-500">
                        <span>to {authorName} (95%)</span>
                        <span className="text-neon-lime">
                          {authorAmount} {token}
                        </span>
                      </div>
                      <div className="flex justify-between text-neutral-600 mt-1">
                        <span>platform fee (5%)</span>
                        <span>
                          {platformAmount} {token}
                        </span>
                      </div>
                      <div className="mt-2 border-t border-neutral-800/40 pt-2 flex justify-between text-neutral-300">
                        <span>total</span>
                        <span>
                          {numAmount.toFixed(2)} {token}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleDonate}
                    disabled={!numAmount || numAmount <= 0}
                    className="w-full rounded border border-neon-lime/30 bg-neon-lime/5 py-3 font-mono text-sm text-neon-lime transition-all hover:bg-neon-lime/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    connect wallet & send {numAmount > 0 ? `${numAmount} ${token}` : ""}
                  </button>

                  <div className="mt-3 rounded border border-neutral-800/30 bg-neutral-900/30 p-2">
                    <p className="font-mono text-[10px] text-neutral-600 leading-relaxed text-center">
                      requires MetaMask or BSC-compatible wallet · BEP-20 only
                    </p>
                  </div>
                </>
              )}

              {/* Connecting step */}
              {step === "connecting" && (
                <div className="flex flex-col items-center py-8">
                  <Loader2 className="h-8 w-8 text-neon-cyan animate-spin mb-4" />
                  <p className="font-mono text-sm text-neutral-400">
                    connecting wallet...
                  </p>
                  <p className="font-mono text-[10px] text-neutral-600 mt-2">
                    approve the connection in your wallet
                  </p>
                </div>
              )}

              {/* Sending step */}
              {step === "sending" && (
                <div className="flex flex-col items-center py-8">
                  <Loader2 className="h-8 w-8 text-neon-lime animate-spin mb-4" />
                  <p className="font-mono text-sm text-neutral-400">
                    sending {token}...
                  </p>
                  <p className="font-mono text-[10px] text-neutral-600 mt-2">
                    confirm both transactions in your wallet
                  </p>
                  <p className="font-mono text-[10px] text-neutral-700 mt-1">
                    tx 1: {authorAmount} {token} → author
                  </p>
                  <p className="font-mono text-[10px] text-neutral-700">
                    tx 2: {platformAmount} {token} → platform
                  </p>
                </div>
              )}

              {/* Success step */}
              {step === "success" && txHashes && (
                <div className="py-4">
                  <div className="text-center mb-4">
                    <div className="font-mono text-2xl mb-2">✅</div>
                    <p className="font-mono text-sm text-neon-lime">
                      donation sent!
                    </p>
                    <p className="font-mono text-xs text-neutral-500 mt-1">
                      {numAmount} {token} to {authorName}
                    </p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <a
                      href={`https://bscscan.com/tx/${txHashes.author}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded border border-neutral-800/40 p-2 font-mono text-[10px] text-neutral-500 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all"
                    >
                      <ExternalLink className="h-3 w-3" />
                      author tx: {txHashes.author.slice(0, 10)}...
                      {txHashes.author.slice(-8)}
                    </a>
                    <a
                      href={`https://bscscan.com/tx/${txHashes.platform}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded border border-neutral-800/40 p-2 font-mono text-[10px] text-neutral-500 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all"
                    >
                      <ExternalLink className="h-3 w-3" />
                      platform tx: {txHashes.platform.slice(0, 10)}...
                      {txHashes.platform.slice(-8)}
                    </a>
                  </div>

                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full rounded border border-neutral-800/40 py-2 font-mono text-xs text-neutral-500 hover:border-neutral-700 hover:text-neutral-300 transition-all"
                  >
                    [close]
                  </button>
                </div>
              )}

              {/* Error step */}
              {step === "error" && (
                <div className="py-4">
                  <div className="rounded border border-red-900/30 bg-red-950/10 p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="font-mono text-xs text-red-400/80 leading-relaxed">
                        {error}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep("amount")}
                      className="flex-1 rounded border border-neutral-800/40 py-2 font-mono text-xs text-neutral-500 hover:border-neutral-700 hover:text-neutral-300 transition-all"
                    >
                      [try again]
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 rounded border border-neutral-800/40 py-2 font-mono text-xs text-neutral-500 hover:border-neutral-700 hover:text-neutral-300 transition-all"
                    >
                      [close]
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
