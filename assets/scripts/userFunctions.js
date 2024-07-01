const fs = require("fs");
const { profileKeyboard, addMatchInventory } = require("../keyboard/keyboard");
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

  if (userInventory.length === 0) {
    return await bot.sendMessage(msg.message.chat.id, "У вас нет карт в инвентаре. Попробуйте получить карты сначала.");
  } else {
    let currentIndex = 0
    await bot.sendPhoto(msg.message.chat.id, cards[currentIndex].cardPhoto, {
      reply_markup: {
        inline_keyboard: [[{text: "->", callback_data: "next_card"}]]
      }
    })
    if (msg.data === 'next_card'){
      console.log("next card")
      const card = userInventory.inventory[currentIndex]
      await bot.sendPhoto(chatId, card.cardPhoto, {
        caption: `Название: ${card.cardName}\nМощность: ${card.cardPower}\nСекция: ${card.cardSection}\nРедкость: ${card.cardRarity}\nШанс выпадения: ${card.cardDropChance}\nЗащита: ${card.cardDeffence}`,
        reply_markup: {
            inline_keyboard: [[{ text: "->", callback_data: "next_card" }]]
        }
    });
    currentIndex = (currentIndex + 1) % inventory.length
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
      "./assets/db/promos/promos.json",
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
}// Путь к файлу db.json

async function refLink(bot, msg) {
  let usedRefLinks = [];

  if (msg.from && msg.from.username) {
    if (usedRefLinks.includes(msg.from.username)) {
      return bot.sendMessage(msg.chat.id, "Вы уже использовали ссылку.");
    }

    let cleanedUsername = msg.text;

    if (!cleanedUsername) {
      console.log("Сообщение не содержит текст, вероятно, оно не введено пользователем.");
      return;
    }

    console.log("Имя пользователя для поиска:", cleanedUsername);

    let userExists = db.some(user => user.username === cleanedUsername);

    console.log("Пользователь найден:", userExists);

    if (userExists) {
      let user = db.find(user => user.username === cleanedUsername);
      user.balance += 2000;
      usedRefLinks.push(msg.from.username); // Добавляем имя пользователя в список использованных ссылок
      fs.writeFileSync('./assets/db/db.json', JSON.stringify(db, null, '\t'));
      await bot.sendMessage(msg.chat.id, "Мы передали ему спасибо");
    } else {
      await bot.sendMessage(msg.chat.id, "Такого пользователя не существует");
    }

    cleanedUsername = undefined;
  }
}



async function addCardToMatchInventory(bot, msg){
  let userInventory = cards.find(card => card.cardName === msg.text)
  let user = db.find(user => user.username === msg.message.from.username)
  if(!userInventory && msg.text){
    await bot.sendMessage(msg.message.chat.id, "Такой карты не существует")
  }else{
    await bot.sendMessage(msg.message.chat.id, "карта успешно добавлена в инвентарь")
    user?.matchInventory?.push(userInventory)
    fs.writeFileSync('./assets/db/db.json', JSON.stringify(db, null, '\t'))
  }
  
}

module.exports = {
  sendProfileData: sendProfileData,
  changeName: changeName,
  myCards: myCards,
  checkPromo: checkPromo,
  addCardToMatchInventory: addCardToMatchInventory,
  refLink: refLink
};
