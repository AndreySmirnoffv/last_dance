const fs = require("fs");
const { profileKeyboard } = require("../../keyboard/keyboard");
const promos = require("../../db/promos/promos.json");
const db = require("../../db/db.json");
const path = require("path");
const userDb = path.join(__dirname, "../../db/db.json");
const cardsPath = path.join(__dirname, "../../db/images/images.json");
const cards = require(cardsPath);

async function sendProfileData(bot, msg) {
  const filteredUsers = db.filter((user) => user?.id === msg.from.id);

  if (filteredUsers.length > 0) {
    const user = filteredUsers[0];

    const userInventory = user.inventory;
    // const userCardsCount = userInventory.length;
    const allCardsCount = cards.length;
    await bot.sendMessage(
      msg.chat.id,
      `Имя пользователя: ${user.username}\nID: ${user.id}\nИмя: ${user.first_name}\nФамилия: ${user.last_name}\nБаланс: ${user.balance}\nРейтинг: ${user.rating}\nИнвентарь: ${userInventory.length} из ${allCardsCount}\n`,
      profileKeyboard
    );
  } else {
    await bot.sendMessage(msg.chat.id, "Пользователь не найден.");
  }
}

async function myCards(bot, msg) {
  const userInventory = db.find((user) => user?.username === msg.from.username);

  if (userInventory.length === 0) {
    return bot.sendMessage(
      msg.message.chat.id,
      "У вас нет карт в инвентаре. Попробуйте получить карты сначала."
    );
  } else {
    for (const card of userInventory?.inventory) {
      await bot.sendPhoto(msg.message.chat.id, card.cardPhoto, {
        caption: `🦠 ${card.cardName}\n🔮 Редкость: ${
          card.cardRarity
        }\nАтака: ${card.cardPower || "Не указана"}\nЗащита: ${
          card.cardDeffence || "Не указана"
        }`,
      });
    }
  }
}

async function checkPromo(bot, msg) {
  let promo = promos.find((promo) => promo.name === msg.text);
  if (!promo) {
    await bot.sendMessage(
      msg.message.chat.id,
      "такого промокода не существует"
    );
  } else {
    await bot.sendMessage(
      msg.message.chat.id,
      "поздравляю вы ввели промокод успешно"
    );
    promo.name = {};
    fs.writeFileSync(
      "../../db/promos/promos.json",
      JSON.stringify(promo.text, null, "\t")
    );
  }
}

async function changeName(bot, msg) {
  let name = db.findIndex((user) => user.id === msg.from.id);
  db[name].first_name = msg.text;
  fs.writeFileSync(userDb, JSON.stringify(db, null, "\t"));
  await bot.sendMessage(
    msg.chat.id,
    `Вы успешно сменили имя на ${db[name].first_name}`
  );
}

module.exports = {
  sendProfileData: sendProfileData,
  changeName: changeName,
  myCards: myCards,
  checkPromo: checkPromo,
};
