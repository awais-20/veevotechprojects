const counterModel = require('../Models/counterModel');

async function getNextid(counterName) {
    const data = await counterModel.findOneAndUpdate(
        {Name:counterName},
        {$inc:{Value:1}},
        {new:true, upsert:true},
    );
    return Number(data.Value);
}

module.exports = getNextid;