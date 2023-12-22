const fs = require('fs');

async function top(bot, msg) {
    try {
        const rawData = fs.readFileSync('../../db/db.json');
        const users = JSON.parse(rawData);

        const sortedUsers = users.sort((a, b) => b.rating - a.rating);
        const topUsers = sortedUsers.slice(0, 5);

        const message = `Топ пользователей:\n${topUsers.map(user => `${user.username} - Рейтинг: ${user.rating}`).join('\n')}`;
        bot.sendMessage(msg.chat.id, message);
    } catch (error) {
        console.error('Ошибка при чтении/обработке данных из файла:', error);
        bot.sendMessage(msg.chat.id, 'Произошла ошибка при выполнении команды.');
    }
}

module.exports = {
    top: top,
}