const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../../db/db.json");
const db = require(dbPath);

const imagesPath = path.join(__dirname, "../../db/images/images.json");
const imagesData = require(imagesPath);

async function giveRandomCardToUser(bot, msg) {
  try {
    if (!Array.isArray(imagesData)) {
      console.error("Ошибка: imagesData не является массивом.");
      return bot.sendMessage(
        msg.chat.id,
        "Произошла ошибка при выдаче карты. Попробуйте еще раз."
      );
    }

    const userIndex = db.findIndex((user) => user.username === msg.from.username);

    if (userIndex === -1) {
      console.error("Ошибка: Пользователь не найден.");
      return bot.sendMessage(
        msg.chat.id,
        "Произошла ошибка при выдаче карты. Попробуйте еще раз."
      );
    }

    if (!db[userIndex].hasOwnProperty("inventory")) {
      db[userIndex].inventory = [];
    }

    const lastUseTime = db[userIndex].lastCardUseTime || 0;
    const currentTime = Date.now();
    const timeDiff = currentTime - lastUseTime;
    const cooldownTime = 2 * 60 * 60 * 1000; // 2 часа в миллисекундах

    if (timeDiff < cooldownTime) {
      const remainingTime = cooldownTime - timeDiff;
      const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
      const remainingMinutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

      console.error("Функция недоступна из-за таймера охлаждения.");
      return bot.sendMessage(
        msg.chat.id,
        `Извините, но функция недоступна. Попробуйте снова через ${remainingHours} часов и ${remainingMinutes} минут.`
      );
    }

    const randomIndex = Math.floor(Math.random() * imagesData.length);

    if (randomIndex < 0 || randomIndex >= imagesData.length) {
      console.error("Ошибка: Некорректный индекс для массива imagesData.");
      return bot.sendMessage(
        msg.chat.id,
        "Произошла ошибка при выдаче карты. Попробуйте еще раз."
      );
    }

    const randomCard = imagesData[randomIndex];

    if (!randomCard || !randomCard.fileId || !randomCard.chatId || !randomCard.power || !randomCard.name) {
      console.error("Ошибка: Некорректные данные для карты в массиве imagesData.");
      return bot.sendMessage(
        msg.chat.id,
        "Произошла ошибка при выдаче карты. Попробуйте еще раз."
      );
    }

    randomCard.rarity = randomCard.rarity || "Не указано";

    db[userIndex].inventory.push(randomCard);
    db[userIndex].lastCardUseTime = currentTime;

    fs.writeFileSync(dbPath, JSON.stringify(db, null, "\t"));

    await bot.sendPhoto(randomCard.chatId, randomCard.fileId, { 
      caption: `🦠 ${randomCard.name}\n\n💬 ${msg.from.username}, поздравляем, вы получили карту героя ${randomCard.name}!\n🎭 Класс: ${randomCard.class}\n🔮 Редкость: ${randomCard.rarity}\nАтака: ${randomCard.power || "Не указана"}\n❤️ Защита: ${randomCard.deffence}\n➖➖➖➖➖➖➖\n🃏 Кол-во оставшихся токенов: ${db[userIndex].balance - randomCard.power}` 
    });
    
  } catch (error) {
    console.error("Произошла ошибка при выдаче карты:", error.message);
    await bot.sendMessage(
      msg.chat.id,
      "Произошла ошибка при выдаче карты. Попробуйте еще раз."
    );
  }
}

module.exports = {
  giveRandomCardToUser: giveRandomCardToUser,
}