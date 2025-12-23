const {Connection,LAMPORTS_PER_SOL,clusterApiUrl,PublicKey} = require('@solana/web3.js');

const connection = new Connection(clusterApiUrl('devnet'));

async function airdrop(publicKey,amount){
    const pubkey = new PublicKey(PublicKey);
    const signature = await connection.requestAirdrop(pubkey,amount);
    console.log(signature);
    const latestBlockhash = await connection.getLatestBlockhash();
    
    await confirmTransaction({
        signature,
        blockhash:latestBlockhash.blockhash,
        lastValidBlockHeight:latestBlockhash.lastValidBlockHeight
    });

    return signature;
}

//creating Mint

const {createMint} = require('@solana/spl-token');
const {Keypair,Connection,clusterApiUrl} = require('@solana/web3.js');

const payer = Keypair.fromSecretKey(
    Uint8Array.from([
        102,144,169,42,220,87,99,85,100,128,197,17,41,234,250,84,
        87,98,161,74,15,249,83,6,120,159,135,22,46,164,204,141,
        234,217,146,214,61,187,254,97,124,111,61,29,54,110,245,
        186,11,253,11,127,213,20,73,8,25,201,22,107,4,75,26,120
      ])
);

const connectionNew = new Connection(
    clusterApiUrl('devnet'),
    'confirmed'
);

async function createMintForToken(){
    const mint = await createMint(
        connectionNew,
        payer,
        payer.publicKey, //mint owner mostly
        null,
        6
    );

    console.log("Mint created at:",mint.toBase58());
}

async function main(){
    await createMintForToken();
}
main();

//now the Associated Token Acc (ATA)

const{ createMint,getOrCreateAssociatedTokenAccount, mintTo} = require('@solana/spl-token');

const {Keypair,Connection,clusterApiUrl,PublicKey} = require('@solana/web3.js');

const payerNew = Keypair.fromSecretKey(Uint8Array.from([
    102,144,169,42,220,87,99,85,100,128,197,17,41,234,250,84,
    87,98,161,74,15,249,83,6,120,159,135,22,46,164,204,141,
    234,217,146,214,61,187,254,97,124,111,61,29,54,110,245,
    186,11,253,11,127,213,20,73,8,25,201,22,107,4,75,26,120])
);

const connect = new Connection(
    clusterApiUrl('devnet'),
    'confirmed'
);

async function createMintForToken(){
    const mint = await createMint(
        connect,
        payerNew,
        payer.publicKey,
        null,
        6
    );

    console.log('Mint created at:',mint.toBase58());
    return mint;
}

async function mintNewToken(mint,to,tokens){
    const amt = tokens*1_000_000;
    const TokenAmount = await getOrCreateAssociatedTokenAccount(
        connection,
        payerNew,
        mint,
        new PublicKey(to)
    );

    await mintTo(
        connection,
        payerNew,
        mint,
        TokenAmount.address,
        payerNew.publicKey,
        amt
    );

    console.log(`Minted ${tokens} tokens to ${to}`);
}

async function main(){
    const mint =  await createMintForToken();
    await mintNewToken(mint,payer.publicKey,100);
}
main();
