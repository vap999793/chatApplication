var mongoClient = require("mongodb").MongoClient;
var messageObj = require('./messageManagement');

const users = [];

function newUserJoin(id, username, room) {
    var user = { id, username, room };
    // console.log("user in userarry", user);
    users.push(user);
    // console.log("Array of all users",users);
    mongoClient.connect("mongodb://localhost:27017/", { useUnifiedTopology: true }, (err, dbHost) => {
        if (err) {
            console.log("Error connecting to the database");
        }
        else {
            var db = dbHost.db("slDb");
            db.collection("users", (err, coll) => {
                if (err) {
                    console.log("Error connecting to the collection");
                }
                else {
                    coll.insertOne(user);
                    return user;
                }
            })
        }

    })
}

function getAllUsers(room, returnResult) {
    // console.log("Rooms in user info : ", room);
    // var usersByRoom = users.filter(item => item.room == room);
    // return usersByRoom;

    mongoClient.connect("mongodb://localhost:27017/", { useUnifiedTopology: true }, (err, dbHost) => {
        if (err) {
            console.log("Error connecting to the database");
        }

        var db = dbHost.db("slDb");
        db.collection("users", (err, coll) => {
            if (err) {
                console.log("Error connecting to the collection", err);
                return returnResult([]);
            }
            else {
                coll.find({ room: room }).toArray((err, dataArr) => {
                    if (err) {
                        returnResult([]);
                    }
                    else {
                        returnResult(dataArr);
                    }
                })
            }
        })


    })
}

// function getUser(id) {


//     mongoClient.connect("mongodb://localhost:27017/", { useUnifiedTopology: true }, (err, dbHost) => {
//         if (err) {
//             console.log("Error connecting to the database");
//         }
//         else {
//             var db = dbHost.db("slDb");
//             db.collection("users", (err, coll) => {
//                 if (err) {
//                     console.log("Error connecting to the collection");
//                 }
//                 else {
//                     coll.findOne({ id: id }, (err, res) => {
//                         if (err) {
//                             console.log("can't find user");
//                         }
//                         else {
//                             console.log("output of find", res);
//                             // return Promise.resolve(res);
//                             // console.log(id);
//                             var pos = users.findIndex(item => item.id == id);

//                             if (pos >= 0) {
//                                 // console.log("users ki position delete krne ke liye", users[pos]);
//                                 return users[pos];
//                             }
//                             else {
//                                 return null;
//                             }
//                         }
//                     });
//                 }
//             })
//         }

//     })
// }

function removeUser(socketid, socket) {
    // var pos = users.findIndex(item => item.id == id);
    // if (pos >= 0) {
    //     users.splice(pos, 1);
    // }

    // mongoClient.connect("mongodb://localhost:27017/", { useUnifiedTopology: true }, (err, dbHost) => {
    //     if (err) {
    //         console.log("Error connecting to the database");
    //     }
    //     else {
    //         var db = dbHost.db("slDb");
    //         db.collection("users", (err, coll) => {
    //             if (err) {
    //                 console.log("Error connecting to the collection");
    //             }
    //             else {
    //                 coll.deleteOne({id:id}, (err, result) => {
    //                     if (err) {
    //                         console.log("error");
    //                     }
    //                     else {
    //                         console.log("delete result : ",result);
    //                         if (result.deletedCount == 1) {
    //                             return true;
    //                         }
    //                         else {
    //                             return false;
    //                         }
    //                     }


    //                 });
    //             }
    //         })
    //     }

    // })

    mongoClient.connect("mongodb://localhost:27017/", { useUnifiedTopology: true }, (err, dbHost) => {
        if (err) {
            console.log("Error connecting to the database");
        }
        else {
            var db = dbHost.db("slDb");
            db.collection("users", (err, coll) => {
                if (err) {
                    console.log("Error connecting to the collection");
                }
                else {
                    coll.findOneAndDelete({ id: socketid }, (err, res) => {
                        if (err) {
                            console.log("error in deletion");
                        }
                        else {
                            console.log("deleted", res.value);
                            var tempUser = res.value;
                            var obj = { username: tempUser.username, message: "has left the room", room: tempUser.room };
                            messageObj.postMessage(obj);
                            socket.to(tempUser.room).broadcast.emit("modifyUserJoinMsg", obj);

                            // var userArr = userObj.getAllUsers(tempUser.room);
                            // io.to(tempUser.room).emit("modifyUsersList", userArr);
                        }
                    })
                }
            })
        }
    })
}

function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        return (users.splice(index, 1)[0]);
        // console.log(users);
    }
}

function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

module.exports = { newUserJoin, getAllUsers, removeUser, userLeave, getRoomUsers };