// Mempool.space API (no key required, CORS enabled)
const MEMPOOL_BASE = 'https://mempool.space/api';

async function mempoolGet(path) {
  const res = await fetch(`${MEMPOOL_BASE}${path}`);
  if (!res.ok) throw new Error(`Mempool error: ${res.status}`);
  return res.json();
}

// Bitcoin Core subsidy formula: 50 BTC >> halvings
function getBlockSubsidySats(halvings) {
  if (halvings >= 64) return 0n;
  return 5000000000n >> BigInt(halvings);
}

// Compute the first satoshi that was mined in a given block
export function getFirstSatOfBlock(blockHeight) {
  const HALVING_INTERVAL = 210000;
  let totalSats = 0n;
  let currentBlock = 0;
  let halving = 0;

  while (currentBlock < blockHeight) {
    const subsidy = getBlockSubsidySats(halving);
    const blocksInThisHalving = Math.min(
      HALVING_INTERVAL * (halving + 1),
      blockHeight
    ) - currentBlock;

    totalSats += subsidy * BigInt(blocksInThisHalving);
    currentBlock += blocksInThisHalving;
    halving++;
  }

  return totalSats;
}

// Rodarmor rarity from block height (first sat of block)
export function getRarityFromBlock(blockHeight) {
  if (blockHeight === 0) return 'Mythic';
  if (blockHeight % 1260000 === 0) return 'Legendary';
  if (blockHeight % 210000 === 0) return 'Epic';
  if (blockHeight % 2016 === 0) return 'Prime'; // Rare → Prime display name
  return 'Uncommon';
}

// Fetch address summary from Mempool
export async function fetchAddress(address) {
  return mempoolGet(`/address/${address}`);
}

// Fetch UTXOs for an address
export async function fetchAddressUtxos(address) {
  return mempoolGet(`/address/${address}/utxo`);
}

// Fetch a single transaction
export async function fetchTx(txid) {
  return mempoolGet(`/tx/${txid}`);
}

// Fetch block details
export async function fetchBlock(blockHash) {
  return mempoolGet(`/block/${blockHash}`);
}

// Main data builder for addresses
export async function fetchAddressCardData(address) {
  const [addrInfo, utxos] = await Promise.all([
    fetchAddress(address).catch(() => null),
    fetchAddressUtxos(address).catch(() => []),
  ]);

  if (!addrInfo) {
    throw new Error('Could not fetch address data from Mempool');
  }

  // Find oldest confirmed UTXO
  let oldestUtxo = null;
  for (const utxo of utxos) {
    if (utxo.status && utxo.status.confirmed) {
      if (!oldestUtxo || utxo.status.block_height < oldestUtxo.status.block_height) {
        oldestUtxo = utxo;
      }
    }
  }

  let firstSeenDate = '—';
  let firstSeenBlock = '—';
  let satNumber = '—';
  let rarity = 'Common';
  let blockHash = null;

  if (oldestUtxo) {
    const bh = oldestUtxo.status.block_height;
    firstSeenBlock = bh.toLocaleString();
    satNumber = getFirstSatOfBlock(bh).toLocaleString();
    rarity = getRarityFromBlock(bh);
    blockHash = oldestUtxo.status.block_hash;

    // Get tx timestamp
    try {
      const tx = await fetchTx(oldestUtxo.txid);
      if (tx.status && tx.status.block_time) {
        firstSeenDate = new Date(tx.status.block_time * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
    } catch {
      // ignore
    }
  }

  // Balance in BTC
  const chainBalance = (addrInfo.chain_stats?.funded_txo_sum || 0) - (addrInfo.chain_stats?.spent_txo_sum || 0);
  const mempoolBalance = (addrInfo.mempool_stats?.funded_txo_sum || 0) - (addrInfo.mempool_stats?.spent_txo_sum || 0);
  const totalBalanceSats = chainBalance + mempoolBalance;
  const balanceBtc = (totalBalanceSats / 100000000).toFixed(8);

  // Transaction count
  const txCount = (addrInfo.chain_stats?.tx_count || 0) + (addrInfo.mempool_stats?.tx_count || 0);

  // Check for potential inscriptions (1-sat or 546-sat UTXOs are common carriers)
  const potentialInscriptions = utxos.filter(u => u.value === 1 || u.value === 546).length;

  return {
    input: address,
    inputType: 'address',
    rarity,
    balance: balanceBtc,
    utxoCount: utxos.length,
    txCount,
    inscriptionHint: potentialInscriptions,
    firstSeenBlock,
    firstSeenDate,
    satNumber,
    oldestUtxoValue: oldestUtxo ? (oldestUtxo.value / 100000000).toFixed(8) + ' BTC' : '—',
    blockHash,
    patternHue: hashString(address) % 360,
    patternHue2: (hashString(address) + 120) % 360,
  };
}

// Main data builder for inscription IDs
// An inscription ID is txid + 'i' + index
// We fetch the actual transaction from mempool to get real on-chain data
export async function fetchInscriptionCardData(inscriptionId) {
  const match = inscriptionId.match(/^([a-fA-F0-9]{64})i(\d+)$/);
  if (!match) throw new Error('Invalid inscription ID format');

  const txid = match[1];
  const index = parseInt(match[2], 10);

  let tx;
  try {
    tx = await fetchTx(txid);
  } catch {
    throw new Error('Transaction not found on Mempool');
  }

  if (!tx || !tx.status || !tx.status.confirmed) {
    throw new Error('Transaction not yet confirmed');
  }

  const blockHeight = tx.status.block_height;
  const satNumber = getFirstSatOfBlock(blockHeight);
  const rarity = getRarityFromBlock(blockHeight);

  const date = tx.status.block_time
    ? new Date(tx.status.block_time * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

  // Get the output value at the inscription index
  const outputValue = tx.vout && tx.vout[index] ? tx.vout[index].value : null;
  const address = tx.vout && tx.vout[index] && tx.vout[index].scriptpubkey_address
    ? tx.vout[index].scriptpubkey_address
    : null;

  return {
    input: inscriptionId,
    inputType: 'inscription',
    rarity,
    balance: outputValue !== null ? (outputValue / 100000000).toFixed(8) + ' BTC' : '—',
    utxoCount: '—',
    txCount: '—',
    inscriptionHint: 1,
    firstSeenBlock: blockHeight.toLocaleString(),
    firstSeenDate: date,
    satNumber: satNumber.toLocaleString(),
    oldestUtxoValue: outputValue !== null ? outputValue + ' sats' : '—',
    txid: txid.slice(0, 16) + '...',
    index,
    address: address ? address.slice(0, 12) + '...' : '—',
    patternHue: hashString(inscriptionId) % 360,
    patternHue2: (hashString(inscriptionId) + 120) % 360,
  };
}

// Simple hash for generative visuals (kept for colors only)
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
