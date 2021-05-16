const PancakePairABI = require("./abi/pancake_pair_abi.json");
const { web3 } = require("./web3");
const { Telegraf } = require("telegraf");

const XPO_PAIR_ADDRESS = "0xdf1bc24552c04c9e0a3cf09b4148ea438087181e";
const BOT_TELEGRAM_TOKEN = "1780315149:AAFmkfg1dkEwKSfO1ypMIaWu_FChx3UPm6g";
const CHANNEL_ID = "@xpo_price";
const TIME_ONCE_UPDATE = 15 * 1000;

const bot = new Telegraf(BOT_TELEGRAM_TOKEN);
const COUNT_XPO = 648.85627;

setInterval(async () => {
  try {
    await updatePrice();
  } catch (error) {
    await updatePrice();
  }
}, TIME_ONCE_UPDATE);

const updatePrice = async () => {
  let xpoPrice = await getPrice(XPO_PAIR_ADDRESS);
  const total = xpoPrice * COUNT_XPO;
  bot.telegram.sendMessage(
    CHANNEL_ID,
    `⚡${xpoPrice.toFixed(4)}⚡${total.toFixed(4)}⚡`
  );
};

async function getPrice(pairAddress) {
  const pair_contract = new web3.eth.Contract(PancakePairABI, pairAddress);
  const reserve = await pair_contract.methods.getReserves().call();
  const raw_amount_0 = reserve._reserve0;
  const raw_amount_1 = reserve._reserve1;
  const token_amount_0 = raw_amount_0 / Math.pow(10, 18);
  const token_amount_1 = raw_amount_1 / Math.pow(10, 18);
  if (pairAddress === XPO_PAIR_ADDRESS) {
    return token_amount_0 / token_amount_1;
  }
  return token_amount_1 / token_amount_0;
}
