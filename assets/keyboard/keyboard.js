module.exports = {
  userStartKeyboard: {
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: "👤 Личный Профиль" }],
        [{ text: "⚔️ Арены" }],
        [{ text: "🛒 Магазин паков" }],
        [{ text: "🀄️ Добавить карту в инвентарь матчей" }],
        [{ text: "🀄️ Получить карточку" }],
      ],
      resize_keyboard: true,
    }),
  },
  adminStartKeyboard: {
    reply_markup: {
        keyboard: [
            [{ text: "👤 Личный профиль" }],
            [{ text: "⚔️ Арены" }],
            [{ text: "🛒 Магазин паков" }],
            [{ text: "🀄️ Получить карточку" }],
            [{ text: "⚙️ Админ панель" }],
        ],
        resize_keyboard: true,
    },
},
  profileKeyboard: {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "💮 Мои карточки", callback_data: "mycards" }],
        [{ text: "⚔️ Моя команда", callback_data: "myteam" }],
        [{ text: "🎁 Ввести промокод", callback_data: "checkpromo" }],
        [{ text: "✏️ Изменить имя", callback_data: "changename" }],
        [{ text: "⭕️ Закрыть окно ⭕️", callback_data: "closewindow" }],
      ],
      resize_keyboard: true,
    }),
  },
  arenaKeyboard: {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "Обычная", callback_data: "usualmatch" }],
        [{ text: "Рейтинговая", callback_data: "ratingmatch" }],
      ],
      resize_keyboard: true,
    }),
  },
  shopKeyboard: {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "💰 Купить 1 пак", callback_data: "getonepack" }],
        [{ text: "💰 Купить 1 уникальный пак", callback_data: "getuniquepack" }],
        [
          { text: "⏮", callback_data: "back_first" },
          { text: "⏪", callback_data: "back_prev" },
          { text: "◀️", callback_data: "back_left" },
          { text: "1/1", callback_data: "back_current" },
          { text: "▶️", callback_data: "back_right" },
          { text: "⏩", callback_data: "back_next" },
          { text: "⏭", callback_data: "back_last" }
        ],
        [{ text: "⭕️ Закрыть окно ⭕️", callback_data: "closewindow" }],
      ],
      resize_keyboard: true,
    })
  },
  adminOptionsKeyboard: {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "Создать промокод", callback_data: "createPromo" }],
        [{ text: "Вывести всех пользователей", callback_data: "showAllUsers" }],
        [{ text: "Найти конкретного пользователя", callback_data: "findUser" }],
        [{ text: "Добавить карту пользователю", callback_data: "addCardToUser"}],
        [{ text: "Добавить карту", callback_data: "addcard" }],
        [{ text: "Добавить админа", callback_data: "setAdmin" }],
        [{ text: "Убрать админа", callback_data: "removeadmin"}],
        [{ text: "Добавить текст для магазина", callback_data: "addshoptext" }],
      ],
    }),
  },
};
