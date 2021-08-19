const { MongoClient } = require('mongodb')
const mongoConfig = require('config').mongo;
let dbHandle, mongoConnection;
const mapCollections = {
    items:"items",
    users:"users"
};
const mongoConnectionOptions = {
    connectTimeoutMS: 5000
};

const createMongoConnection = async () =>{
    try {
        console.log('hello mongo')

        const client = new MongoClient(mongoConfig.url,mongoConnectionOptions);
        const connection = await client.connect();
        if(mongoConnection){
            mongoConnection.close();
        }
        mongoConnection = connection;
        dbHandle = client.db(mongoConfig.dbName);
        await dbHandle.command({ ping: 1 });
        console.log('mongo connected!');
    } catch (e) {
        console.error('mongo connection error retrying in 5 seconds...');
        setTimeout(() => createMongoConnection(), 5000);
    }
}

module.exports = {
    init:async ()=>{
        await createMongoConnection();
    },
    getItemById: async (collection, id) =>{
            return await dbHandle.collection(mapCollections[collection]).findOne({_id:id});
    },
    insertItem: async (collection, obj) =>{
        return await dbHandle.collection(mapCollections[collection]).insertOne(obj);
    }
}
