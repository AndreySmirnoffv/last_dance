const fs = require("fs");
const path = require('path');
const filePath = path.join(__dirname, '../../db/db.json');
const users = require(filePath);

function findCardByNameAndPower(cards, cardName, power) {
  return cards.find(card => card.name === cardName && card.power === power);
}

async function showAllUsers(bot, msg) {
  try {
    const usersData = await fs.promises.readFile(filePath, "utf-8");
    const allUsers = JSON.parse(usersData);

    const userText = allUsers.map(user => {
      return `Username: ${user.username}\nFirst Name: ${user.first_name}\nLast Name: ${user.last_name}\nID: ${user.id}\nBalance: ${user.balance}\nRating: ${user.rating === null ? 'N/A' : user.rating}\nIs Admin: ${user.isAdmin}\nIs Match: ${user.isMatch}\nIs Waiting: ${user.isWaiting}\n---------------------`;
    }).join('\n');

    await bot.sendMessage(msg.chat.id, userText);
  } catch (error) {
    console.error('Error showing all users:', error);
    throw error;
  }
}

async function sendAllCards(bot, userId, userInventory) {
  try {
    const cardData = await fs.promises.readFile('cards.json', 'utf-8');
    const cards = JSON.parse(cardData);

    // Создаем matchInventoryOptions на основе инвентаря пользователя
    const matchInventoryOptions = userInventory.map((card) => ({
      name: card.name,
      power: card.power,
    }));

    const options = {
      reply_markup: JSON.stringify({
        inline_keyboard: matchInventoryOptions.map((card) => [
          {
            text: `Добавить в инвентарь матча: ${card.name}`,
            callback_data: `addToMatchInventory:${card.name}:${card.power}`,
          },
        ]),
      }),
    };

    await bot.sendMediaGroup(userId, cards.map((card) => ({
      type: 'photo',
      media: `https://example.com/cards/${card.name}`, // Замените на реальный URL картинки
    })), options);
  } catch (error) {
    console.error('Error sending images of cards:', error);
    throw error;
  }
}

async function addToMatchInventory(bot, msg) {
  try {
    const userId = msg.from.id;
    const username = msg.from.username;

    const userIndex = users.findIndex(
      (x) => x.username.toLowerCase() === username.toLowerCase()
    );

    if (userIndex === -1) {
      console.error("Пользователь не найден.");
      return bot.sendMessage(userId, "Пользователь не найден.");
    }

    const user = users[userIndex];

    const matchInventoryOptions = user.inventory.map((card) => ({
      name: card.name,
      power: card.power,
    }));

    const options = {
      reply_markup: JSON.stringify({
        inline_keyboard: matchInventoryOptions.map((card) => [
          {
            text: `Добавить в инвентарь матча: ${card.name}`,
            callback_data: `addToMatchInventory:${card.name}:${card.power}`,
          },
        ]),
      }),
    };

    bot.sendMessage(userId, "Выберите карту для добавления в инвентарь матча:", options);
  } catch (error) {
    bot.sendMessage(userId, "Произошла ошибка при обработке вашего запроса.");
    console.error("Произошла ошибка:", error);
    throw error;
  }
}

async function addToMatchInventoryCallback(bot, msg) {
  try {
    const userId = msg.from.id;
    const username = msg.from.username;

    const userIndex = users.findIndex(
      (x) => x.username.toLowerCase() === username.toLowerCase()
    );

    if (userIndex === -1) {
      console.error("User not found.");
      return bot.sendMessage(userId, "User not found.");
    }

    const user = users[userIndex];

    const cardName = msg.data.split(":")[1];
    const cardPower = parseInt(msg.data.split(":")[2]);

    const card = findCardByNameAndPower(user.inventory, cardName, cardPower);

    if (!card) {
      console.error("Card not found.");
      return bot.sendMessage(userId, "Card not found.");
    }

    // Add the card to the match inventory of the user
    user.opponent.inventory.push(card);

    // Save the updated user data
    await fs.promises.writeFile(filePath, JSON.stringify(users, null, '\t'));

    // Send a message about the successful addition of the card to the match inventory
    await bot.sendMessage(userId, `Card ${card.name} with power ${card.power} added to your match inventory`);

    // After adding the card to the inventory, you may want to perform additional checks or actions
    // For example, check the power of cards and update the balance/rating based on the match result
    await checkAndCreateMatch(bot, msg);
  } catch (error) {
    bot.sendMessage(userId, "Произошла ошибка при обработке вашего запроса.");
    console.error("Произошла ошибка:", error);
    throw error;
  }
}

