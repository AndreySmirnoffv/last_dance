require("dotenv").config({ path: "./assets/modules/.env" });
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const bot = new TelegramBot("6444174240:AAGxeM1ho9sLG6CXOCjRFh96NUp4ChHcxYI", {
  polling: true,
});
const {
  adminStartKeyboard,
  userStartKeyboard,
  arenaKeyboard,
  adminOptionsKeyboard,
  shopKeyboard,
} = require("./assets/keyboard/keyboard");
const {
  sendProfileData,
  changeName,
  myCards,
  refLink,
  addCardToMatchInventory,
} = require("./assets/scripts/userFunctions");
const {
  setAdmin,
  giveCardToUser,
  findUser,
  createPromo,
  showAllUsers,
  askCardDetails,
  addShopText,
  removeAdmin,
} = require("./assets/scripts/adminFunctions");
const {
  addToWaitingRoom,
  matchInventory,
  processCallback,
  checkAndCreateMatch,
  addToMatchInventory,
} = require("./assets/scripts/matchFunctions");
const {
  getPack,
  getUniquePack,
} = require("./assets/scripts/shopFunctions");
const { giveRandomCardToUser } = require("./assets/scripts/getCard");
const { top } = require("./assets/scripts/top");

const shopText = require("./assets/db/shop/shop.json");
const commands = JSON.parse(fs.readFileSync("./assets/db/commands/commands.json"));
const db = require('./assets/db/db.json');

bot.setMyCommands(commands);

bot.onText(/\/getсard/, async (msg) => {
  const chatId = msg.chat.id;
  if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
    let user = db.find(user => user.id === msg.from.id);
    if (!user) {
      await bot.sendMessage(msg.from.id, "Вы не зарегистрированы в нашей системе. Для получения карты вам необходимо зарегистрироваться.");
      return;
    }
    giveRandomCardToUser(bot, msg);
  } else {
    await bot.sendMessage(msg.chat.id, 'Выберите команду:', userStartKeyboard);
  }
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // Проверка подписки на канал
  const channelUsername = "@MCLPodPivomTournament";
  try {
    const chatMember = await bot.getChatMember(channelUsername, userId);
    if (chatMember && (chatMember.status === "member" || chatMember.status === "administrator" || chatMember.status === "creator")) {
      console.log();
    } else {
      await bot.sendMessage(chatId, "Вы не подписаны на канал. Пожалуйста, подпишитесь.\n@MCLPodPivomTournament");
      return;
    }
  } catch (error) {
    await bot.sendMessage(chatId, "Произошла ошибка при проверке подписки. Попробуйте позже.");
    return;
  }

  let user = db.find(user => user.id === msg.from.id)

  // Обработка сообщений в личных чатах
  switch (msg.text) {
    case "/start":
      if (!user) {
        db.push({
          id: msg.from.id,
          username: msg.from.username,
          first_name: msg.from.first_name,
          last_name: msg.from.last_name,
          balance: 0,
          rating: null,
          inventory: [],
          matchInventory: [],
          isAdmin: false,
          isWaiting: false,
          isMatch: false,
          wonMatches: 0,
          looseMatches: 0,
        });
        fs.writeFileSync("./assets/db/db.json", JSON.stringify(db, null, "\t"));
        await bot.sendMessage(msg.chat.id, `Привет ${msg.from.username}`, userStartKeyboard);
      } else {
        const isAdminMessage = user.isAdmin ? "Вы админ!" : "";
        await bot.sendMessage(msg.chat.id, `Привет ${msg.from.username}. ${isAdminMessage}`, user?.isAdmin ? adminStartKeyboard : userStartKeyboard);
      }
      break;
    case "/profile":
    case "👤 Личный Профиль":
      sendProfileData(bot, msg);
      break;
    case "/arenas":
    case "⚔️ Арены":
      await bot.sendMessage(msg.chat.id, "Список Арен", arenaKeyboard);
      break;
    case "/shop":
    case "🛒 Магазин паков":
      await bot.sendMessage(msg.chat.id, '💰 Цена каждого "пака" равняется 2000 валюты\n\n💰 Повторяющиеся карты дают на баланс сумму, которая равна половине от силы полученной повторной карты', shopKeyboard);
      break;
    case "⚙️ Админ панель":
      if (user?.isAdmin) {
        await bot.sendMessage(msg.chat.id, "вот что ты можешь сделать", adminOptionsKeyboard);
      }
      break;
    case "🀄️ Добавить карту в инвентарь матчей":
    case "/addcardtomatch":
      matchInventory(bot, msg);
      break;
    case "/top":
      top(bot, msg);
      break;
    case "Реферальная ссылка":
      await bot.sendMessage(msg.chat.id, "Введите имя пользователя от которого вы узнали про нас");
      bot.once('message', async (nextMsg) => {
        await refLink(bot, nextMsg);
      });
      break;
    default:
      // Остальные команды
      break;
  }
});


