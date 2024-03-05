const fs = require("fs");

const cards = require("../db/images/images.json");

const users = require("../db/db.json");

const shopText = require('../db/shop/shop.json')

const shopMessage = (shopText.message|| "Текст не найден в магазине.").trim();

async function getPack(bot, msg, packCount) {
  try {
    console.log("функция начала свое выполнение")
    const userId = msg.from.id;
    const user = users.find((x) => x.username === msg.from.username);

    if (!user) {
      return await bot.sendMessage(userId, "Пользователь не найден.");
    }

    const totalCost = cards.reduce((acc, card) => acc + card.power, 0) * packCount;

    if (user.balance == null || user.balance < 2500 || isNaN(user.balance)) {
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

    for (let i = 0; i < packCount; i++) {
      console.log("цикл начал свое выполнение")
      const randomCard = cards[Math.floor(Math.random() * cards.length)];
      const existingCard = user.inventory.find(
        (card) => card.cardName === randomCard.cardName
      );
        console.log("фильрация карт завершена")
      if (randomCard.cardName === existingCard.cardName) {
        user.balance += randomCard.cardPower / 2;
        fs.writeFileSync('assets/db/db.json', JSON.stringify(users, null, '\t'))
        await bot.sendMessage(userId, `Вам выпала повторная карта ваш баланс составляет ${user.balance}`)
      } else {
        user.inventory.push(randomCard);
        openedCards.push(randomCard);
        user.balance += 0.5 * randomCard.cardPower;
        fs.writeFileSync("assets/db/db.json", JSON.stringify(users, null, "\t"));

        const photoMessage = `${shopMessage} Вы открыли ${packCount} паков и получили карты:\n🦠 ${randomCard.cardName}\n💬 ${randomCard.cardDeffence}\n🎭 ${randomCard.cardPower}\n🔮${randomCard.cardRarity}\n${randomCard.cardSection}\n❤️ ${openedCards.power}.\n Новый баланс: ${user.balance}.`
        await bot.sendPhoto(userId, randomCard.cardPhoto, {caption: photoMessage} );
      }
    }

  } catch (error) {
    await bot.sendMessage(msg.message.from.id, "Произошла ошибка при обработке вашего запроса.");
    throw error;
  }
}

async function getUniquePack(bot, msg) {
  try {
    console.log("функция начала свое выполнение")
    const userId = msg.message.chat.id;

    const user = users.find(user => user.username === msg.from.username);
    const zeroDropChanceCards = cards.find((card) => card.cardName);
    const existingCard = user.inventory.find(card => card.cardName === zeroDropChanceCards.cardName)
    console.log(zeroDropChanceCards)

    const openedCards = [];

    let updatedBalance = 2500
    console.log("валидация юзера")
    if (!user) {
      return await bot.sendMessage(userId, "Пользователь не найден.");
    }else if (user.balance < updatedBalance || isNaN(updatedBalance)) {
      return await bot.sendMessage(userId, "У вас недостаточно баланса для открытия уникального пака.");
    }
    console.log('валидация юзера прошла успешно')

    if (!existingCard) {
      console.log("пытаюсь выдать карту")
      openedCards.push(zeroDropChanceCards)
      user.inventory.push(zeroDropChanceCards);
      console.log(zeroDropChanceCards)
      fs.writeFileSync("assets/db/db.json", JSON.stringify(users, null, "\t"));
      const photoMessage = `${shopMessage} Вы открыли уникальный пак и получили карты:\n🦠 ${openedCards.cardName}\n💬 ${openedCards.cardDeffence}\n🎭 ${openedCards.cardPower}\n🔮${openedCards.cardRarity}\n${openedCards.cardSection}\n❤️ ${openedCards.power}.\n Новый баланс: ${user.balance}.`
      await bot.sendPhoto(userId, zeroDropChanceCards?.cardPhoto, {caption: photoMessage} );
      console.log("карт выдана")
    }else{
      console.log("проверка есть ли карта в инвентаре у юзера началась")
      user.inventory.push(zeroDropChanceCards);
      fs.writeFileSync("assets/db/db.json", JSON.stringify(users, null, '\t'))
      await bot.sendMessage(userId, "Вам выпала повторная карта ваш баланс составляет: " + user.balance)
      console.log("проверка есть ли карта в инвентаре у юзера завершенна")

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
