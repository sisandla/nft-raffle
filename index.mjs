import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib(process.env);

const startingBalance = stdlib.parseCurrency(100);

const [ accAlice, accBob ] =
  await stdlib.newTestAccounts(2, startingBalance);
console.log('Hello, Alice and Bob!');

console.log('Launching...');
const ctcAlice = accAlice.contract(backend);
const ctcBob = accBob.contract(backend, ctcAlice.getInfo());

console.log(`Creating the NFT...`)
const theNTF = await stdlib.launchToken(accAlice, 'NoName', 'NFT', {supply: 1});
const nftInfo = {
  nftId: theNTF.id,
  numTickets: 10,
};

const RES = ['Not a match', 'A match']

await accBob.tokenAccept(nftInfo.nftId);

const commonInterface = {
  getNum: (numTickets) => {
    const number = Math.floor(Math.random() * numTickets) + 1;
    return number;
  },
  seeResults: (n) => {
    console.log(`The results is: ${RES[n]}`)
  }
}

console.log('Starting backends...');
await Promise.all([
  backend.Alice(ctcAlice, {
    ...stdlib.hasRandom,
    // implement Alice's interact object here
    ...commonInterface,
    startRaffle: () => {
      console.log(`Send NFT Raffle information to the backend`);
      return nftInfo;
    },
    seeHash: (hashValue) => {
      console.log(`Winning number Hash: ${hashValue}`);
    },
  }),
  backend.Bob(ctcBob, {
    ...stdlib.hasRandom,
    // implement Bob's interact object here
    ...commonInterface,
    showNum: (num) => {
      console.log(`Number is: ${num}`);
    },
    seeWinner: (value) => {
      console.log(`The winning number is: ${value}`)
    }
  }),
]);

console.log('Goodbye, Alice and Bob!');
