const ABI = require("./abi/pancake_pair_abi.json");
const { web3 } = require("./web3");
const { Telegraf } = require("telegraf");
const Binance = require("node-binance-api");

const EGG_BUSD_PAIR_ADDRESS = "0xdb5be93d8830d93d2a406b2e235038db4ee7d9b1";
const EGG_TOKEN_ADDRESS = "0xcfbb1bfa710cb2eba070cc3bec0c35226fea4baf";

const WBNB_DBZ_PAIR_ADDRESS = "0x79bcada5fe6e528a98b49cf38ace983dde3644ce";
const DBZ_TOKEN_ADDRESS = "0x7a983559e130723b70e45bd637773dbdfd3f71db";

const BNB_BUSD_PAIR_ADDRESS = "0x58f876857a02d6762e0101bb5c46a8c1ed44dc16";

const BOT_TELEGRAM_TOKEN = "1970506098:AAHsiLHt0N5JHD-gEQ9hEIQTkc3xizHHxXY";
const CHANNEL_ID = "@khoipn_crypto_bot";
const CHANNEL_ID_BOT_ALERT = "@my_bot_alert";
const TIME_ONCE_UPDATE = 5 * 1000;
const MY_ADDRESS = '0xc59F31c4e81C852311fA675B13A44E5FfF2a6d50';

const binance = new Binance();
const bot = new Telegraf(BOT_TELEGRAM_TOKEN);

let previousPrice;
let priceAlert = 0.023;

setInterval(async () => {
  try {
    await updatePrice();
  } catch (error) {
    await updatePrice();
  }
}, TIME_ONCE_UPDATE);

const updatePrice = async () => {
  const bnbPrice = await getTokenPrice(BNB_BUSD_PAIR_ADDRESS, false);
  const bnbBalance = await getBalanceOfAddress(null, MY_ADDRESS);

  const eggPrice = await getTokenPrice(EGG_BUSD_PAIR_ADDRESS);
  const eggBalance = await getBalanceOfAddress(EGG_TOKEN_ADDRESS, MY_ADDRESS);

  const dbzPrice = await getTokenPrice(WBNB_DBZ_PAIR_ADDRESS, false) * bnbPrice;
  const dbzBalance = await getBalanceOfAddress(DBZ_TOKEN_ADDRESS, MY_ADDRESS);

  const totalEgg = eggPrice * eggBalance;
  const totalBNB = bnbPrice * bnbBalance;
  const totalBDZ = dbzPrice * dbzBalance;
  await bot.telegram.sendMessage(
      CHANNEL_ID,
      `⚡${dbzPrice.toFixed(5)}⚡${totalBDZ.toFixed(3)}⚡${Number(eggPrice) <= Number(previousPrice) ? '❗': ''}${eggPrice.toFixed(5)}⚡${totalEgg.toFixed(3)}⚡${bnbPrice.toFixed(3)}⚡${totalBNB.toFixed(3)}`
  );
  if (Number(eggPrice) > priceAlert) {
    await bot.telegram.sendMessage(
        CHANNEL_ID_BOT_ALERT,
        `${eggPrice.toFixed(5)}⚡${totalEgg.toFixed(3)}`
    );
  }
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

const getTokenPrice = async (pairAddress, isReverse = false) => {
  const pair_contract = new web3.eth.Contract(ABI, pairAddress);
  const reserve = await pair_contract.methods.getReserves().call();
  const raw_amount_0 = reserve._reserve0;
  const raw_amount_1 = reserve._reserve1;
  const token_amount_0 = raw_amount_0 / Math.pow(10, 18);
  const token_amount_1 = raw_amount_1 / Math.pow(10, 18);
  return isReverse ? token_amount_0 / token_amount_1 : token_amount_1 / token_amount_0;
}

const setPriceAlert = () => {
  const bot = new Telegraf(BOT_TELEGRAM_TOKEN);
  bot.start((ctx) => {
    ctx.deleteMessage();
    const messageText = ctx.update.message.text;
    priceAlert = Number(messageText.slice(6));
    if (priceAlert) {
      ctx.reply(`Set price alert to ${priceAlert}`);
    } else {
      ctx.reply(`Have error`);
    }
  })
  bot.launch();
};
setPriceAlert();
