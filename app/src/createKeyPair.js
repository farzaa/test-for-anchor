/* createKeypair.js */
const fs = require('fs')
const anchor = require("@project-serum/anchor");
const web3 = require('@solana/web3.js')

const account = anchor.web3.Keypair.generate();

fs.writeFileSync('./keypair.json', JSON.stringify(account))