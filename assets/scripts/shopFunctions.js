const fs = require("fs");

const cards = require("../db/images/images.json");

const users = require("../db/db.json");

const shopText = require('../db/shop/shop.json')

async function getPack(bot, msg, packCount) {
  try {
    const userId = msg.from.id;
    const user = users.find((x) => x.username === msg.from.username);

    if (!user) {
      return bot.sendMessage(userId, "Пользователь не найден.");
    }

    const totalCost = cards.reduce((acc, card) => acc + card.power, 0) * packCount;

    if (user.balance == null || isNaN(user.balance)) {
      user.balance = 0;
      fs.writeFileSync("../db/db.json", JSON.stringify(users, null, '\t'));
    };
    if (user.balance < totalCost) {
      user.balance = 0
      fs.writeFileSync("../db/db.json", JSON.stringify(users, null, '\t'))
      return bot.sendMessage(
        userId,
        `У вас недостаточно баланса для открытия ${packCount} паков.`
      );
    }

    const openedCards = [];

    for (let i = 0; i < packCount; i++) {
      const randomCard = cards[Math.floor(Math.random() * cards.length)];
      const existingCard = user.inventory.find(
        (card) => card.cardName === randomCard.cardName
      );

      if (existingCard in user.inventory && typeof existingCard.cardPower === "number") {
        return (user.balance = randomCard.cardPower / 2);
      } else if (typeof randomCard.cardPower === "number") {
        user.inventory.push(randomCard);
        openedCards.push(randomCard);
        user.balance += 0.5 * randomCard.cardPower;
      } else {
        return;
      }
    }

    fs.writeFileSync("../db/db.json", JSON.stringify(users, null, "\t"));

    const shopMessage = (shopText.message || "Текст не найден в магазине.").trim();
    bot.sendMessage(userId, `${shopMessage} Вы открыли ${packCount} паков и получили карты: ${openedCards.map((card) => card.name).join(", ")}. Новый баланс: ${user.balance}. сила карты ${openedCards.power}.`);
  } catch (error) {
    bot.sendMessage(msg.message.from.id, "Произошла ошибка при обработке вашего запроса.");
    throw error;
  }
}

async function getUniquePack(bot, msg) {
  try {
    const userId = msg.message.chat.id;

    const user = users.find(user => user.username === msg.from.username);

    if (!user) {
      return bot.sendMessage(userId, "Пользователь не найден.");
    }

    const zeroDropChanceCards = cards.filter((card) => card.dropChance === 0);

    const openedCards = [];
    let updatedBalance = user.balance || 0;

    for (const randomCard of zeroDropChanceCards) {
      const existingCardIndex = users[userIndex].inventory.findIndex(
        (card) => card.name === randomCard.name
      );

      if (existingCardIndex === -1) {
        openedCards.push(randomCard);
        updatedBalance -= randomCard.power;
      } else {
        const existingCard = users[userIndex].inventory[existingCardIndex];
        const duplicateCard = { ...existingCard };
        openedCards.push(duplicateCard);
        updatedBalance -= duplicateCard.power;
      }
    }

    if (isNaN(updatedBalance) || updatedBalance < 0) {
      throw new Error("Некорректный баланс");
    }

    if (user.balance < updatedBalance) {
      return bot.sendMessage(userId, "У вас недостаточно баланса для открытия уникального пака.");
    }
    user.inventory.push(openedCards);

    fs.writeFileSync("../db/db.json", JSON.stringify(users, null, "\t"));

    for (const card of openedCards) {
      await bot.sendPhoto(userId, card.cardPhoto, {
        caption: `🦠 ${card.cardName}\n\n💬 ${user.username}, поздравляем, вы получили карту героя ${card.cardName}!\n🎭 Класс: ${card.cardSection}\n🔮 Редкость: ${card.cardRarity}\nАтака: ${card.cardPower}\n❤️ Защита: ${card.cardDeffence}\n➖➖➖➖➖➖➖\n🃏 Кол-во оставшихся токенов: ${user.balance}`,
      });
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
