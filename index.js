var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
const http = require("http");
var socketio = require("socket.io");
var queryString = require("querystring");
const { removeUser } = require("./utils/usersInfo");

var userObj = require("./utils/usersInfo.js");
var messageObj = require("./utils/messageManagement.js");

const PORT = 4000;

var app = express();
const server = http.createServer(app);
var io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (request, response) => {
    var fileUrl = path.join(__dirname, 'public', 'index.html');
    response.sendFile(fileUrl);
})

app.post("/home", (request, response) => {
    var username = request.body.username;
    var room = request.body.room;
    console.log(request.body);
    var temp = queryString.stringify({ username: username, room: room });
    console.log(temp);
    response.redirect("/chat?" + temp);
})

app.get("/chat", (request, response) => {
    var fileUrl = path.join(__dirname, 'public', 'chat.html');
    response.sendFile(fileUrl);
})

//when a new user joins the chat
io.on("connection", (socket) => {
    socket.on("joinRoom", (data) => {
        socket.join(data.room);
        console.log(data);

        var obj = { username: data.username, message: "has joined the chat", room: data.room };
        var user = userObj.newUserJoin(socket.id, data.username, data.room);
        messageObj.postMessage(obj);
        socket.emit("welcomeUser", "Welcome to the Room");
        socket.broadcast.to(data.room).emit("modifyUserJoinMsg", obj);


        userObj.getAllUsers(obj.room, (p1) => {
            if (p1.length == 0) {
                console.log("No users in the room");
            }
            else {
                if (p1[0].error) {
                    console.log(p1[0].error);
                }
                else {
                    console.log(p1);
                    // io.to(data.room).emit("modifyUsersList", p1);
                    io.to(data.room).emit('roomUsers', {
                        room: data.room,
                        users: userObj.getRoomUsers(data.room)
                      });

                }
            }
        })
        // console.log("usersArray", userArr);
        // io.to(data.room).emit('roomUsers', {
        //     room: data.room,
        //     users: userObj.getRoomUsers(data.room)
        //   });


    })

    

    socket.on("disconnect", () => {

        const user = userObj.userLeave(socket.id);

        console.log("User has left the room");
        userObj.removeUser(socket.id, socket);

        // io.to(user.room).emit("modifyUsersList", user);
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: userObj.getRoomUsers(user.room)
          });

    })
    socket.on("message", (obj) => {
        console.log("Message received : ", obj);
        messageObj.postMessage(obj);
        io.to(obj.room).emit("chatMessage", obj);
        // socket.emit("chatMessage", obj);
        // console.log("All messages", messageObj.getAllMessages());
        // console.log("All users in the room");
        userObj.getAllUsers(obj.room, (p1) => {
            if (p1.length == 0) {
                console.log("No users in the room");
            }
            else {
                if (p1[0].error) {
                    console.log(p1[0].error);
                }
                else {
                    // console.log(p1);
                    // io.to(obj.room).emit("modifyUsersList", p1);
                    io.to(obj.room).emit('roomUsers', {
                        room: obj.room,
                        users: userObj.getRoomUsers(obj.room)
                      });
                }
            }
        })
    })

})

server.listen(PORT, (err) => {
    if (!err) {
        console.log(`Server at PORT ${PORT}`);
    }
})
