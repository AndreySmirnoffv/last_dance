const fs = require("fs");
const { profileKeyboard } = require("../../keyboard/keyboard");
const promos = require("../../db/promos/promos.json");
const db = require("../../db/db.json");
const cardsData = require("../../db/images/images.json");

async function sendProfileData(bot, msg) {
  const filteredUsers = db.filter((user) => user.username === msg.from.username);
  
  if (filteredUsers.length > 0) {
    const user = filteredUsers[0];
    const allCards = cardsData; // cardsData уже должен быть объектом JSON

    const userInventory = user.inventory || [];
    const userCardsCount = userInventory.length;
    const allCardsCount = allCards.length;

    await bot.sendMessage(msg.chat.id, `${userCardsCount} из ${allCardsCount}`);
    await bot.sendMessage(msg.chat.id, `Имя пользователя: ${user.username}\nID: ${user.id}\nИмя: ${user.first_name}\nФамилия: ${user.last_name}\nБаланс: ${user.balance}\nРейтинг: ${user.rating}\nИнвентарь: ${userCardsCount} из ${allCardsCount}\n`, profileKeyboard);
  } else {
    await bot.sendMessage(msg.chat.id, 'Пользователь не найден.');
  }
}


async function myCards(bot, msg) {
  try {
    const userIndex = db.findIndex(
      (user) => user.username === msg.from.username
    );

    if (userIndex === -1 || !db[userIndex].hasOwnProperty("inventory")) {
      console.error("Ошибка: Пользователь не найден или у него нет инвентаря.");
      return bot.sendMessage(
        msg.chat.id,
        "У вас нет карт в инвентаре. Попробуйте получить карты сначала."
      );
    }

    const userInventory = db[userIndex].inventory;

    if (userInventory.length === 0) {
      return bot.sendMessage(
        msg.chat.id,
        "У вас нет карт в инвентаре. Попробуйте получить карты сначала."
      );
    }

    for (const card of userInventory) {
      await bot.sendPhoto(msg.chat.id, card.fileId, {
        caption: `🦠 ${card.name}\n🔮 Редкость: ${card.rarity}\nАтака: ${
          card.power || "Не указана"
        }\nЗащита: ${card.deffence || "Не указана"}`,
      });
    }
  } catch (error) {
    console.error(
      "Произошла ошибка при выводе карт пользователя:",
      error.message
    );
    await bot.sendMessage(
      msg.chat.id,
      "Произошла ошибка при выводе ваших карт. Попробуйте еще раз."
    );
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
  let name = users.find((user) => user.username === msg.data.from.username);
  if (!name) {
    await bot.sendMessage(msg.message.chat.id, "вас нету в базе данных");
  } else {
    await bot.sendMessage(
      msg.message.chat.id,
      "напишите имя на которое хотите изменить ваш username"
    );
    name.username = msg.text;
    fs.writeFileSync(
      "../../db/db.json",
      JSON.stringify(name.username, null, "\t")
    );
  }
}

module.exports = {
  sendProfileData: sendProfileData,
  changeName: changeName,
  myCards: myCards,
  checkPromo: checkPromo,
};
