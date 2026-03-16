"use client";

import { useState, useEffect } from "react";
import { Wallet, Copy, Check, AlertTriangle, RefreshCw } from "lucide-react";

export default function WalletSetupPage() {
  const [bscAddress, setBscAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedWallet, setGeneratedWallet] = useState<{
    address: string;
    privateKey: string;
  } | null>(null);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    fetch("/api/wallet/status")
      .then((r) => r.json())
      .then((data) => {
        setBscAddress(data.bscAddress ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    try {
      // Generate wallet CLIENT-SIDE — private key never touches the server
      const { ethers } = await import("ethers");
      const wallet = ethers.Wallet.createRandom();
      setGeneratedWallet({
        address: wallet.address,
        privateKey: wallet.privateKey,
      });
    } catch (err) {
      console.error("Failed to generate wallet:", err);
    }
    setGenerating(false);
  }

  async function handleCopy(text: string, type: "addr" | "key") {
    await navigator.clipboard.writeText(text);
    if (type === "addr") {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  }

  async function handleManualSave() {
    const addr = manualAddress.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      setManualError("Invalid BSC address. Must be 0x followed by 40 hex characters.");
      return;
    }
    setManualError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/wallet/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr }),
      });
      if (res.ok) {
        setBscAddress(addr);
        setManualAddress("");
        setShowManual(false);
      }
    } catch (err) {
      console.error("Failed to save address:", err);
    }
    setSaving(false);
  }

  async function handleConfirmSave() {
    if (!generatedWallet) return;
    setSaving(true);
    try {
      const res = await fetch("/api/wallet/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: generatedWallet.address }),
      });
      if (res.ok) {
        setBscAddress(generatedWallet.address);
        setGeneratedWallet(null);
      }
    } catch (err) {
      console.error("Failed to save address:", err);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="font-mono text-sm text-neutral-500">loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 animate-fade-in">
      <h1 className="mb-2 font-mono text-2xl font-bold text-neutral-100">
        <span className="text-neon-cyan/40">&gt;</span> wallet setup
      </h1>
      <p className="mb-8 font-mono text-xs text-neutral-500">
        configure your BSC receiving address for donations
      </p>

      {/* Current address display */}
      {bscAddress && !generatedWallet && (
        <div className="mb-6 rounded border border-neutral-800/60 bg-[#0a0a0a] p-5">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-wider text-neutral-600">
            current receiving address
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all font-mono text-sm text-neon-cyan/80">
              {bscAddress}
            </code>
            <button
              onClick={() => handleCopy(bscAddress, "addr")}
              className="shrink-0 rounded border border-neutral-800/40 p-2 text-neutral-500 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all"
            >
              {copiedAddr ? (
                <Check className="h-3.5 w-3.5 text-neon-lime" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <p className="mt-3 font-mono text-[10px] text-neutral-600">
            donors will send USDT/USDC (BEP-20) to this address
          </p>
        </div>
      )}

      {/* Action buttons */}
      {!generatedWallet && !showManual && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 rounded border border-neutral-800/50 px-5 py-3 font-mono text-sm text-neutral-400 transition-all hover:border-neon-cyan/30 hover:text-neon-cyan glow-box disabled:opacity-50"
          >
            {bscAddress ? (
              <RefreshCw className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
            ) : (
              <Wallet className="h-4 w-4" />
            )}
            {generating
              ? "generating..."
              : bscAddress
                ? "generate new address"
                : "generate new address"}
          </button>
          <button
            onClick={() => setShowManual(true)}
            className="flex items-center gap-2 rounded border border-neutral-800/50 px-5 py-3 font-mono text-sm text-neutral-400 transition-all hover:border-neon-magenta/30 hover:text-neon-magenta"
          >
            <span className="text-neutral-600">→</span>
            use my own address
          </button>
        </div>
      )}

      {/* Manual address input */}
      {showManual && !generatedWallet && (
        <div className="rounded border border-neutral-800/60 bg-[#0a0a0a] p-5 space-y-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
            paste your BSC (BEP-20) address
          </div>
          <input
            type="text"
            value={manualAddress}
            onChange={(e) => { setManualAddress(e.target.value); setManualError(null); }}
            placeholder="0x..."
            className="w-full rounded border border-neutral-800/40 bg-[#050505] px-4 py-3 font-mono text-sm text-neon-cyan/80 placeholder-neutral-700 outline-none focus:border-neon-cyan/30 transition-all"
          />
          {manualError && (
            <div className="flex items-center gap-2 font-mono text-xs text-red-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              {manualError}
            </div>
          )}
          <p className="font-mono text-[10px] text-neutral-600 leading-relaxed">
            make sure this is a valid BSC/EVM address you control. donors will send USDT/USDC directly here.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleManualSave}
              disabled={saving || !manualAddress.trim()}
              className="flex-1 rounded border border-neon-lime/30 bg-neon-lime/5 py-3 font-mono text-sm text-neon-lime transition-all hover:bg-neon-lime/10 disabled:opacity-50"
            >
              {saving ? "saving..." : "save address"}
            </button>
            <button
              onClick={() => { setShowManual(false); setManualAddress(""); setManualError(null); }}
              className="rounded border border-neutral-800/40 px-4 py-3 font-mono text-xs text-neutral-600 hover:text-neutral-400 transition-all"
            >
              [cancel]
            </button>
          </div>
        </div>
      )}

      {/* Generated wallet reveal modal */}
      {generatedWallet && (
        <div className="rounded border border-neon-orange/30 bg-[#0a0a0a] overflow-hidden">
          {/* Terminal title bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-800/40">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="font-mono text-[10px] text-neutral-600">
              wallet-generate.sh
            </span>
          </div>

          <div className="p-5 space-y-5">
            {/* Warning */}
            <div className="rounded border border-neon-orange/20 bg-neon-orange/5 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-neon-orange shrink-0 mt-0.5" />
                <div className="font-mono text-xs text-neon-orange/90 leading-relaxed">
                  <strong>save your private key now.</strong> it will never be
                  shown again. SkillsHub does not store private keys. if you
                  lose it, funds sent to this address are unrecoverable.
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-neutral-600">
                address (public)
              </div>
              <div className="flex items-center gap-2 rounded border border-neutral-800/40 bg-[#050505] p-3">
                <code className="flex-1 break-all font-mono text-xs text-neon-cyan/80">
                  {generatedWallet.address}
                </code>
                <button
                  onClick={() =>
                    handleCopy(generatedWallet.address, "addr")
                  }
                  className="shrink-0 rounded border border-neutral-800/40 p-2 text-neutral-500 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all"
                >
                  {copiedAddr ? (
                    <Check className="h-3.5 w-3.5 text-neon-lime" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Private Key */}
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-red-500/80">
                private key (secret — save this!)
              </div>
              <div className="flex items-center gap-2 rounded border border-red-900/30 bg-red-950/10 p-3">
                <code className="flex-1 break-all font-mono text-xs text-red-400/80">
                  {generatedWallet.privateKey}
                </code>
                <button
                  onClick={() =>
                    handleCopy(generatedWallet.privateKey, "key")
                  }
                  className="shrink-0 rounded border border-red-900/30 p-2 text-red-500/60 hover:text-red-400 hover:border-red-500/30 transition-all"
                >
                  {copiedKey ? (
                    <Check className="h-3.5 w-3.5 text-neon-lime" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm button */}
            <button
              onClick={handleConfirmSave}
              disabled={saving}
              className="w-full rounded border border-neon-lime/30 bg-neon-lime/5 py-3 font-mono text-sm text-neon-lime transition-all hover:bg-neon-lime/10 disabled:opacity-50"
            >
              {saving ? "saving..." : "I've saved my private key — store address"}
            </button>

            <button
              onClick={() => setGeneratedWallet(null)}
              className="w-full rounded border border-neutral-800/40 py-2 font-mono text-xs text-neutral-600 hover:text-neutral-400 transition-all"
            >
              [cancel]
            </button>
          </div>
        </div>
      )}

      {/* Info section */}
      <div className="mt-8 rounded border border-neutral-800/40 bg-neutral-900/20 p-5">
        <h3 className="mb-3 font-mono text-[10px] uppercase tracking-wider text-neutral-600">
          ┌ how it works
        </h3>
        <div className="space-y-2 font-mono text-xs text-neutral-500 leading-relaxed">
          <p>
            <span className="text-neon-cyan/40">1.</span> generate a BSC wallet
            — this happens in your browser
          </p>
          <p>
            <span className="text-neon-cyan/40">2.</span> save the private key
            somewhere safe (password manager, etc.)
          </p>
          <p>
            <span className="text-neon-cyan/40">3.</span> only the public
            address is stored on SkillsHub
          </p>
          <p>
            <span className="text-neon-cyan/40">4.</span> donors send USDT/USDC
            directly to your address on BSC
          </p>
          <p>
            <span className="text-neon-cyan/40">5.</span> use the private key to
            access funds via MetaMask or any wallet
          </p>
        </div>
        <div className="mt-3 font-mono text-[10px] text-neutral-800">
          └────────────
        </div>
      </div>
    </div>
  );
}
