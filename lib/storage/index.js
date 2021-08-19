const storage = require('config').storage || "mongo";
const {init,getItemById,insertItem} = require(`./${storage}`);

module.exports = {
    init:init,
    getItemById:getItemById,
    insertItem:insertItem
}
