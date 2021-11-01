import './App.css';
import { useState, useEffect } from 'react';
import { Connection, PublicKey, clusterApiUrl} from '@solana/web3.js';
import {
  Program, Provider, web3
} from '@project-serum/anchor';

import idl from './idl.json';
import kp from './keypair.json'

// import { getPhantomWallet } from '@solana/wallet-adapter-wallets';
// import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
// import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
// require('@solana/wallet-adapter-react-ui/styles.css');

const wallets = [
  /* view list of available wallets at https://github.com/solana-labs/wallet-adapter#wallets */
  // getPhantomWallet()
]

const { SystemProgram, Keypair } = web3;
/* create an account  */
let baseAccount = Keypair.generate();

console.log("base account", baseAccount)
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const pair = web3.Keypair.fromSecretKey(secret)

// baseAccount = pair
console.log("base account", baseAccount.publicKey.toString())

const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl('devnet');

const opts = {
  preflightCommitment: "processed"
}

function App() {
  const [value, setValue] = useState(null);
  // const wallet = useWallet();
  let [walletAddress, setWalletAddress] = useState(null)

  const getCounter = async() => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );

    const program = new Program(idl, programID, provider);
    console.log("idl", idl)
    console.log("pid", programID.toString())
    const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    console.log("got val", account.dataList[0].name)
    setValue(account.count.toString())
  }
 
  const checkIfWalletIsConnected = async () => {
    const { solana } = window;
    console.log(window.solana)
    if (!solana) {
      alert("Get Phantom pls")
      return
    }

    try {
      const resp = await solana.connect({ onlyIfTrusted: true });
      console.log("Already connected", resp)
      setWalletAddress(resp.publicKey.toString())
      await getCounter()
    } catch(err) {
      console.log(err)
    }    
  }

  const connectWallet = async() => {
    const resp = await window.solana.connect();
    console.log("Already connected", resp)
    setWalletAddress(resp.publicKey.toString())
  }

  async function increment() {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    const program = new Program(idl, programID, provider);
    await program.rpc.increment({
      accounts: {
        baseAccount: baseAccount.publicKey
      }
    });

    const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    setValue(account.count.toString());
  }

  async function createCounterAccount() {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    const program = new Program(idl, programID, provider);
    console.log("idl", idl)
    try {
      await program.rpc.create({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });

      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      console.log('account: ', account);
      setValue(account.count.toString());
    } catch (err) {
      console.log("Transaction error: ", err);
    }
  }

  useEffect(() => {
    // const interval = setInterval(() => {
    //   const solana = {window};
    //   console.log("SOLANA = ", solana);
    //   clearInterval(interval)
    // }, 1000);

    // return () => {
    //   clearInterval(interval);
    // }
    checkIfWalletIsConnected()
  }, [])


  return (
    <div>
      {!walletAddress && (
        <button onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
      {value === null && (
        <button onClick={createCounterAccount}>
          Create Counter
        </button>
      )}
      {value && (
        <>
        <div>
          Counter is at {value}
        </div>
        <button onClick={increment}>
          Increment
        </button>
        </>
      )}
    </div>
  )
}

export default App;