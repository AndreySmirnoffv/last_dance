const fs = require("fs");

const cards = require("../db/images/images.json");

const users = require("../db/db.json");

const dbPath = "../db/db.json"

const shopText = require('../db/shop/shop.json')

async function getPack(bot, msg, packCount) {
  try {
    console.log("функция начала свое выполнение")
    const userId = msg.from.id;
    const user = users.find((x) => x.username === msg.from.username);

    if (!user) {
      return await bot.sendMessage(userId, "Пользователь не найден.");
    }

    const totalCost = cards.reduce((acc, card) => acc + card.power, 0) * packCount;

    if (user.balance == null || isNaN(user.balance)) {
      user.balance = 0;
      fs.writeFileSync("assets/db/db.json", JSON.stringify(users, null, '\t'));
    }else if (user.balance < totalCost) {
      user.balance = 0
      fs.writeFileSync("assets/db/db.json", JSON.stringify(users, null, '\t'))
      return bot.sendMessage(
        userId,
        `У вас недостаточно баланса для открытия ${packCount} паков.`
      );
    }

    const openedCards = [];
    const shopMessage = (shopText.message|| "Текст не найден в магазине.").trim();

    for (let i = 0; i < packCount; i++) {
      console.log("цикл начал свое выполнение")
      const randomCard = cards[Math.floor(Math.random() * cards.length)];
      const existingCard = user.inventory.find(
        (card) => card.cardName === randomCard.cardName
      );
        console.log("фильрация карт завершена")
      if (randomCard.cardName == existingCard.cardName) {
        user.balance += randomCard.cardPower / 2;
        fs.writeFileSync('assets/db/db.json', JSON.stringify(users, null, '\t'))
        await bot.sendMessage(userId, `Вам выпала повторная карта ваш баланс составляет ${user.balance}`)
      } else if (typeof randomCard.cardPower === "number") {
        user.inventory.push(randomCard);
        openedCards.push(randomCard);
        user.balance += 0.5 * randomCard.cardPower;
        fs.writeFileSync("assets/db/db.json", JSON.stringify(users, null, "\t"));

        const photoMessage = `${shopMessage} Вы открыли ${packCount} паков и получили карты: ${openedCards.map((card) => card.name).join(", ")}. Новый баланс: ${user.balance}. сила карты ${openedCards.power}.`
        await bot.sendPhoto(userId, randomCard.cardPhoto, {caption: photoMessage} );
      } else {
        return;
      }
    }

  } catch (error) {
    bot.sendMessage(msg.message.from.id, "Произошла ошибка при обработке вашего запроса.");
    throw error;
  }
}

async function getUniquePack(bot, msg) {
  try {
    console.log("функция начала свое выполнение")
    const userId = msg.message.chat.id;

    const user = users.find(user => user.username === msg.from.username);

    const zeroDropChanceCards = cards.find((card) => card.cardDropChance === 0);

    const openedCards = [];
    const shopMessage = (shopText.message|| "Текст не найден в магазине.").trim();

    let updatedBalance = user.balance || 0;
    console.log("валидация юзера")
    if (!user) {
      return await bot.sendMessage(userId, "Пользователь не найден.");
    }else if (user.balance < updatedBalance || isNaN(updatedBalance) || updatedBalance < 0) {
      return bot.sendMessage(userId, "У вас недостаточно баланса для открытия уникального пака.");
    }
    console.log('валидация юзера прошла успешно')

    if (zeroDropChanceCards in user.inventory) {
      user.inventory.push(zeroDropChanceCards);
      fs.writeFileSync("assets/db/db.json", JSON.stringify(users, null, '\t'))
      const photoMessage = `${shopMessage} Вы открыли уникальный пак и получили карту: ${user.inventory.filter((card) => card.cardName).join(", ")}. Новый баланс: ${user.balance}. сила карты ${zeroDropChanceCards.cardPower}.`

      await bot.sendMessage(userId, "Вам выпала повторная карта ваш баланс составляет: " + user.balance)

    }else{
      user.inventory.push(zeroDropChanceCards);
      fs.writeFileSync("assets/db/db.json", JSON.stringify(users, null, "\t"));
      await bot.sendPhoto(userId, zeroDropChanceCards.cardPhoto, {caption: photoMessage} );
    }
  } catch (error) {
    bot.sendMessage(msg.message.chat.id,"Произошла ошибка при обработке вашего запроса.");
    throw error;
  }
}

module.exports = {
  getPack: getPack,
  getUniquePack: getUniquePack,
};
