// On-chain settlement for agent trades.
// Records each agent decision as a memo transaction on Solana devnet,
// so trade history can be independently verified via a block explorer
// rather than taken on faith from server-side state.

const {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  Keypair,
  sendAndConfirmTransaction,
} = require('@solana/web3.js');

// Solana's standard Memo program — lets us attach an arbitrary string to a
// transaction without needing a custom on-chain program for the hackathon.
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

class OnChainSettlement {
  constructor() {
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );
    this.wallet = this._loadWallet();
    this.trades = [];

    if (!this.wallet) {
      console.warn(
        '[OnChainSettlement] No WALLET_PRIVATE_KEY set — trades will be recorded off-chain only.'
      );
    }
  }

  _loadWallet() {
    if (!process.env.WALLET_PRIVATE_KEY) return null;
    try {
      const secret = new Uint8Array(JSON.parse(process.env.WALLET_PRIVATE_KEY));
      return Keypair.fromSecretKey(secret);
    } catch (err) {
      console.error('[OnChainSettlement] Failed to load wallet from env:', err.message);
      return null;
    }
  }

  /**
   * Records a trade. Attempts to settle on-chain via a devnet memo
   * transaction; falls back to an off-chain record if no wallet is
   * configured or the transaction fails. `settlement` on the returned
   * record is always accurate — 'onchain' only when a real signature
   * was confirmed, 'offchain' otherwise. Never silently fakes success.
   */
  async recordTrade(agent, decision, match) {
    const record = {
      agent: agent.name,
      action: decision.action,
      match: `${match.home} vs ${match.away}`,
      timestamp: new Date().toISOString(),
      settlement: 'offchain',
      txId: null,
      explorerUrl: null,
    };

    if (!this.wallet) {
      this.trades.push(record);
      return record;
    }

    try {
      const memoText = `Agent:${agent.name}|Action:${decision.action}|Match:${match.home}vs${match.away}|Time:${Date.now()}`;

      const memoIx = new TransactionInstruction({
        keys: [],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(memoText, 'utf-8'),
      });

      const tx = new Transaction().add(memoIx);

      const signature = await sendAndConfirmTransaction(this.connection, tx, [this.wallet], {
        commitment: 'confirmed',
      });

      record.settlement = 'onchain';
      record.txId = signature;
      record.explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
    } catch (error) {
      console.error('[OnChainSettlement] Send failed, recording off-chain instead:', error.message);
      record.settlement = 'offchain';
      record.error = error.message;
    }

    this.trades.push(record);
    return record;
  }

  getTrades() {
    return this.trades;
  }

  getOnChainTrades() {
    return this.trades.filter(t => t.settlement === 'onchain');
  }
}

module.exports = { OnChainSettlement };