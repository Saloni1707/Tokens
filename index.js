require('dotenv').config();

const {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL
} = require('@solana/web3.js');

const {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo
} = require('@solana/spl-token');

const connection = new Connection(
  clusterApiUrl('devnet'),
  'confirmed'
);

const payer = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(process.env.PRIVATE_KEY))
);

async function airdrop() {
  const balance = await connection.getBalance(payer.publicKey);

  if (balance < LAMPORTS_PER_SOL) {
    const sig = await connection.requestAirdrop(
      payer.publicKey,
      LAMPORTS_PER_SOL
    );

    const latestBlockhash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      signature: sig,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    });

    console.log("Airdropped 1 SOL");
  }
}

async function main() {
  await airdrop();

  const mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    6
  );

  console.log("Mint created:", mint.toBase58());

  
  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );


  const amount = 100 * 1_000_000;

  await mintTo(
    connection,
    payer,
    mint,
    ata.address,
    payer,
    amount
  );

  console.log("Minted 100 tokens to:", ata.address.toBase58());
}

main().catch(console.error);