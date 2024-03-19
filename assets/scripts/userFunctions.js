const fs = require("fs");
const { profileKeyboard } = require("../keyboard/keyboard");
const promos = require("../db/promos/promos.json");
const db = require("../db/db.json");
const cards = require("../db/images/images.json");

async function sendProfileData(bot, msg) {
  const filteredUsers = db.filter((user) => user?.id === msg.from.id);

  if (filteredUsers.length > 0) {
    const user = filteredUsers[0];

    await bot.sendMessage(
      msg.chat.id,
      `Имя пользователя: ${user.username}\nID: ${user.id}\nИмя: ${user.first_name}\nФамилия: ${user.last_name}\nБаланс: ${user.balance}\nРейтинг: ${user.rating}\nИнвентарь: ${user.inventory.length} из ${cards.length}\n`,
      profileKeyboard
    );
  } else {
    await bot.sendMessage(msg.chat.id, "Пользователь не найден.");
  }
}

async function myCards(bot, msg) {
  const userInventory = db.find((user) => user?.username === msg.from.username);
  const matchInventoryOptions = userInventory.inventory.find(card => ({
    cardName: card.cardName,
    cardPhoto: card.cardPhoto,
    CardPower: card.cardPower,
    cardSection: card.cardSection,
    cardRarity: card.cardRarity,
    cardDropChance: card.cardDropChance,
    cardDeffence: card.cardDeffence

  }));
  const options = {
    reply_markup: JSON.stringify({
      inline_keyboard: matchInventoryOptions.map(card => [
        {
          text: `Добавить в инвентарь матча: ${card.cardName}`,
          callback_data: `addToMatchInventory:${card.cardName}:${card.cardPower}`,
        },
      ]),
    }),
  };
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
        }`, options
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
  let user = db.find((user) => user.id === msg.from.id);

  user.first_name = msg.text;
  fs.writeFileSync(db, JSON.stringify(db, null, "\t"));
  await bot.sendMessage(
    msg.chat.id,
    `Вы успешно сменили имя на ${db[name].first_name}`
  );
}


async function refLink(bot, msg){
  let user = db.find(x => x.username === msg.text)
  if (!user){
    return await bot.sendMessage(msg.chat.id, "Такого пользователя не существует")
  }else{
    user.balance += 2000
    fs.writeFileSync("../db/db.json", JSON.stringify(user, null, '\t'))
    await bot.sendMessage(user.id, "Спасибо за приглашение друга вам было добавлено 2000 на баланс")
  }
}

module.exports = {
  sendProfileData: sendProfileData,
  changeName: changeName,
  myCards: myCards,
  checkPromo: checkPromo,
  refLink: refLink
};