bot.on("callback_query", async (msg) => {
  if (msg.data.startsWith("createPromo_")) {
    await addToMatchInventory(bot, msg);
  } else if (msg.data === "createPromo") {
    createPromo(bot, msg);
  } else if (msg.data === "showAllUsers") {
    showAllUsers(bot, msg);
  } else if (msg.data === "findUser") {
    await bot.sendMessage(msg.message.chat.id, "Пришлите мне username пользователя");
    await findUser(bot, msg);
  } else if (msg.data === "addCardToUser") {
    giveCardToUser(bot, msg);
  } else if (msg.data === "setAdmin") {
    await bot.sendMessage(msg.message.chat.id, "Пришлите мне имя пользователя");
    bot.once("message", (msg) => setAdmin(bot, msg));
  } else if (msg.data === "usualmatch") {
    await addToWaitingRoom(bot, msg);
  } else if (msg.data === "getonepack") {
    console.log("callback сработал")
    await getPack(bot, msg, 1);
  } else if (msg.data === "getfivepacks") {
    getPack(bot, msg, 5);
  } else if (msg.data === "gettenpacks") {
    getPack(bot, msg, 10);
  } else if (msg.data === "rating") {
    processCallback(bot, msg);
  } else if (msg.data === "usual") {
    checkAndCreateMatch(bot, msg);
  } else if (msg.data === "changename") {
    await bot.sendMessage(msg.message.chat.id, "напишите имя на которое хотите изменить ваш username");
    bot.once("message", (msg) => changeName(bot, msg));
  } else if (msg.data === "mycards") {
    myCards(bot, msg);
  } else if (msg.data === "closewindow") {
    await bot.deleteMessage(msg.message.chat.id, msg.message.message_id);
    await bot.sendMessage(msg.message.chat.id, "Привет админ вот что ты можешь сделать", adminStartKeyboard);
  } else if (msg.data === "addcard") {
    askCardDetails(bot, msg);
  } else if (msg.data === "myteam") {
    myCards(bot, msg);
  } else if (msg.data === "addshoptext") {
    addShopText(bot, msg);
  } else if (msg.data === "getuniquepack") {
    await getUniquePack(bot, msg);
  } else if (msg.data === "ratingmatch") {
    processCallback(bot, msg);
  } else if (msg.data === "removeadmin") {
    removeAdmin(bot, msg);
  }else if(msg.data === 'addToMatchInventory'){
    addCardToMatchInventory(bot, msg)
  }else {
    await bot.sendMessage(msg.message.chat.id, "Таких данных не существует");
  }
});

bot.on("new_chat_members", async (msg) => {
  const chatId = msg.chat.id;
  const channelUsername = "@MCLPodPivomTournament";
  const botId = bot.botId;

  if (msg.new_chat_members.some(member => member.id === botId)) {
    await bot.sendMessage(chatId, "Привет! Спасибо за добавление меня в чат. Я могу реагировать только на команду /getCard.");
  }
});



bot.on("polling_error", console.log);
