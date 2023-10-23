
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
var status = "";
//peer连接时，id不允许有中文，所以转换成hashcode数字
hashCode = function (str) {
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
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
            peer = new Peer();
 
            //register成功的回调
            peer.on('open', function (id) {
				console.log(peer.connections);
				myID.innerHTML = id;
                msg_show.innerHTML = msg_show.innerHTML += "<div class='align_left'>系統提示 : 連接成功，歡迎加入戰場! " + txtSelfId.value + "</div>";
            });
			
            peer.on('connection', (conn) => {
				console.log(peer.connections);
                //收到对方消息的回调
                conn.on('data', (data) => {
                    var msg = JSON.parse(data);
					
					if(confirm(msg.from+"前來挑戰\r\n"+"是否接戰?")){
						alert("OK");
					}else{
						alert("BYE");
						return;
					}
					
					//console.log(msg);
                    msg_show.innerHTML = msg_show.innerHTML +=  "<div class='align_left'>" + msg.from + " : " + msg.body + "</div>";
                    if (txtTargetId.value.length == 0) {
						hisID.innerHTML = "對手暱稱:"+msg.from;
                        txtTargetId.value = msg.id;
                    }
                });
            });
			
			peer.on('error', function(err) { alert(err)});
			
        }
    }
	//发送消息处理
    btnSend.onclick = function () {
        //消息体
        var message = { "from": txtSelfId.value,"id": myID.innerHTML, "to": txtTargetId.value, "body": txtMsg.value };
		
        if (!conn) {
            if (txtTargetId.value.length == 0) {
                alert("please input target name");
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
    }
    
	
};

sendMessage = function (message) {
    conn.send(JSON.stringify(message));
    msg_show.innerHTML = msg_show.innerHTML += "<div class='align_right'>" + message.from + " : " + message.body + "</div>";
}
