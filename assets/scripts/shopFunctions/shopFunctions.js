const fs = require("fs");
const path = require("path");

const cardsPath = path.join(__dirname, "../../db/images/images.json");
const cards = JSON.parse(fs.readFileSync(cardsPath, "utf8"));

const dbFilePath = path.join(__dirname, "../../db/db.json");
const users = require(dbFilePath);

const shopTextPath = path.join(__dirname, "../../db/shop/shop.json");
const shopText = JSON.parse(fs.readFileSync(shopTextPath, "utf8"));

function getPack(bot, msg, packCount) {
  try {
    const userId = msg.from.id;
    const username = msg.from.username;

    const userIndex = users.findIndex(
      (x) => x.username.toLowerCase() === username.toLowerCase()
    );

    if (userIndex === -1) {
      return bot.sendMessage(userId, "Пользователь не найден.");
    }

    const user = users[userIndex];

    const totalCost =
      cards.reduce((acc, card) => acc + card.power, 0) * packCount;

    if (user.balance == null || isNaN(user.balance)) {
      user.balance = 0;
    }

    if (user.balance < totalCost) {
      return bot.sendMessage(
        userId,
        `У вас недостаточно баланса для открытия ${packCount} паков.`
      );
    }

    const openedCards = [];
    let updatedBalance = user.balance;

    for (let i = 0; i < packCount; i++) {
      const randomCard = cards[Math.floor(Math.random() * cards.length)];
      const existingCard = user.inventory.find(
        (card) => card.name === randomCard.name
      );

      if (existingCard && typeof existingCard.power === "number") {
        updatedBalance += 0.5 * existingCard.power;
      } else if (typeof randomCard.power === "number") {
        user.inventory.push(randomCard);
        openedCards.push(randomCard);
        updatedBalance += 0.5 * randomCard.power;
      } else {
        return;
      }
    }

    if (isNaN(updatedBalance) || updatedBalance < 0) {
      throw new Error("Invalid updated balance");
    }

    users[userIndex].balance = updatedBalance;

    fs.writeFileSync(dbFilePath, JSON.stringify(users, null, "\t"));

    const shopMessage = (
      shopText.message || "Текст не найден в магазине."
    ).trim();
    bot.sendMessage(
      userId,
      `${shopMessage} Вы открыли ${packCount} паков и получили карты: ${openedCards
        .map((card) => card.name)
        .join(", ")}. Новый баланс: ${users[userIndex].balance}. сила карты ${
        openedCards.power
      }.`
    );
  } catch (error) {
    bot.sendMessage(
      msg.message.from.id,
      "Произошла ошибка при обработке вашего запроса."
    );
    throw error;
  }
}

async function getUniquePack(bot, msg) {
  try {
    const userId = msg.message.chat.id;

    const userIndex = users.findIndex((x) => x.username === msg.from.username);

    if (!users[userIndex]) {
      return bot.sendMessage(userId, "Пользователь не найден.");
    }

    const zeroDropChanceCards = cards.filter((card) => card.dropChance === 0);

    const openedCards = [];
    let updatedBalance = users[userIndex].balance || 0;

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

    if (users[userIndex].balance < updatedBalance) {
      return bot.sendMessage(
        userId,
        "У вас недостаточно баланса для открытия уникального пака."
      );
    }

    users[userIndex].balance = updatedBalance;
    users[userIndex].inventory.push(...openedCards);

    fs.writeFileSync(dbFilePath, JSON.stringify(users, null, "\t"));

    for (const card of openedCards) {
      await bot.sendPhoto(userId, card.fileId, {
        caption: `🦠 ${card.name}\n\n💬 ${users[userIndex].username}, поздравляем, вы получили карту героя ${users[userIndex].name}!\n🎭 Класс: ${card.class}\n🔮 Редкость: ${card.rarity}\nАтака: ${card.power}\n❤️ Защита: ${card.deffence}\n➖➖➖➖➖➖➖\n🃏 Кол-во оставшихся токенов: ${users[userIndex].balance}`,
      });
    }
  } catch (error) {
    bot.sendMessage(
      msg.message.chat.id,
      "Произошла ошибка при обработке вашего запроса."
    ); 
    throw error;
  }
}




module.exports = {
  getPack: getPack,
  getUniquePack: getUniquePack,
};
