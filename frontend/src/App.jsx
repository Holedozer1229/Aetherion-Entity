import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// ─── Contract Config ────────────────────────────────────────────────────────
const CONTRACT_ADDRESS = '0x9D7f74d0C41E726EC95884E0e97Fa6129e3b5E99';
const CONTRACT_ABI = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},
  {"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},
  {"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},
  {"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},
  {"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},
  {"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},
  {"inputs":[],"name":"CREATE2_FACTORY","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"GENESIS_MESSAGE_HASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"GENESIS_MINT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"GENESIS_NONCE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"GENESIS_PUBKEY","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"GENESIS_SIGNATURE","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"MNEMONIC_HASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"PER_SOLVER_MINT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"REMAINING_MINT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"TOTAL_SUPPLY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasMinted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"string","name":"mnemonic","type":"string"}],"name":"mintByMnemonic","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"mintedBySolvers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"verifyBitcoinGenesisBinding","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"pure","type":"function"},
  {"inputs":[],"name":"verifyCREATE2Deployment","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"pure","type":"function"},
  {"inputs":[],"name":"verifyGenesisNonceBinding","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"pure","type":"function"}
];

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (val, dec = 18) => {
  try {
    return parseFloat(ethers.formatUnits(val, dec)).toLocaleString('en-US', { maximumFractionDigits: 2 });
  } catch { return '—'; }
};

const shortAddr = (addr) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '';

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast-item flex items-start gap-3 px-4 py-3 rounded border shadow-lg font-crimson text-sm
            ${t.type === 'success' ? 'bg-parchment-100 border-gold-400 text-brown-900' :
              t.type === 'error'   ? 'bg-red-50 border-red-400 text-red-900' :
                                     'bg-parchment-200 border-gold-500 text-brown-800'}`}
        >
          <span className="text-lg leading-none">
            {t.type === 'success' ? '⚔️' : t.type === 'error' ? '🔥' : '📜'}
          </span>
          <span className="flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="opacity-50 hover:opacity-100 text-xs ml-1">✕</button>
        </div>
      ))}
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function GoldDivider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
      <span className="text-gold-400 text-xs">✦</span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub }) {
  return (
    <div className="scroll-card p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-gold-600 text-xs font-cinzel uppercase tracking-widest">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-brown-900 font-cinzel font-bold text-lg leading-tight break-all">{value}</div>
      {sub && <div className="text-brown-800 font-crimson text-xs opacity-70">{sub}</div>}
    </div>
  );
}

// ─── Verify Row ──────────────────────────────────────────────────────────────
function VerifyRow({ label, value, loading }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gold-400/30 last:border-0">
      <span className="font-crimson text-brown-800 text-sm">{label}</span>
      {loading ? (
        <span className="text-gold-500 text-xs animate-pulse">Consulting oracle…</span>
      ) : value === null || value === undefined ? (
        <span className="text-brown-800/40 text-xs">—</span>
      ) : typeof value === 'boolean' ? (
        <span className={`font-cinzel text-xs font-semibold px-2 py-0.5 rounded ${value ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
          {value ? '✓ Verified' : '✗ Failed'}
        </span>
      ) : (
        <span className="font-crimson text-brown-900 text-xs break-all max-w-[55%] text-right">{String(value)}</span>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const config = window.__QUICK_DAPP_CONFIG__ || {};

  // Wallet state
  const [account, setAccount]         = useState(null);
  const [provider, setProvider]       = useState(null);
  const [signer, setSigner]           = useState(null);
  const [ethBalance, setEthBalance]   = useState(null);
  const [connecting, setConnecting]   = useState(false);

  // Token info
  const [tokenName, setTokenName]       = useState('');
  const [tokenSymbol, setTokenSymbol]   = useState('');
  const [totalSupply, setTotalSupply]   = useState(null);
  const [userBalance, setUserBalance]   = useState(null);
  const [hasMinted, setHasMinted]       = useState(null);
  const [mintedBySolvers, setMintedBySolvers] = useState(null);
  const [perSolverMint, setPerSolverMint]     = useState(null);
  const [remainingMint, setRemainingMint]     = useState(null);
  const [loadingInfo, setLoadingInfo]   = useState(false);

  // Verify state
  const [verifyData, setVerifyData]     = useState({});
  const [loadingVerify, setLoadingVerify] = useState(false);

  // Mint state
  const [mnemonic, setMnemonic]         = useState('');
  const [minting, setMinting]           = useState(false);

  // Toasts
  const [toasts, setToasts]             = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  // ── Contract (read-only, no signer needed for pure/view) ─────────────────
  const getReadContract = useCallback((prov) => {
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, prov);
  }, []);

  // ── Load token info ───────────────────────────────────────────────────────
  const loadTokenInfo = useCallback(async (prov, acc) => {
    if (!prov) return;
    setLoadingInfo(true);
    try {
      const c = getReadContract(prov);
      const [name, symbol, supply, minted, perSolver, remaining] = await Promise.all([
        c.name(),
        c.symbol(),
        c.totalSupply(),
        c.mintedBySolvers(),
        c.PER_SOLVER_MINT(),
        c.REMAINING_MINT(),
      ]);
      setTokenName(name);
      setTokenSymbol(symbol);
      setTotalSupply(supply);
      setMintedBySolvers(minted);
      setPerSolverMint(perSolver);
      setRemainingMint(remaining);

      if (acc) {
        const [bal, minted_] = await Promise.all([
          c.balanceOf(acc),
          c.hasMinted(acc),
        ]);
        setUserBalance(bal);
        setHasMinted(minted_);
        const ethBal = await prov.getBalance(acc);
        setEthBalance(ethBal);
      }
    } catch (e) {
      console.error('loadTokenInfo error:', e);
      addToast('Failed to load token data from the contract.', 'error');
    } finally {
      setLoadingInfo(false);
    }
  }, [getReadContract, addToast]);

  // ── Load verification data ────────────────────────────────────────────────
  const loadVerifyData = useCallback(async (prov) => {
    if (!prov) return;
    setLoadingVerify(true);
    try {
      const c = getReadContract(prov);
      const [genesis, create2, nonce] = await Promise.all([
        c.verifyBitcoinGenesisBinding(),
        c.verifyCREATE2Deployment(),
        c.verifyGenesisNonceBinding(),
      ]);
      setVerifyData({ genesis, create2, nonce });
    } catch (e) {
      console.error('loadVerifyData error:', e);
      addToast('Failed to load verification data.', 'error');
    } finally {
      setLoadingVerify(false);
    }
  }, [getReadContract, addToast]);

  // ── Connect wallet ────────────────────────────────────────────────────────
  const connectWallet = useCallback(async () => {
    setConnecting(true);
    try {
      const prov = new ethers.BrowserProvider(window.ethereum);
      await prov.send('eth_requestAccounts', []);
      const sgn = await prov.getSigner();
      const acc = await sgn.getAddress();
      setProvider(prov);
      setSigner(sgn);
      setAccount(acc);
      addToast(`Hail, brave soul! Wallet connected: ${shortAddr(acc)}`, 'success');
      await loadTokenInfo(prov, acc);
      await loadVerifyData(prov);
    } catch (e) {
      console.error('connectWallet error:', e);
      addToast('Failed to connect wallet. Art thou worthy?', 'error');
    } finally {
      setConnecting(false);
    }
  }, [loadTokenInfo, loadVerifyData, addToast]);

  // ── Account change listener ───────────────────────────────────────────────
  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setSigner(null);
        setUserBalance(null);
        setHasMinted(null);
        setEthBalance(null);
        addToast('Wallet disconnected. The quest continues…', 'info');
        return;
      }
      const newAcc = accounts[0];
      setAccount(newAcc);
      try {
        const prov = new ethers.BrowserProvider(window.ethereum);
        const sgn = await prov.getSigner();
        setProvider(prov);
        setSigner(sgn);
        await loadTokenInfo(prov, newAcc);
        await loadVerifyData(prov);
        addToast(`Account changed to ${shortAddr(newAcc)}`, 'info');
      } catch (e) {
        console.error('accountsChanged error:', e);
      }
    };
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
  }, [loadTokenInfo, loadVerifyData, addToast]);

  // ── Auto-load read-only data on mount ─────────────────────────────────────
  useEffect(() => {
    if (!window.ethereum) return;
    const prov = new ethers.BrowserProvider(window.ethereum);
    setProvider(prov);
    loadTokenInfo(prov, null);
    loadVerifyData(prov);
  }, []);

  // ── Mint ──────────────────────────────────────────────────────────────────
  const handleMint = useCallback(async () => {
    if (!signer) { addToast('Connect thy wallet first, brave knight!', 'error'); return; }
    if (!mnemonic.trim()) { addToast('Enter the sacred mnemonic phrase.', 'error'); return; }
    if (hasMinted) { addToast('Thou hast already claimed thy EXCAL tokens!', 'error'); return; }
    setMinting(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      addToast('Submitting thy mnemonic to the sacred forge…', 'info');
      const tx = await contract.mintByMnemonic(mnemonic.trim());
      addToast(`Transaction sent! Awaiting confirmation… (${shortAddr(tx.hash)})`, 'info');
      await tx.wait();
      addToast(`⚔️ Excalibur tokens forged! ${fmt(perSolverMint)} EXCAL granted to thee!`, 'success');
      setMnemonic('');
      await loadTokenInfo(provider, account);
    } catch (e) {
      console.error('mint error:', e);
      const msg = e?.reason || e?.data?.message || e?.message || 'Transaction failed';
      if (msg.includes('Wrong mnemonic')) {
        addToast('The mnemonic is false! The sword rejects thee.', 'error');
      } else if (msg.includes('Already minted')) {
        addToast('Thou hast already claimed thy tokens, noble solver!', 'error');
      } else if (msg.includes('Pool exhausted')) {
        addToast('The solver pool is exhausted. The quest is complete.', 'error');
      } else {
        addToast(`Forge failed: ${msg}`, 'error');
      }
    } finally {
      setMinting(false);
    }
  }, [signer, mnemonic, hasMinted, perSolverMint, provider, account, loadTokenInfo, addToast]);

  // ── Solver pool progress ──────────────────────────────────────────────────
  const solverPoolRemaining = remainingMint && mintedBySolvers
    ? remainingMint - mintedBySolvers
    : remainingMint;
  const poolPercent = remainingMint && mintedBySolvers
    ? Number((mintedBySolvers * 10000n / remainingMint)) / 100
    : 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen camelot-bg font-crimson">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* ── Header ── */}
      <header className="camelot-header border-b-2 border-gold-400 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚔️</span>
            <div>
              <h1 className="font-cinzel-deco text-gold-400 text-xl font-bold leading-tight">
                {config.title || 'Camelot Excalibur'}
              </h1>
              <p className="font-cinzel text-gold-500/80 text-xs tracking-widest uppercase">
                {config.subtitle || 'EXCAL Token — The Sword in the Stone'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {account ? (
              <div className="wallet-badge flex items-center gap-2 px-3 py-2 rounded border border-gold-400 bg-parchment-100">
                <span className="text-green-600 text-xs">●</span>
                <div className="text-right">
                  <div className="font-cinzel text-brown-900 text-xs font-semibold">{shortAddr(account)}</div>
                  {ethBalance !== null && (
                    <div className="font-crimson text-brown-800 text-xs opacity-70">
                      {parseFloat(ethers.formatEther(ethBalance)).toFixed(4)} ETH
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={connecting}
                className="connect-btn font-cinzel text-sm font-semibold px-5 py-2 rounded border-2 border-gold-400 bg-gold-400/10 text-gold-600 hover:bg-gold-400/20 transition-all disabled:opacity-50 tracking-wide"
              >
                {connecting ? 'Connecting…' : '⚔ Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* ── Token Overview ── */}
        <section>
          <SectionTitle icon="🏰" title="The Kingdom's Treasury" />
          {loadingInfo && !tokenName ? (
            <div className="text-center text-gold-500 font-cinzel text-sm py-8 animate-pulse">Consulting the royal ledger…</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon="📜" label="Token Name" value={tokenName || '—'} />
              <StatCard icon="🛡" label="Symbol" value={tokenSymbol || '—'} />
              <StatCard
                icon="💰"
                label="Total Supply"
                value={totalSupply ? fmt(totalSupply) : '—'}
                sub={tokenSymbol ? `${tokenSymbol} tokens` : undefined}
              />
              {account ? (
                <StatCard
                  icon="👑"
                  label="Your Balance"
                  value={userBalance !== null ? fmt(userBalance) : '—'}
                  sub={tokenSymbol || undefined}
                />
              ) : (
                <StatCard icon="👑" label="Your Balance" value="Connect wallet" sub="to see balance" />
              )}
            </div>
          )}
        </section>

        <GoldDivider />

        {/* ── Solver Pool ── */}
        <section>
          <SectionTitle icon="🗡️" title="Solver's Quest Pool" />
          <div className="scroll-card p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="font-cinzel text-gold-600 text-xs uppercase tracking-widest mb-1">Per Solver Reward</div>
                <div className="font-cinzel font-bold text-brown-900 text-2xl">
                  {perSolverMint ? fmt(perSolverMint) : '—'}
                </div>
                <div className="font-crimson text-brown-800 text-xs opacity-70">{tokenSymbol || 'EXCAL'} per quest</div>
              </div>
              <div className="text-center">
                <div className="font-cinzel text-gold-600 text-xs uppercase tracking-widest mb-1">Pool Claimed</div>
                <div className="font-cinzel font-bold text-brown-900 text-2xl">
                  {mintedBySolvers ? fmt(mintedBySolvers) : '0'}
                </div>
                <div className="font-crimson text-brown-800 text-xs opacity-70">{tokenSymbol || 'EXCAL'} minted</div>
              </div>
              <div className="text-center">
                <div className="font-cinzel text-gold-600 text-xs uppercase tracking-widest mb-1">Remaining Pool</div>
                <div className="font-cinzel font-bold text-brown-900 text-2xl">
                  {solverPoolRemaining ? fmt(solverPoolRemaining) : '—'}
                </div>
                <div className="font-crimson text-brown-800 text-xs opacity-70">{tokenSymbol || 'EXCAL'} available</div>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between font-cinzel text-xs text-brown-800/60 mb-1">
                <span>Pool Progress</span>
                <span>{poolPercent.toFixed(2)}% claimed</span>
              </div>
              <div className="h-3 rounded-full bg-parchment-300 border border-gold-400/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-700"
                  style={{ width: `${Math.min(poolPercent, 100)}%` }}
                />
              </div>
            </div>

            {account && hasMinted !== null && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded border font-crimson text-sm
                ${hasMinted
                  ? 'bg-green-50 border-green-300 text-green-800'
                  : 'bg-parchment-100 border-gold-400/50 text-brown-800'}`}>
                <span>{hasMinted ? '✓' : '○'}</span>
                <span>
                  {hasMinted
                    ? 'Thou hast already claimed thy Excalibur tokens. Well done, noble solver!'
                    : 'Thou hast not yet claimed. Present the sacred mnemonic below.'}
                </span>
              </div>
            )}
          </div>
        </section>

        <GoldDivider />

        {/* ── Mint Section ── */}
        <section>
          <SectionTitle icon="🔥" title="Forge Excalibur Tokens" />
          <div className="scroll-card p-5 space-y-4">
            <p className="font-crimson text-brown-800 text-sm leading-relaxed">
              Speak the sacred mnemonic phrase to prove thy worth and claim{' '}
              <strong className="text-gold-600">{perSolverMint ? fmt(perSolverMint) : '1,000'} EXCAL</strong> tokens
              from the solver's pool. Each wallet may only claim once.
            </p>

            <div className="space-y-2">
              <label className="block font-cinzel text-gold-600 text-xs uppercase tracking-widest">
                Sacred Mnemonic Phrase
              </label>
              <textarea
                value={mnemonic}
                onChange={e => setMnemonic(e.target.value)}
                placeholder="Enter the ancient words of power…"
                rows={3}
                disabled={minting || hasMinted}
                className="w-full px-4 py-3 rounded border-2 border-gold-400/60 bg-parchment-50 font-crimson text-brown-900 text-sm placeholder-brown-800/30 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-400/30 resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>

            <button
              onClick={handleMint}
              disabled={minting || !account || hasMinted || !mnemonic.trim()}
              className="forge-btn w-full font-cinzel font-semibold text-sm py-3 px-6 rounded border-2 border-gold-500 text-parchment-50 tracking-widest uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {minting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚙️</span> Forging…
                </span>
              ) : hasMinted ? (
                '✓ Already Claimed'
              ) : !account ? (
                'Connect Wallet to Forge'
              ) : (
                '⚔ Claim Excalibur Tokens'
              )}
            </button>

            {!account && (
              <p className="text-center font-crimson text-brown-800/60 text-xs">
                Connect thy wallet to participate in the quest.
              </p>
            )}
          </div>
        </section>

        <GoldDivider />

        {/* ── Verification Section ── */}
        <section>
          <SectionTitle icon="🔮" title="Oracle Verifications" />
          <div className="scroll-card p-5">
            <p className="font-crimson text-brown-800 text-sm mb-4 leading-relaxed">
              The sacred oracles verify the binding of Bitcoin's genesis block to this contract's deployment.
              These are pure on-chain verifications, requiring no transaction.
            </p>
            <div className="space-y-0">
              <VerifyRow
                label="Bitcoin Genesis Address Binding"
                value={verifyData.genesis}
                loading={loadingVerify && verifyData.genesis === undefined}
              />
              <VerifyRow
                label="Genesis Nonce Binding"
                value={verifyData.nonce}
                loading={loadingVerify && verifyData.nonce === undefined}
              />
              <VerifyRow
                label="CREATE2 Deployment Address"
                value={verifyData.create2}
                loading={loadingVerify && verifyData.create2 === undefined}
              />
            </div>

            <button
              onClick={() => {
                const prov = provider || new ethers.BrowserProvider(window.ethereum);
                loadVerifyData(prov);
              }}
              disabled={loadingVerify}
              className="mt-4 font-cinzel text-xs text-gold-600 border border-gold-400/50 px-4 py-1.5 rounded hover:bg-gold-400/10 transition-all disabled:opacity-50"
            >
              {loadingVerify ? 'Consulting…' : '🔮 Re-consult Oracle'}
            </button>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="text-center pt-4 pb-8">
          <GoldDivider />
          <p className="font-cinzel text-gold-500/60 text-xs tracking-widest uppercase mt-3">
            ⚔ Camelot Excalibur · EXCAL Token ·{' '}
            <span className="font-crimson normal-case tracking-normal opacity-70">
              {shortAddr(CONTRACT_ADDRESS)}
            </span>
          </p>
          <p className="font-crimson text-brown-800/40 text-xs mt-1 italic">
            "Whoso pulleth out this sword of this stone and anvil, is rightwise born King of all England."
          </p>
        </footer>
      </main>
    </div>
  );
}

// ─── Section Title ────────────────────────────────────────────────────────────
function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-2xl">{icon}</span>
      <h2 className="font-cinzel font-bold text-brown-900 text-lg tracking-wide">{title}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-gold-400/60 to-transparent ml-2" />
    </div>
  );
}
