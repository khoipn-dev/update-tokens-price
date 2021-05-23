const ABI = require("./abi/pancake_pair_abi.json");
const { web3 } = require("./web3");
const { Telegraf } = require("telegraf");
const axios = require("axios");

const XPO_BUSD_PAIR_ADDRESS = "0xdf1bc24552c04c9e0a3cf09b4148ea438087181e";
const XPO_TOKEN_ADDRESS = "0xeBB59CeBFb63f218db6B5094DC14AbF34d56D35D";
const BOT_TELEGRAM_TOKEN = "1780315149:AAFmkfg1dkEwKSfO1ypMIaWu_FChx3UPm6g";
const CHANNEL_ID = "@xpo_price";
const TIME_ONCE_UPDATE = 15 * 1000;
const MY_ADDRESS = '0xC00Ece9f495Cb089DF429f383d3e164AC6bC198c';

const bot = new Telegraf(BOT_TELEGRAM_TOKEN);

setInterval(async () => {
  try {
    await updatePrice();
  } catch (error) {
    await updatePrice();
  }
}, TIME_ONCE_UPDATE);

const updatePrice = async () => {
  const xpoPrice = await getPriceXPO(XPO_BUSD_PAIR_ADDRESS);
  const xpoBalance = await getBalanceOfAddress(XPO_TOKEN_ADDRESS, MY_ADDRESS);
  const totalXPO = xpoPrice * xpoBalance;
  const bnbPrice = await getPriceBNB();
  const bnbBalance = await getBalanceOfAddress(null, MY_ADDRESS);
  const totalBNB = bnbPrice * bnbBalance;
  bot.telegram.sendMessage(
    CHANNEL_ID,
    `⚡${xpoPrice.toFixed(4)}⚡${totalXPO.toFixed(4)}⚡${bnbPrice}⚡${totalBNB.toFixed(4)}⚡`
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

const getPriceXPO = async (pairAddress) => {
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
    const res = await axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=binancecoin');
   return res.data[0].current_price || 0;
  } catch {
    return 0;
  }
};
