const { db, run } = require('../helpers/database');

// exports.getAll = async chatId => {
//     
// }

exports.add = async message => {
    const [data] = await run(async () =>
        db('messages').insert(message));
    return data;
}

exports.getById = async id => {
    const [data] = await run(async () =>
        db('messages').where({ id }));
    return data;
}

exports.delete = async id => {
    const data = await run(async () =>
        db('messages').where({ id }).delete());
    return data;
}