const fs = require("fs");
const path = require("path");
const users = require("../../db/db.json");
const cards = require("../../db/images/images.json");
const shopTextPath = require("../../db/shop/shop.json");
const shopPath = path.join(__dirname, "../../db/shop/shop.json");
const shopData = require(shopPath);
const promosPath = path.resolve(__dirname, "../../db/promos/promos.json");

async function createPromo(bot, msg) {
  try {
    await bot.sendMessage(msg.message.chat.id, "Пришлите мне промокод");

    const responseMsg = await new Promise((resolve) => {
      bot.once("text", resolve);
    });

    const promoText = responseMsg.text;

    let promos = JSON.parse(fs.readFileSync(promosPath, "utf-8"));

    const promo = promos.find((promo) => promo.name === promoText);

    if (!promo) {
      promos.push({ name: promoText });

      fs.writeFileSync(promosPath, JSON.stringify(promos, null, 2), "utf-8");

      await bot.sendMessage(
        msg.message.chat.id,
        "Промокод был добавлен в базу данных. Для продолжения нажмите на кнопку:"
      );

      bot.removeTextListener(/.*/);
    } else {
      await bot.sendMessage(
        msg.message.chat.id,
        "Промокод с таким именем уже существует"
      );
    }
  } catch (error) {
    await bot.sendMessage(
      msg.message.chat.id,
      "Произошла ошибка при обработке промокода"
    );
  }
}

async function updateShopText(bot, msg) {
  try {
    const shopData = JSON.parse(fs.readFileSync(shopTextPath));

    if (shopData.length > 0) {
      shopData[0].text = msg.text;
      await bot.sendMessage(msg.chat.id, "текст для шопа был успешно добавлен");
      await bot.sendMessage(
        msg.message.chat.id,
        "текст для шопа был успешно добавлен"
      );
    } else {
      return;
    }

    fs.writeFileSync(shopTextPath, JSON.stringify(shopData, null, 2));
  } catch (error) {
    return;
  }
}

async function setAdmin(bot, msg) {
  const isCommand = msg.text.startsWith("/");

  if (isCommand) {
    return;
  }

  const user = users.find((user) => user.username === msg.text);

  if (!user) {
    await bot.sendMessage(
      msg.chat.id,
      `Пользователя с именем ${msg.text} не существует.`
    );
    return;
  }

  user.isAdmin = true;

  fs.writeFileSync("./assets/db/db.json", JSON.stringify(users, null, "\t"));

  await bot.sendMessage(
    msg.chat.id,
    `Пользователь @${msg.text} теперь админ.`
  );
}


async function removeAdmin(bot, msg) {
  const isCommand = msg.text.startsWith("/");

  if (isCommand) {
    const isCommand = msg.text.startsWith("/");

    if (isCommand) {
      return;
    }
    const user = users.find((user) => user.username === msg.text);

    if (!user) {
      await bot.sendMessage(
        msg.chat.id,
        `Пользователь с именем ${msg.text} не является админом.`
      );
      return;
    }

    user.isAdmin = false;

    fs.writeFileSync("./assets/db/db.json", JSON.stringify(users, null, "\t"));
    bot.removeListener(removeAdmin);
    await bot.sendMessage(
      msg.chat.id,
      `Пользователь @${msg.text} больше не админ.`
    );
  }

  await bot.sendMessage(
    msg.chat.id,
    `Пользователь @${msg.text} больше не админ.`
  );
}

async function askCardDetails(bot, msg) {
  try {
    await bot.sendMessage(msg.message.chat.id, "Введите название карты:");
    const cardNameMessage = await waitForText(bot, msg.from.username);

    await bot.sendMessage(msg.message.chat.id, "Прикрепите фото карты:");
    const cardPhotoMessage = await waitForPhoto(bot, msg.from.username);

    await bot.sendMessage(msg.message.chat.id, "Введите силу карты:");
    const cardPowerMessage = await waitForText(bot, msg.from.username);

    await bot.sendMessage(msg.message.chat.id, "Введите раздел карты:");
    const cardSectionMessage = await waitForText(bot, msg.from.username);

    await bot.sendMessage(msg.message.chat.id, "Введите редкость карты");
    const cardRarityMessage = await waitForText(bot, msg.from.username);

    await bot.sendMessage(msg.message.chat.id, "Введите шанс выпадения карты");
    const cardDropChance = await waitForText(bot, msg.from.username);

    const cardDetails = {
      cardName: cardNameMessage.text,
      cardPhoto: cardPhotoMessage.photo[0].file_id,
      cardPower: parseInt(cardPowerMessage.text),
      cardSection: cardSectionMessage.text,
      cardRarity: cardRarityMessage.text,
      cardDropChance: cardDropChance.text,
    };

    cards.push(cardDetails);
    saveToJson(cards);
    bot.sendMessage(
      msg.message.chat.id,
      "Карта успешно добавлена в базу данных!"
    );
  } catch (error) {
    return;
  }
}

async function waitForText(bot, chatId) {
  return new Promise((resolve) => {
    bot.onText(/.*/, (msg) => {
      if (msg.from.username === chatId) {
        resolve(msg);
      }
    });
  });
}

async function waitForPhoto(bot, chatId) {
  return new Promise((resolve) => {
    bot.on("photo", (msg) => {
      if (msg.from.username === chatId) {
        resolve(msg);
      }
    });
  });
}

