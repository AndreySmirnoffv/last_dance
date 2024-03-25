const fs = require("fs")

const imagesData = require("../db/images/images.json")
const db = require('../db/db.json')

async function giveRandomCardToUser(bot, msg) {

  try {
    const user = db.find(user => user.username === msg.from.username);

    // const lastUseTime = user.lastCardUseTime || 0;
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
      return bot.sendMessage(
        msg.chat.id,
        'Произошла ошибка при выдаче карты. Попробуйте еще раз.',
      );
    }

    if (!user?.inventory) {
      user.inventory = [];
    }

    // if (timeDiff < coolDownTime) {
    //   const remainingTime = coolDownTime - timeDiff;
    //   const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
    //   const remainingMinutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

      // return bot.sendMessage(
      //   msg.chat.id,
      //   `Извините, но функция недоступна. Попробуйте снова через ${remainingHours} часов и ${remainingMinutes} минут.`,
      // );
    // }
    const hasCard = user.inventory.find(item => item?.cardName === randomCard?.cardName);
    // user.lastCardUseTime = currentTime;
    if(!hasCard) {
      console.log(randomCard)
      user.inventory.push(randomCard);
      fs.writeFileSync('./assets/db/db.json', JSON.stringify(user, null, '\t'));
      await bot.sendPhoto(msg.chat.id, randomCard?.cardPhoto, {
        caption: `🦠 ${randomCard?.cardName}\n\n💬 ${msg.from.username
          }, поздравляем, вы получили карту героя ${randomCard?.cardName}!\n🎭 Класс: ${randomCard?.cardSection
          }\n🔮 Редкость: ${randomCard?.cardRarity}\nАтака: ${randomCard?.cardPower || 'Не указана'
          }\n❤️ Защита: ${randomCard?.cardDeffence
          }\n➖➖➖➖➖➖➖\n🃏 Кол-во оставшихся токенов: ${JSON.stringify(user.balance, null, '\t')}`,
      })
    } else {
      console.log(randomCard.cardPower)
      user.balance += randomCard?.cardPower / 2
      console.log(user.balance)
      fs.writeFileSync('./assets/db/db.json', JSON.stringify(user, null, '\t'))
      console.log("база данных удалилась")
      await bot.sendMessage(msg.chat.id, `Вы получили повторяющуюся карту теперь ваш баланс составляет ${user.balance}`)
    } 


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
