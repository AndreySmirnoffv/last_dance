require("dotenv").config({ path: "./assets/modules/.env" });
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const bot = new TelegramBot(process.env.devStatus ? process.env.TEST_TOKEN : process.env.DEAFAULT_TOKEN, {
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


bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const channelUsername = '@MCLPodPivomTournament'

  if (msg.chat.type !== 'private') {
    try {
      const chatMember = await bot.getChatMember(channelUsername, userId);
      if (!chatMember || (chatMember.status !== "member" && chatMember.status !== "administrator" && chatMember.status !== "creator")) {
        await bot.sendMessage(chatId, "Вы не подписаны на канал. Пожалуйста, подпишитесь и напишите мне в личные сообщения (/start), чтобы получить доступ к командам.");
        return;
      }
    } catch (error) {
      console.error("Произошла ошибка при проверке подписки:", error);
      await bot.sendMessage(chatId, "Произошла ошибка при проверке подписки. Пожалуйста, попробуйте еще раз позже.");
      return;
    }
  } else {
    if (msg.text.startsWith("/")) {
      if (msg.text === "/start") {
        await bot.sendMessage(chatId, "Привет! Чтобы получить доступ к командам, подпишитесь на наш канал: @" + channelUsername, {
          reply_markup: {
            remove_keyboard: true
          }
        });
      } else if (msg.text === "/getcard") {
        giveRandomCardToUser(bot, msg);
      } else {
        await bot.sendMessage(chatId, "Неправильная команда. Доступные команды: /start, /getcard");
      }
    } else {
      if (msg.chat.type === 'private') {
        await bot.sendMessage(chatId, "Чтобы воспользоваться командами, отправьте их в общий чат.");
      } else {
        await bot.sendMessage(chatId, "Чтобы воспользоваться командами, отправьте их в личные сообщения боту.");
      }
    }
  }

  let user = db.find(user => user.username === msg.from.username)

  if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
    if (msg.text === "/getсard" || msg.text === '🀄️ Получить карточку') {
      giveRandomCardToUser(bot, msg);
    }
  } else {
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
            lastActionTime: 0
          });
          fs.writeFileSync('./assets/db/db.json', JSON.stringify(db, null, "\t"));
          await bot.sendMessage(chatId, `Привет ${msg.from.username}`, userStartKeyboard);
        } else {
          const isAdminMessage = user.isAdmin ? "Вы админ!" : "";
          await bot.sendMessage(chatId, `Привет ${msg.from.username}. ${isAdminMessage}`, user?.isAdmin ? adminStartKeyboard : userStartKeyboard);
        }
        break;
      case "/profile":
      case "👤 Личный Профиль":
        sendProfileData(bot, msg);
        break;
      case "/arenas":
      case "⚔️ Арены":
        await bot.sendMessage(chatId, "Список Арен", arenaKeyboard);
        break;
      case "/shop":
      case "🛒 Магазин паков":
        await bot.sendMessage(chatId, '💰 Цена каждого "пака" равняется 2000 валюты\n\n💰 Повторяющиеся карты дают на баланс сумму, которая равна половине от силы полученной повторной карты', shopKeyboard);
        break;
      case "⚙️ Админ панель":
        if (user?.isAdmin) {
          await bot.sendMessage(chatId, "вот что ты можешь сделать", adminOptionsKeyboard);
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
        await bot.sendMessage(chatId, "Введите имя пользователя от которого вы узнали про нас");
        bot.once('message', async (nextMsg) => {
          await refLink(bot, nextMsg);
        });
        break;
      case "🀄️ Получить карточку":
      case "/getcard":
        giveRandomCardToUser(bot, msg)
      default:
        break;
    }
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

bot.onText(/\/getcard/, async (msg) => {
  const chatId = msg.chat.id;
  if (msg.chat.type === 'private') {
    // Если это личное сообщение, отправляем случайную карту пользователю
    giveRandomCardToUser(bot, msg);
  } else {
    // В остальных случаях (в группах или супергруппах) отправляем сообщение о выборе команды
    giveRandomCardToUser(bot, msg);

  }
});


bot.on("new_chat_members", async (msg) => {
  const chatId = msg.chat.id;
  const channelUsername = "@MCLPodPivom";
  const botId = bot.botId;

  if (msg.new_chat_members.some(member => member.id === botId)) {
    await bot.sendMessage(chatId, "Привет! Спасибо за добавление меня в чат. Я могу реагировать только на команду /getCard.");
  }
});
bot.on("polling_error", console.log);
