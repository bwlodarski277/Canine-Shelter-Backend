const { db, run } = require('../helpers/database');

exports.getByChatId = async chatId => {
    const data = await run(async () =>
        await db('chatMessages').where({ chatId }));
    return data;
}

exports.add = async (chatId, messageId) => {
    const [data] = await run(async () =>
        await db('chatMessages').insert({ chatId, messageId }));
    return data;
}

exports.delete = async messageId => {
    const data = await run(async () =>
        await db('chatMessages').where({ messageId }).delete());
    return data;
}