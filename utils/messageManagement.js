var mongoClient = require("mongodb").MongoClient;


var messagesArr=[];
function postMessage(obj){
    messagesArr.push(obj);
    mongoClient.connect("mongodb://localhost:27017/",{useUnifiedTopology:true},(err,dbHost)=>{
        if(err){
            console.log("Error connecting to the server");
        }
        else{
            var db = dbHost.db("slDb");
            db.collection("messages", (err, coll)=>{
                if(err){
                    console.log("Error connecting to the collection");
                }
                else{
                    coll.insertOne(obj);
                }

            })
        }
    })
}

function getAllMessages(){
    return messagesArr;
}

module.exports={postMessage:postMessage, getAllMessages};