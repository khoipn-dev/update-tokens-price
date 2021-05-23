const ABI = require("./abi/pancake_pair_abi.json");
const { web3 } = require("./web3");
const { Telegraf } = require("telegraf");
const Binance = require("node-binance-api");

const XPO_BUSD_PAIR_ADDRESS = "0xdf1bc24552c04c9e0a3cf09b4148ea438087181e";
const XPO_TOKEN_ADDRESS = "0xeBB59CeBFb63f218db6B5094DC14AbF34d56D35D";
const BSCX_BUSD_PAIR_ADDRESS = "0xA32A983a64ce21834221AA0AD1f1533907553136";
const BSCX_TOKEN_ADDRESS = "0x5ac52ee5b2a633895292ff6d8a89bb9190451587";
const BOT_TELEGRAM_TOKEN = "1780315149:AAFmkfg1dkEwKSfO1ypMIaWu_FChx3UPm6g";
const CHANNEL_ID = "@khoipn_crypto_bot";
const TIME_ONCE_UPDATE = 10 * 1000;
const MY_ADDRESS = '0xC00Ece9f495Cb089DF429f383d3e164AC6bC198c';

const binance = new Binance();
const bot = new Telegraf(BOT_TELEGRAM_TOKEN);

setInterval(async () => {
  try {
    await updatePrice();
  } catch (error) {
    await updatePrice();
  }
}, TIME_ONCE_UPDATE);

const updatePrice = async () => {
  const priceXPO = await getTokenPrice(XPO_BUSD_PAIR_ADDRESS);
  const balanceXPO = await getBalanceOfAddress(XPO_TOKEN_ADDRESS, MY_ADDRESS);
  const totalXPO = priceXPO * balanceXPO;
  const bnbPrice = await getPriceBNB();
  const bnbBalance = await getBalanceOfAddress(null, MY_ADDRESS);
  const totalBNB = bnbPrice * bnbBalance;
  bot.telegram.sendMessage(
    CHANNEL_ID,
    `${priceXPO.toFixed(3)}⚡${totalXPO.toFixed(3)}⚡${bnbPrice}⚡${totalBNB.toFixed(3)}`
  );
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
  if (pairAddress === XPO_BUSD_PAIR_ADDRESS) {
    return token_amount_0 / token_amount_1;
  }
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
