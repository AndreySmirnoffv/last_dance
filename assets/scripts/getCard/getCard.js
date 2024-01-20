const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../db/db.json');
const db = require(dbPath);

const imagesPath = path.join(__dirname, '../../db/images/images.json');
const imagesData = require(imagesPath);

async function giveRandomCardToUser(bot, msg) {
  try {

    if (!Array.isArray(imagesData)) {
      console.error('Ошибка: imagesData не является массивом.');
      return bot.sendMessage(
        msg.chat.id,
        'Произошла ошибка при выдаче карты. Попробуйте еще раз.',
      );
    }

    const userIndex = db.findIndex(user => user.username === msg.from.username);

    if (userIndex === -1) {
      console.error(
        `Ошибка: Пользователь ${msg.from.username} не найден в базе данных.`,
      );
      return bot.sendMessage(
        msg.chat.id,
        'Произошла ошибка при выдаче карты. Попробуйте еще раз.',
      );
    }

    console.log(`Найден пользователь: ${msg.from.username}`);

    if (!db[userIndex].hasOwnProperty('inventory')) {
      db[userIndex].inventory = [];
    }

    const lastUseTime = db[userIndex].lastCardUseTime || 0;
    const currentTime = Date.now();
    const timeDiff = currentTime - lastUseTime;
    const coolDownTime = 2 * 60 * 60 * 1000;

    if (timeDiff < coolDownTime) {
      const remainingTime = coolDownTime - timeDiff;
      const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
      const remainingMinutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

      console.error(
        `Ошибка: Функция недоступна. Осталось ждать ${remainingHours} часов и ${remainingMinutes} минут.`,
      );
      return bot.sendMessage(
        msg.chat.id,
        `Извините, но функция недоступна. Попробуйте снова через ${remainingHours} часов и ${remainingMinutes} минут.`,
      );
    }

    console.log('Прошло проверку времени ожидания');

    const randomIndex = Math.floor(Math.random() * imagesData.length);

    if (randomIndex < 0 || randomIndex >= imagesData.length) {
      console.error('Ошибка: Некорректный индекс для imagesData.');
      return bot.sendMessage(
        msg.chat.id,
        'Произошла ошибка при выдаче карты. Попробуйте еще раз.',
      );
    }

    console.log(`Выбран случайный индекс: ${randomIndex}`);

    const randomCard = imagesData[randomIndex];

    console.log(`Выбрана случайная карта: ${randomCard.name}`);

    randomCard.rarity = randomCard.rarity || 'Не указано';

    db[userIndex].inventory.push(randomCard);
    db[userIndex].lastCardUseTime = currentTime;

    fs.writeFileSync(dbPath, JSON.stringify(db, null, '\t'));

    console.log('Данные успешно обновлены в файле');

    await bot.sendPhoto(msg.chat.id, randomCard.cardPhoto, {
      caption: `🦠 ${randomCard.name}\n\n💬 ${msg.from.username
        }, поздравляем, вы получили карту героя ${randomCard.name}!\n🎭 Класс: ${randomCard.class
        }\n🔮 Редкость: ${randomCard.rarity}\nАтака: ${randomCard.power || 'Не указана'
        }\n❤️ Защита: ${randomCard.deffence
        }\n➖➖➖➖➖➖➖\n🃏 Кол-во оставшихся токенов: ${db[userIndex].balance - randomCard.power
        }`,
    });

    console.log('Успешно отправлено сообщение с фото');
    if (randomCard.name === db[userIndex].inventory) {
      db[userIndex].balance = randomCard.power / 2
      fs.writeFileSync('../../db/db.json', JSON.stringify(db, null, '\t'))
    }
  } catch (error) {
    console.error('Ошибка при выполнении giveRandomCardToUser:', error);
    await bot.sendMessage(
      msg.chat.id,
      'Произошла ошибка при выдаче карты. Попробуйте еще раз.',
    );
  }
}

module.exports = {
  giveRandomCardToUser: giveRandomCardToUser,
};
