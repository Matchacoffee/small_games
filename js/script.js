
//https://www.cnblogs.com/yjmyzz/p/peerjs-tutorial.html

var msg = document.getElementById("msg_show");
var txtSelfId = document.querySelector("input#txtSelfId");
var txtTargetId = document.querySelector("input#txtTargetId");
var txtMsg = document.querySelector("input#txtMsg");
var btnRegister = document.querySelector("button#btnRegister");
var btnSend = document.querySelector("button#btnSend");


let peer = null;
let conn = null;

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
	
	
	//register处理
    btnRegister.onclick = function () {
        if (!peer) {
            if (txtSelfId.value.length == 0) {
                alert("輸入名字，加入戰場!");
                txtSelfId.focus();
                return;
            }
            //创建peer实例
            peer = new Peer(hashCode(txtSelfId.value), connOption);
 
            //register成功的回调
            peer.on('open', function (id) {
                msg.innerHTML = msg.innerHTML += "<div class='align_right'>system : register success " + id + "</div>";
            });
 
            peer.on('connection', (conn) => {
                //收到对方消息的回调
                conn.on('data', (data) => {
                    var msg = JSON.parse(data);
                    msg.innerHTML = msg.innerHTML += "<div class='align_right'>" + msg.from + " : " + msg.body + "</div>";
                    if (txtTargetId.value.length == 0) {
                        txtTargetId.value = msg.from;
                    }
                });
            });
        }
    }
	//发送消息处理
    btnSend.onclick = function () {
        //消息体
        var message = { "from": txtSelfId.value, "to": txtTargetId.value, "body": txtMsg.value };
		
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
            conn = peer.connect(hashCode(txtTargetId.value));
            conn.on('open', () => {
				console.log('open');
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
    //console.log(message);
    msg.innerHTML = msg.innerHTML += "<div class='align_left'>" + message.from + " : " + message.body + "</div>";
}