async function addToWaitingRoom(bot, msg) {
  try {
    const currentUsers = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const user = currentUsers.find((user) => user.username === msg.from.username);

    if (user) {
      user.isWaiting = true;
      fs.writeFileSync(filePath, JSON.stringify(currentUsers, null, "\t"));
      await bot.sendMessage(msg.message.chat.id, `@${msg.from.username}, вы были добавлены в комнату ожидания`);
      await checkAndCreateMatch(bot, msg);
    }
  } catch (error) {
    console.error('Error adding user to waiting room:', error);
  }
}

async function checkAndCreateMatch(bot, msg) {
  try {
    const currentUsers = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const waitingUsers = currentUsers.filter((user) => user.isWaiting);

    if (waitingUsers.length >= 2) {
      const userId1 = waitingUsers[0].username;
      const userId2 = waitingUsers[1].username;

      currentUsers.find((user) => user.username === userId1).isWaiting = false;
      currentUsers.find((user) => user.username === userId2).isWaiting = false;
      currentUsers.find((user) => user.username === userId1).isMatch = true;
      currentUsers.find((user) => user.username === userId2).isMatch = true;

      fs.writeFileSync(filePath, JSON.stringify(currentUsers, null, "\t"));

      console.log(`матч был создан между @${userId1} и @${userId2}`);
      await bot.sendMessage(msg.message.chat.id, `Match created between @${userId1} and @${userId2}`);
    }
  } catch (error) {
    await bot.sendMessage(msg.chat.id, "Не мог создать матч:\n" + error,)
    console.error('Error checking and creating match:', error);
  }
    try {
        const currentUsers = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const waitingUsers = currentUsers.filter((user) => user.isWaiting);

        if (waitingUsers.length >= 2) {
            const userId1 = waitingUsers[0].id;
            const userId2 = waitingUsers[1].id;

            currentUsers.find((user) => user.id === userId1).isWaiting = false;
            currentUsers.find((user) => user.id === userId2).isWaiting = false;
            currentUsers.find((user) => user.id === userId1).isMatch = true;
            currentUsers.find((user) => user.id === userId2).isMatch = true;

            fs.writeFileSync(filePath, JSON.stringify(currentUsers, null, '\t'));

            console.log(`матч был создан между @${userId1} и @${userId2}`);
            await bot.sendMessage(msg.message.chat.id, `Match created between @${userId1} and @${userId2}`);
        }
    } catch (error) {
        await bot.sendMessage(msg.chat.id, 'Не мог создать матч:\n' + error);
        console.error('Error checking and creating match:', error);
    }
}

async function processCallback(bot, msg) {
    const callbackData = msg.data;
    const userId = msg.data.id;

    try {
        if (callbackData === 'rating') {
            const users = JSON.parse(fs.readFileSync('../../db/db.json'));

            const currentUser = users.find(user => user.id === msg.data.id);

            if (currentUser) {
                currentUser.currency += 1;
                currentUser.rating += 10;

                fs.writeFileSync('../../db/db.json', JSON.stringify(users));

                await bot.sendMessage(userId, `Ваша валюта увеличена. Новый рейтинг: ${currentUser.rating}, Новая валюта: ${currentUser.balance}`);
            } else {
                await bot.sendMessage(userId, 'Пользователь не найден.');
            }
        } else {
            await bot.sendMessage(userId, 'Неверный колбэк.');
        }
        await checkAndCreateMatch(bot, msg);
    } catch (error) {
        console.error('Ошибка при обработке колбэка:', error);
        await bot.sendMessage(userId, 'Произошла ошибка при обработке колбэка.');
    }
}

async function matchInventory(bot, msg) {
  try {
    const userId = msg.chat.id;
    const username = msg.from.username;

    const userIndex = users.findIndex(
      (x) => x.username === username
    );

    if (userIndex === -1) {
      console.error("Пользователь не найден.");
      return bot.sendMessage(userId, "Пользователь не найден.");
    }

    const user = users[userIndex];

    const options = {
      reply_markup: JSON.stringify({
        inline_keyboard: user.inventory.map((card) => [
          {
            text: `Добавить в инвентарь матча: ${card.name}`,
            callback_data: "addToMatchInventory",
          },
        ]),
      }),
      caption: "Выберите карту для добавления в инвентарь матча:",
    };

    if (user.inventory.length > 0) {
      const selectedCard = user.inventory[0];

      await bot.sendPhoto(userId, selectedCard.fileId, options);
    } else {
      await bot.sendMessage(userId, "У вас нет карт в инвентаре матча.", options);
    }
  } catch (error) {
    bot.sendMessage(msg.from.id, "Произошла ошибка при обработке вашего запроса.");
    console.error("Произошла ошибка:", error);
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