function saveToJson(data) {
  const dbPath = path.join(__dirname, "../../db/images/images.json");
  const jsonData = JSON.stringify(data, null, "\t");
  fs.writeFileSync(dbPath, jsonData);
}

async function giveCardToUser(bot, msg) {
  try {
    const usersData = fs.readFileSync(dbFilePath, "utf8");
    const users = JSON.parse(usersData);

    users.forEach(async () => {
      for (const card of cards) {
        const keyboard = {
          inline_keyboard: [
            [
              {
                text: card.cardName,
                callback_data: `selectCard:${card.cardName}`,
              },
            ],
          ],
        };

        await bot.sendPhoto(msg.message.chat.id, card.cardPhoto, {
          caption: "Выберите карточку:",
          reply_markup: keyboard,
        });
      }
    });

    bot.on("callback_query", async (callbackQuery) => {
      const { data, message } = callbackQuery;
      const [action, selectedCardName] = data.split(":");

      if (action === "selectCard") {
        const selectedCard = cards.find(
          (card) => card.cardName === selectedCardName
        );

        if (selectedCard) {
          await bot.sendMessage(msg.message.chat.id, "Введите имя пользователя:");

          bot.once("text", async (response) => {
            const username = response.text;

            const targetUser = users.find((user) => user.username === username);

            if (!targetUser) {
              await bot.sendMessage(
                msg.message.chat.id,
                "Пользователь не найден."
              );
              return;
            }

            targetUser.inventory.push(selectedCard);

            delete callbackQuery.data;
            delete callbackQuery.message;

            fs.writeFileSync(dbFilePath, JSON.stringify(users, null, "\t"));

            await bot.sendMessage(
              msg.message.chat.id,
              `Карта добавлена в инвентарь пользователя ${username}.`
            );
          });
        }
      }
    });
  } catch (error) {
    console.error(error);
  }
}

async function findUser(bot, msg) {
  if (msg.chat && msg.chat.id) {
    const username = msg.text.replace(/[^a-zA-Z0-9_]/g, "");

    let user = users.find((user) => user.username === username);
    if (!user) {
      await bot.sendMessage(msg.chat.id, "Такого пользователя не существует");
      bot.removeListener(findUser);
    } else {
      await bot.sendMessage(
        msg.chat.id,
        `id: ${user.id}\nusername: ${user.username}\nfirst_name: ${user.first_name}\nlast_name: ${user.last_name}\nbalance: ${user.balance}\nrating: ${user.rating}\n${user.inventory}\nadmin: ${user.isAdmin}`
      );
      bot.removeListener(findUser);
    }
  } else {
    return;
  }
}

async function showAllUsers(bot, msg) {
  for (const user of users) {
    await bot.sendMessage(
      msg.message.chat.id,
      `Имя пользователя: ${user.username}\nИмя: ${user.first_name}\nФамилия: ${
        user.last_name
      }\nID: ${user.id}\nБаланс: ${user.balance}\nРейтинг: ${
        user.rating === null ? "N/A" : user.rating
      }\nАдминистратор: ${user.isAdmin}\nПодходит: ${user.isMatch}\nОжидает: ${
        user.isWaiting
      }\n---------------------`
    );
  }
}

async function addShopText(bot, msg) {
  try {
    await bot.sendMessage(
      msg.from.id,
      "Введите текст для добавления в магазин:"
    );
    const response = await new Promise((resolve) => {
      bot.once("text", (msg) => resolve(msg.text));
    });

    if (!response || response.trim() === "") {
      return bot.sendMessage(
        msg.from.id,
        "Вы не ввели текст. Попробуйте еще раз."
      );
    }

    shopData.push({ message: response });
    fs.writeFileSync(shopPath, JSON.stringify(shopData, null, "\t"));

    bot.sendMessage(msg.from.id, "Текст успешно добавлен в магазин!");
  } catch (error) {
    return;
  }
}

const dbFilePath = path.join(__dirname, "../../db/db.json");

async function removeAdmin(bot, msg) {
  try {
    await bot.sendMessage(
      msg.from.id,
      "Введите имя пользователя для удаления прав админа:"
    );

    const response = await new Promise((resolve) => {
      bot.once("text", (msg) => resolve(msg.text));
    });

    const usernameToRemove = response.trim();

    const dbFileContents = fs.readFileSync(dbFilePath, "utf-8");

    const users = JSON.parse(dbFileContents);

    const userIndex = users.findIndex(
      (user) => user.username === usernameToRemove
    );

    if (userIndex !== -1) {
      users[userIndex].isAdmin = false;

      fs.writeFileSync(dbFilePath, JSON.stringify(users, null, "\t"));

      await bot.sendMessage(
        msg.from.id,
        `Права админа для пользователя @${usernameToRemove} успешно удалены.`
      );
    } else {
      await bot.sendMessage(
        msg.from.id,
        `Пользователь @${usernameToRemove} не найден. Пожалуйста, убедитесь, что имя пользователя верно.`
      );
    }
  } catch (error) {
    return;
  }
}

module.exports = {
  askCardDetails: askCardDetails,
  updateShopText: updateShopText,
  setAdmin: setAdmin,
  giveCardToUser: giveCardToUser,
  findUser: findUser,
  createPromo: createPromo,
  showAllUsers: showAllUsers,
  addShopText: addShopText,
  removeAdmin: removeAdmin,
};
