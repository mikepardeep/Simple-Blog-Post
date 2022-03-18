//import the module
const mongodb = require('mongodb');

//Set the MongoClient
const MongoClient = mongodb.MongoClient;

let database;


//connect function
async function connect(){
    //Connect to the database through url
    const client = await MongoClient.connect('mongodb://localhost:27017');
    database = client.db('blog');
}

//check error
function getDb() {
    if (!database){
        throw {message: 'Database connection is not established!'};
    } 

    return database;
}


module.exports = {
    connectToDatabase: connect,
    getDb: getDb
}




