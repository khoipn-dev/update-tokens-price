const ABI = require("./abi/pancake_pair_abi.json");
const { web3 } = require("./web3");
const { Telegraf } = require("telegraf");
const Binance = require("node-binance-api");

const EGG_BUSD_PAIR_ADDRESS = "0xdb5be93d8830d93d2a406b2e235038db4ee7d9b1";
const EGG_TOKEN_ADDRESS = "0xcfbb1bfa710cb2eba070cc3bec0c35226fea4baf";
const BOT_TELEGRAM_TOKEN = "1970506098:AAHsiLHt0N5JHD-gEQ9hEIQTkc3xizHHxXY";
const CHANNEL_ID = "@khoipn_crypto_bot";
const TIME_ONCE_UPDATE = 5 * 1000;
const MY_ADDRESS = '0xc59F31c4e81C852311fA675B13A44E5FfF2a6d50';

const binance = new Binance();
const bot = new Telegraf(BOT_TELEGRAM_TOKEN);

let previousPrice;

setInterval(async () => {
  try {
    await updatePrice();
  } catch (error) {
    await updatePrice();
  }
}, TIME_ONCE_UPDATE);

const updatePrice = async () => {
  const eggPrice = await getTokenPrice(EGG_BUSD_PAIR_ADDRESS);
  const eggBalance = await getBalanceOfAddress(EGG_TOKEN_ADDRESS, MY_ADDRESS);
  const totalEgg = eggPrice * eggBalance;
  const bnbPrice = await getPriceBNB();
  const bnbBalance = await getBalanceOfAddress(null, MY_ADDRESS);
  const totalBNB = bnbPrice * bnbBalance;
  await bot.telegram.sendMessage(
      CHANNEL_ID,
      `${Number(eggPrice) <= Number(previousPrice) ? '❗': ''}${eggPrice.toFixed(5)}⚡${totalEgg.toFixed(3)}⚡${bnbPrice}⚡${totalBNB.toFixed(3)}`
  );
  previousPrice = eggPrice;
};

const getBalanceOfAddress = async (contractAddress, address) => {
  if (!!contractAddress) {
    const contract = new web3.eth.Contract(ABI, contractAddress);
    const balance = await contract.methods.balanceOf(address).call();
    return balance / Math.pow(10, 18);
  } else {
    const balance = await  web3.eth.getBalance(address);
    return balance / Math.pow(10, 18);
  }
};

const getTokenPrice = async (pairAddress) => {
  const pair_contract = new web3.eth.Contract(ABI, pairAddress);
  const reserve = await pair_contract.methods.getReserves().call();
  const raw_amount_0 = reserve._reserve0;
  const raw_amount_1 = reserve._reserve1;
  const token_amount_0 = raw_amount_0 / Math.pow(10, 18);
  const token_amount_1 = raw_amount_1 / Math.pow(10, 18);
  return token_amount_1 / token_amount_0;
}

const getPriceBNB = async () => {
  try {
    let ticker = await binance.prices("BNBBUSD") || 0;
    return Number(ticker["BNBBUSD"]).toFixed(3);
  } catch {
    return 0;
  }
};
