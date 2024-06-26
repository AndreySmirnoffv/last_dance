const fs = require('fs');
const path = require('path');
const usersPath = require('../db/db.json')
const cards = require('../db/images/images.json')

function findCardByNameAndPower(cards, cardName, power) {
  return 
}

async function showAllUsers(bot, msg) {
  try {

    const userText = usersPath
      .map(user => {
        return `Username: ${user.username}\nFirst Name: ${
          user.first_name
        }\nLast Name: ${user.last_name}\nID: ${user.id}\nBalance: ${
          user.balance
        }\nRating: ${user.rating === null ? 'N/A' : user.rating}\nIs Admin: ${
          user.isAdmin
        }\nIs Match: ${user.isMatch}\nIs Waiting: ${
          user.isWaiting
        }\n---------------------`;
      })
      .join('\n');

    await bot.sendMessage(msg.chat.id, userText);
  } catch (error) {
    throw error;
  }
}

async function sendAllCards(bot, userId) {
  try {
    let user = usersPath.find(user => user.username === msg.message.from.username)
    const matchInventoryOptions = user.inventory.map(card => ({
      name: card.name,
      power: card.power,
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

    await bot.sendMediaGroup(
      userId,
      cards.map(card => ({
        type: 'photo',
        media: card.cardPhoto,
      })),
      options,
    );
  } catch (error) {
    throw error;
  }
}

async function addToMatchInventory(bot, msg) {
  try {
    const userId = msg.from.id;

    const user = usersPath.find(
      x => x.username === msg.from.username
    );

    if (!user) {
      return bot.sendMessage(userId, 'Пользователь не найден.');
    }

    const matchInventoryOptions = user.inventory.map(card => ({
      name: card.name,
      power: card.power,
    }));

    const options = {
      reply_markup: JSON.stringify({
        inline_keyboard: matchInventoryOptions.map(card => [
          {
            text: `Добавить в инвентарь матча: ${card.name}`,
            callback_data: `addToMatchInventory:${card.name}:${card.power}`,
          },
        ]),
      }),
    };

    bot.sendMessage(
      userId,
      'Выберите карту для добавления в инвентарь матча:',
      options,
    );
  } catch (error) {
    bot.sendMessage(userId, 'Произошла ошибка при обработке вашего запроса.');
    throw error;
  }
}

async function addToMatchInventoryCallback(bot, msg) {
  try {
    const userId = msg.from.id;
    const username = msg.from.username;

    const user = usersPath.find(
      x => x.username === username,
    );

    if (!user) {
      return bot.sendMessage(userId, 'User not found.');
    }

    const card = cards.find(card => card.cardName === msg.data && card.cardPower === msg.data);

    if (!card) {
      return bot.sendMessage(userId, 'Card not found.');
    }
    user.opponent.inventory.push(card);
    fs.writeFileSync("../db/db.json", JSON.stringify(usersPath, null, '\t'));

    await bot.sendMessage(
      userId,
      `Card ${card.cardName} with power ${card.cardPower} added to your match inventory`,
    );

    await checkAndCreateMatch(bot, msg);
  } catch (error) {
    bot.sendMessage(userId, 'Произошла ошибка при обработке вашего запроса.');
    throw error;
  }
}

async function addToWaitingRoom(bot, msg) {
  try {
    const user = usersPath.find(user => user.username === msg.from.username);

    if (user) {
      user.isWaiting = true;
      fs.writeFileSync(filePath, JSON.stringify(usersPath, null, '\t'));
      await bot.sendMessage(
        msg.message.chat.id,
        `@${msg.from.username}, вы были добавлены в комнату ожидания`,
      );
      await checkAndCreateMatch(bot, msg);
    }
  } catch (error) {
    return;
  }
}

async function checkAndCreateMatch(bot, msg) {
  try{
    const waitingUsers = usersPath.find(user => user.isWaiting)
    if (waitingUsers.length == 2) {
      const userId1 = waitingUsers[0].username;
      const userId2 = waitingUsers[1].username;

      currentUsers.find(user => user.username === userId1).isWaiting = false;
      currentUsers.find(user => user.username === userId2).isWaiting = false;
      currentUsers.find(user => user.username === userId1).isMatch = true;
      currentUsers.find(user => user.username === userId2).isMatch = true;

      fs.writeFileSync(filePath, JSON.stringify(currentUsers, null, '\t'));

      await bot.sendMessage(
        msg.message.chat.id,
        `Match created between @${userId1} and @${userId2}`,
      );
    }
    processCallback(bot, msg)
  } catch (error) {
    await bot.sendMessage(msg.chat.id, 'Не мог создать матч:\n' + error);
  }
}


async function processCallback(bot, msg) {
  const userId = msg.message.chat.id;

  const currentUser = usersPath.find(user => user.id === userId);
  

  if (currentUser) {
    const currentTime = new Date().getTime(); 
    const lastActionTime = currentUser.lastActionTime || 0; 

    const timeDiff = currentTime - lastActionTime;

    const threeHoursInMs = 1 * 60 * 60 * 1000; 

    if (timeDiff >= threeHoursInMs) { 
        currentUser.balance += 1;
        currentUser.rating += 10;
        currentUser.lastActionTime = currentTime;
        fs.writeFileSync("./assets/db/db.json", JSON.stringify(usersPath, null, '\t')); // Сохраняем обновленные данные

        await bot.sendMessage(
            userId,
            `Ваша валюта увеличена. Новый рейтинг: ${currentUser.rating}, Новая валюта: ${currentUser.balance}`,
        );
    } else { 
        const timeRemainingInMs = threeHoursInMs - timeDiff; 
        const timeRemainingInHours = Math.ceil(timeRemainingInMs / (60 * 60 * 1000)); 

        await bot.sendMessage(
            userId,
            `Вы уже играли недавно. Попробуйте снова через ${timeRemainingInHours} часов.`,
        );
    }
  } else {
    await bot.sendMessage(msg.message.chat.id, "нету юзера");
  }
}


async function matchInventory(bot, msg) {
  try {
    const userId = msg.chat.id;

    const user = usersPath.find(x => x.username === msg.from.username);

    if (!user) {
      return bot.sendMessage(userId, 'Пользователь не найден.');
    }

    const options = {
      reply_markup: JSON.stringify({
        inline_keyboard: user.inventory.map(card => [
          {
            text: `Добавить в инвентарь матча: ${card.name}`,
            callback_data: 'addToMatchInventory',
          },
        ]),
      }),
      caption: 'Выберите карту для добавления в инвентарь матча:',
    };

    if (user.inventory.length > 0) {
      const selectedCard = user.inventory[0];

      await bot.sendPhoto(userId, selectedCard.fileId, options);
    } else {
      await bot.sendMessage(
        userId,
        'У вас нет карт в инвентаре матча.',
        options,
      );
    }
  } catch (error) {
    bot.sendMessage(
      msg.from.id,
      'Произошла ошибка при обработке вашего запроса.',
    );
    throw error;
  }
}

module.exports = {
  showAllUsers: showAllUsers,
  sendAllCards: sendAllCards,
  addToMatchInventory: addToMatchInventory,
  addToMatchInventoryCallback: addToMatchInventoryCallback,
  addToWaitingRoom: addToWaitingRoom,
  processCallback: processCallback,
  matchInventory: matchInventory,
  checkAndCreateMatch: checkAndCreateMatch,
  matchInventory: matchInventory
};
