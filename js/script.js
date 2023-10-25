
//https://www.cnblogs.com/yjmyzz/p/peerjs-tutorial.html

var msg_show = document.getElementById("msg_show");
var txtSelfId = document.querySelector("input#txtSelfId");
var txtTargetId = document.querySelector("input#txtTargetId");
var txtMsg = document.querySelector("input#txtMsg");
var btnRegister = document.querySelector("button#btnRegister");
var btnSend = document.querySelector("button#btnSend");
var myID = document.getElementById("myID");
var hisID = document.getElementById("hisID");


let peer = null;
let conn = null;
var mystatus = "";
//peer连接时，id不允许有中文，所以转换成hashcode数字
hashCode = function (str) {
	str =  "派對咖抹茶 " + str;
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
	hash = Math.abs(hash);
	var data = hash.toString().padStart(16, "0"),result = "";
	for(i = 0;i <= data.length-1;i++){
		if(i%4 == 0 && i != 0)
			result += '-';
		result += data[i];
	}
    return result;
}

function LetsBattle(){
	var message = { "from": txtSelfId.value,"id": myID.innerHTML, "to": txtTargetId.value, "body": '野生的'+txtSelfId.value+'跳出來了' };
	send(message);
}

window.onload = function() {
	
	 let connOption = { debug: 3 };
	
	//QQ
	//register处理
    btnRegister.onclick = function () {
        if (!peer) {
            if (txtSelfId.value.length == 0) {
                alert("輸入名字，加入戰場!");
                txtSelfId.focus();
                return;
            }
            //创建peer实例
            peer = new Peer(hashCode(txtSelfId.value));
 
            //register成功的回调
            peer.on('open', function (id) {
				myID.innerHTML = id;
                msg_show.innerHTML = msg_show.innerHTML += "<div class='align_left'>系統提示 : 連接成功，歡迎加入戰場! " + txtSelfId.value + "</div>";
				var opponent = document.getElementById("opponent");
				opponent.style.display = "inline-block";
				mystatus = "standby";
            });
			
            peer.on('connection', (conn) => {
				//console.log(peer.connections);
                //收到对方消息的回调
                conn.on('data', (data) => {
                    var msg = JSON.parse(data);
					
					try{
						
					}
					finally{//就算try裡面return finally也會執行
						
					}
					if(mystatus == "standby"){
						if(confirm(msg.from+"前來挑戰\r\n「"+msg.body+"」\r\n是否接戰?")){
							var message = { "from": "抹system茶","id": myID.innerHTML, "to": msg.id, "body": "OK" };
							send(message);
							mystatus = "connect_guest";
							var talk = document.getElementById("talk");
							talk.classList.remove('hideIt');
						}else{
							var message = { "from": '抹system茶',"id": myID.innerHTML, "to": msg.id , "body": 'NO' };
							send(message);
							mystatus = "standby";
							peer.disconnect();
							console.log(peer.connections);
							return;
						}
					}
					if(mystatus == "try_connect"){
						if(msg.from == "抹system茶"){
							if(msg.body == "OK"){
								mystatus = "connect_host";
								var game_list = document.getElementById("game_list");
								game_list.classList.remove('hideIt');
								var talk = document.getElementById("talk");
								talk.classList.remove('hideIt');
								
								return;
							}
							else{
								mystatus = "standby";
								alert("對方已拒絕");
								return;
							}
						}
					}
					
					if(msg.from == "抹system茶"){
						switch(msg.action){
							case 'invite':
							msg_show.innerHTML = msg_show.innerHTML +=  "<div class='align_left'> 戰場進入" + msg.body + " 模式</div>";
							var message = { "from": '抹system茶',"id": myID.innerHTML, "to": txtTargetId.value, "body": msg.body,"action":'reinvite' };
							send(message);
							return;
							case 'reinvite':
							msg_show.innerHTML = msg_show.innerHTML +=  "<div class='align_left'> 戰場進入" + msg.body + " 模式</div>";
							return;
						}
					}
					
					
					//console.log(msg);
                    msg_show.innerHTML = msg_show.innerHTML +=  "<div class='align_left'>" + msg.from + " : " + msg.body + "</div>";
                    if (txtTargetId.value.length == 0) {
						hisID.innerHTML = "對手暱稱:"+msg.from;
                        txtTargetId.value = msg.id;
                    }
                });
            });
			
			peer.on('error', function(err) { 
			  
			  switch(err.type){
				  case "invalid-id":
				  case "unavailable-id":
				    peer = null;
					alert("此暱稱已重複，不可用");
					txtSelfId.focus();
				  break;
				  default:
				    alert(err);
				    peer = new Peer(hashCode(txtSelfId.value));
				  break;
			  }
 
			});
			
        }
    }
	//发送消息处理
    btnSend.onclick = function () {
        //消息体
        var message = { "from": txtSelfId.value,"id": myID.innerHTML, "to": txtTargetId.value, "body": txtMsg.value };
		
        if (!conn) {
            if (txtTargetId.value.length == 0) {
                alert("輸入想說的話");
                txtTargetId.focus();
                return;
            }
            if (txtMsg.value.length == 0) {
                alert("please input message");
                txtMsg.focus();
                return;
            }
 
            //创建到对方的连接
            conn = peer.connect(txtTargetId.value);
			
            conn.on('open', () => {
                //首次发送消息
                sendMessage(message);
            });
			
			
        }
 
        //发送消息
        if (conn.open) {
            sendMessage(message);
        }
		txtMsg.value = "";
    }
    
	
};

function send(message){
	
	if (!conn) {
            //创建到对方的连接
            conn = peer.connect(message.to);
            conn.on('open', () => {
                //首次发送消息
                sendMessage(message);
            });
        }
 
        //发送消息
        if (conn.open) {
            sendMessage(message);
        }
}

sendMessage = function (message) {
	if(mystatus == "standby" && message.from != "抹system茶")
		mystatus = "try_connect";
    conn.send(JSON.stringify(message));
	if(message.from != "抹system茶")
      msg_show.innerHTML = msg_show.innerHTML += "<div class='align_right'>" + message.from + " : " + message.body + "</div>";
}

function btnTest_click(event){
	//console.log(hashCode(txtSelfId.value));
	for(var i=0;i<=10;i++){
		msg_show.innerHTML = msg_show.innerHTML += "<div class='align_left'>系統提示 : " + i.toString() + " !</div>";
	}
}

function testNum(){
	//每四個字塞一個-
   txtTargetId.value = txtTargetId.value.replace(/\D/g,'').replace(/....(?!$)/g,'$&-');
}

function playGames(id){
   switch(id){
     case 1:
	   Invite1A2B();
	 break;
   }
}

function Invite1A2B(){
	var message = { "from": '抹system茶',"id": myID.innerHTML, "to": txtTargetId.value, "body": '1A2B',"action":'invite' };
	send(message);
}

