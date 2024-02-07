const fs = require("fs")

const imagesData = require("../../db/images/images.json")

async function giveRandomCardToUser(bot, msg) {
  const db = JSON.parse(fs.readFileSync('./assets/db/db.json'));

  try {
    const user = db.find(user => user.username === msg.from.username);

    const lastUseTime = user.lastCardUseTime || 0;
    // const currentTime = Date.now();
    // const timeDiff = currentTime - lastUseTime;
    // const coolDownTime = 2 * 60 * 60 * 1000;

    const randomIndex = Math.floor(Math.random() * imagesData.length);
    const randomCard = imagesData[randomIndex];


    if (!Array.isArray(imagesData)) {
      console.error('Ошибка: imagesData не является массивом.');
      return bot.sendMessage(
        msg.chat.id,
        'Произошла ошибка при выдаче карты. Попробуйте еще раз.',
      );
    }

    if (!user) {
      console.error(
        `Ошибка: Пользователь ${user.username} не найден в базе данных.`,
      );
      return bot.sendMessage(
        msg.chat.id,
        'Произошла ошибка при выдаче карты. Попробуйте еще раз.',
      );
    }

    console.log(`Найден пользователь: ${user.username}`);

    if (!user?.inventory) {
      user.inventory = [];
    }

    // if (timeDiff < coolDownTime) {
    //   const remainingTime = coolDownTime - timeDiff;
    //   const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
    //   const remainingMinutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

    //   return bot.sendMessage(
    //     msg.chat.id,
    //     `Извините, но функция недоступна. Попробуйте снова через ${remainingHours} часов и ${remainingMinutes} минут.`,
    //   );
    // }

    if (randomIndex < 0 || randomIndex >= imagesData.length) {
      console.error('Ошибка: Некорректный индекс для imagesData.');
      return bot.sendMessage(
        msg.chat.id,
        'Произошла ошибка при выдаче карты. Попробуйте еще раз.',
      );
    }
    console.log(`Выбран случайный индекс: ${randomIndex}`);

    // user.lastCardUseTime = currentTime;
    if (randomCard.cardName === user.inventory.cardName) {
      console.log(randomCard.cardPower)
      user.balance = randomCard.cardPower / 2
      console.log(user.balance)

      fs.writeFileSync('./assets/db/db.json', JSON.stringify(db, 0, 3))
      console.log("база данных удалилась")
      await bot.sendMessage(msg.chat.id, `Вы получили повторяющуюся карту теперь ваш баланс составляет ${user.balance}`)

    } else {
      console.log(randomCard)
      user.inventory.push(randomCard);
      fs.writeFileSync('./assets/db/db.json', JSON.stringify(db, null, '\t'));
      await bot.sendPhoto(msg.chat.id, randomCard.cardPhoto, {
        caption: `🦠 ${randomCard.cardName}\n\n💬 ${msg.from.username
          }, поздравляем, вы получили карту героя ${randomCard.cardName}!\n🎭 Класс: ${randomCard.cardSection
          }\n🔮 Редкость: ${randomCard.cardRarity}\nАтака: ${randomCard.cardPower || 'Не указана'
          }\n❤️ Защита: ${randomCard.cardDeffence
          }\n➖➖➖➖➖➖➖\n🃏 Кол-во оставшихся токенов: ${JSON.stringify(user.balance, null, '\t')}`,
      })
    };


  } catch (error) {
    console.log(error)
    await bot.sendMessage(
      msg.chat.id,
      'Произошла ошибка при выдаче карты. Попробуйте еще раз.',
    );
  }
}

module.exports = {
  giveRandomCardToUser: giveRandomCardToUser
};
