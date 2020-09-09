var chatForm = document.getElementById("chatForm");
var chatMessage = document.getElementById("txtChatMessage");
var chatMessageDiv = document.getElementById("chatMessagesDiv");
// var chatMessageDiv2 = document.getElementById("chatMessagesDiv");
var participantsList = document.getElementById("participantsList");
var feedback = document.getElementById("feedback");
// var chatText = document.getElementById('chat-text');
// var typedChat = chatText.value;
// console.log(Qs.parse(location.search));

var userObj = Qs.parse(location.search, { ignoreQueryPrefix: true });
var username = userObj.username;
var room = userObj.room;
console.log("Username : " + username);
const socket = io();
socket.emit("joinRoom", { username: username, room: room });
socket.on("welcomeUser", (msg) => {
    // chatMessageDiv.innerHTML += msg;
})

// chatMessage.addEventListener("keypress", (e) => {
//     e.preventDefault();
//     socket.emit("typing", username);
// })

socket.on('roomUsers', ({ room, users }) => {
    // outputRoomName(room);
    outputUsers(users);
  });

socket.on("chatMessage", (obj) => {
    // console.log("inside chat message", obj);
    feedback.innerHTML = "";
    chatMessageDiv.scrollTop = chatMessageDiv.scrollHeight;
    formatMessage(obj);
})

// socket.on("typing", (typingPerson) => {
//     var paraElmnt = document.createElement('p');
//     var person = typingPerson + ' is typing...';
//     var pTxtNode = document.createTextNode(person);
//     paraElmnt.appendChild(pTxtNode);
//     feedback.appendChild(paraElmnt);
// })

socket.on("modifyUserJoinMsg", (obj) => {
    // var paraElement=document.createElement("p");
    // var str = obj.username+" : "+obj.message;
    // var pTextNode = document.createTextNode(str);
    // paraElement.appendChild(pTextNode);
    // chatMessageDiv.appendChild(paraElement);

    chatMessageDiv.innerHTML += '<p><span style=\"color:green\"><strong>' + obj.username + ' ' + obj.message + '</span></strong></p><hr>';

})

// var usersToDeleteFromList = [];

socket.on("modifyUsersList", (usersArr) => {
    // usersToDeleteFromList = usersArr;
    participantsList.innerHTML = "";
    // console.log(usersArr);
    for (var i = 0; i < usersArr.length; i++) {
        var liElement = document.createElement("li");
        var user = usersArr[i].username;
        var liTextNode = document.createTextNode(user);
        liElement.appendChild(liTextNode);
        participantsList.appendChild(liElement);
    }
})


// console.log("All users list : ", usersToDeleteFromList);
function formatMessage(obj) {
    // var paraElement = document.createElement('p');
    // var str = obj.username+" : "+obj.message;
    // var pTextNode = document.createTextNode(str);
    // paraElement.appendChild(pTextNode);
    // chatMessageDiv.appendChild(paraElement);

    chatMessageDiv.innerHTML += '<p><strong>' + obj.username + ' : </strong> ' + obj.message + '</p><hr>';
    chatMessage.value = '';
    
    // return str;
}



function sendMessageEventHandler() {
    socket.emit("message", { message: chatMessage.value, username: username, room: room });
    // return false;
}

function outputUsers(users) {
    participantsList.innerHTML = '';
    users.forEach(user=>{
      const li = document.createElement('li');
      li.innerText = user.username;
      participantsList.appendChild(li);
    });
   }