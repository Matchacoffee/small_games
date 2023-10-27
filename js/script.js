
//https://www.cnblogs.com/yjmyzz/p/peerjs-tutorial.html

var msg_show = document.getElementById("msg_show");
var txtSelfId = document.querySelector("input#txtSelfId");
var txtTargetId = document.querySelector("input#txtTargetId");
var txtMsg = document.querySelector("input#txtMsg");
var btnRegister = document.querySelector("button#btnRegister");
var btnSend = document.querySelector("button#btnSend");
var myID = document.getElementById("myID");
var hisID = document.getElementById("hisID");
var msgInput = document.getElementById("msgInput");
var dialogconfirm = document.getElementById("dialogconfirm"); 
var msgShow = document.getElementById("msgShow"); 
var hint = document.getElementById("hint");
var details = document.getElementById("details");
var answerRecord={};
var database_num = ['0','1','2','3','4','5','6','7','8','9'];
var database = [];

let peer = null;
let conn = null;
var mystatus = "";
var gamestatus = "";
var opstatus = "";
var myAnswer = "";
var tryTimes = 0;
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
	 database_Reset();
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
							var message = { "from": "抹system茶","id": myID.innerHTML, "to": msg.id, "body": "OK" ,"name":txtSelfId.value};
							send(message);
							mystatus = "connect_guest";
							var talk = document.getElementById("talk");
							talk.classList.remove('hideIt');
							if (txtTargetId.value.length == 0) {
								hisID.innerHTML = msg.from;
								txtTargetId.value = msg.id;
							}
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
								hisID.innerHTML = msg.name;
								txtTargetId.value = msg.id;
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
							//收到邀請 告知對方並進入準備階段
							msg_show.innerHTML = msg_show.innerHTML +=  "<div class='align_center'><font color='yellow'> 戰場進入 " + msg.body + " 模式</font></div>";
							var message = { "from": '抹system茶',"id": myID.innerHTML, "to": txtTargetId.value, "body": msg.body,"action":'reinvite' };
							send(message);
							gamestatus = "prepareAnswer";
							document.getElementById('div1').classList.remove('hideIt');
							document.getElementById('div2').classList.remove('hideIt');
							switch(msg.body){
								case '1A2B':
								  msgInput.showModal();
								return;
							}
							return;
							case 'reinvite':
							//確認對方收到邀請 並進入準備階段
							msg_show.innerHTML = msg_show.innerHTML +=  "<div class='align_center'><font color='yellow'> 戰場進入" + msg.body + " 模式</font></div>";
							var game_list = document.getElementById("game_list");
						    game_list.classList.add('hideIt');
							gamestatus = "prepareAnswer";
							document.getElementById('div1').classList.remove('hideIt');
							document.getElementById('div2').classList.remove('hideIt');
							switch(msg.body){
								case '1A2B':
								  msgInput.showModal();
								return;
							}
							return;
							case '1A2B'://被邀請者先猜 這叫禮讓
							  switch(msg.body){
								  case 'readyAnswer':
								    msg_show.innerHTML = msg_show.innerHTML +=  "<div class='align_center'><font color='yellow'>" + hisID.innerHTML + " 已設定好謎底</font></div>";
									if(mystatus == "connect_guest"){
										gamestatus = "ready";
										hint.innerHTML = "";
										//<span class="letter">橙</span>
										var temp = "輪到你猜了!";
										for(i=0;i<=temp.length-1;i++){
											hint.innerHTML += "<span class='letter'>" + temp[i] + "</span>";
										}
										
									}
								  break;
								  case 'JudgeAnswer':
								    var result = game1A2B_JudgeAnswer(myAnswer,msg.data);
									var message = { "from": '抹system茶',"id": myID.innerHTML, "to": txtTargetId.value, "body": 'ReplyAnswer',"action":'1A2B',"data":msg.data+','+result,"times": msg.times};
							        send(message);
									
									const node = document.createElement("p");
									node.classList.add('align_right');
									node.innerHTML =  "第"+msg.times+"次:"+msg.data+"<font color='yellow'> "+result+"</font>";
									details.appendChild(node);
									
									if(result == '4A0B'){//對手勝利 遊戲結束
									    document.getElementById('dialogconfirm_content').innerHTML = "你輸了<br/>要繼續下一局嗎?";
										dialogconfirm.showModal();
										
									}
									else{//還沒結束 換你猜
   									    gamestatus = "ready";
										hint.innerHTML = "";
										//<span class="letter">橙</span>
										var temp = "輪到你猜了!";
										for(i=0;i<=temp.length-1;i++){
											hint.innerHTML += "<span class='letter'>" + temp[i] + "</span>";
										}
									}
									
								  break;
								  case 'ReplyAnswer':
								    var systemPanel  = document.getElementById("systemPanel");
									var result = msg.data.split(',');
									systemPanel.innerHTML += "第"+msg.times+"次:"+result[0]+"<font color='yellow'> "+result[1]+"</font>";
									
									answerRecord[result[0]] = result[1];
									DealGuess(result[0],result[1]);
									
									if(result[1] == '4A0B'){//勝利 遊戲結束
										document.getElementById('dialogconfirm_content').innerHTML = "獲得勝利<br/>要繼續下一局嗎?";
										dialogconfirm.showModal();
									}
									
								  break;
								  case 'QAQ':
								    document.getElementById('msgShow_content').innerHTML = "你的對手表示這是一場好遊戲並且跑路了<br/>你失去了一個對手";
								    msgShow.showModal();
								  break;
								  case 'Again':
								  opstatus = 'waitAgain';
								  if(gamestatus == 'waitAgain'){
									  game1A2B_Init();
								  }
								  break;
							  }
							return;
						}
					}
					
					
					//console.log(msg);
                    msg_show.innerHTML = msg_show.innerHTML +=  "<div class='align_left'>" + msg.from + " : " + msg.body + "</div>";
                    
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
	console.log(answerRecord);
	var QQ = "1234,1A3B";
	var result = QQ.split(',');
	answerRecord[result[0]] = result[1];
	QQ = "1784,1A3B";
	result = QQ.split(',');
	answerRecord[result[0]] = result[1];
	/*for(var i = 0; i < Object.keys(answerRecord).length; i++) {
     console.log (Object.keys(answerRecord)[i], Object.values(answerRecord)[i]); 
    }*/
	for (const [key, value] of Object.entries(answerRecord)) 
	{
	  console.log(key, value);
	} 
	
	console.log(answerRecord);
	database_Reset();
	return;
	for(var i=0;i<=10;i++){
		msg_show.innerHTML = msg_show.innerHTML += "<div class='align_left'>系統提示 : " + i.toString() + " !</div>";
	}
}

function click_Answer(event){
	var NoAnswer = document.getElementById("NoAnswer");
	var YesAnswer = document.getElementById("YesAnswer");
	NoAnswer.style.display = NoAnswer.style.display == 'none' ? '' : 'none';
	YesAnswer.style.display = NoAnswer.style.display == 'none' ? '' : 'none';
}

function testNum(){
	//每四個字塞一個-
   txtTargetId.value = txtTargetId.value.replace(/\D/g,'').replace(/....(?!$)/g,'$&-');
}

function txtGuess_keyup(event){
	event.target.value = event.target.value.replace(/\D/g,'');
	if(new Set(event.target.value).size != event.target.value.length){
		event.target.value = Array.from(new Set(event.target.value)).join('');
	  //alert("請勿輸入重複數字");	
	}
}

function btnGuess_click(event){//送出你的猜測
    var txtGuess = document.getElementById("txtGuess");
	if(txtGuess.value.length != 4){
		alert("請輸入四位數字");
		return;
	}
	tryTimes++;
    var message = { "from": '抹system茶',"id": myID.innerHTML, "to": txtTargetId.value, "body": 'JudgeAnswer',"action":'1A2B',"data": txtGuess.value,"times":tryTimes};
	send(message);
	gamestatus = "sendGuess";
	hint.innerHTML = "";
}

//1A2B 確定答案並準備開始猜
function game1A2B_CheckAnswer(){
	if(mystatus != "connect_host" && mystatus != "connect_guest"){
		alert("找不到對手，無法開始");
		return;
	}
	var msgInputTxt = document.getElementById("msgInputTxt");
	if(msgInputTxt.value.length != 4){
		alert('請輸入4位不重覆數字');
		return;
	}
	myAnswer = msgInputTxt.value;
	var YesAnswer = document.getElementById("YesAnswer");
	YesAnswer.innerHTML = "";
	for(i = 0;i<msgInputTxt.value.length;i++){//<img src="images/0.png" class="NoAnswer"/>
		YesAnswer.innerHTML += "<img class='NoAnswer' src='images/" + msgInputTxt.value[i] + ".png' />";
	}
	msgInput.close();
	gamestatus = "readyAnswer"
	//通知對手你好了
	var message = { "from": '抹system茶',"id": myID.innerHTML, "to": txtTargetId.value, "body": gamestatus,"action":'1A2B' };
	send(message);
}

function game1A2B_JudgeAnswer(myAnswer,value){
	var result = "";
	var a = 0,b=0;
	for(i=0;i<=myAnswer.length-1;i++){
		if(myAnswer[i] == value[i])
			a++;
		else if(myAnswer.indexOf(value[i]) >= 0)
			b++
	}
	return a+'A'+b+'B';
}

//詢問對手要不要繼續玩
function battleAgain(){
	gamestatus = "waitAgain";
	var message = { "from": '抹system茶',"id": myID.innerHTML, "to": txtTargetId.value, "body": 'Again',"action":'1A2B' };
	send(message);
	//已收到對手請求
	if(opstatus == "waitAgain")
		game1A2B_Init();
}

//不玩了
function snowflake(){
	var message = { "from": '抹system茶',"id": myID.innerHTML, "to": txtTargetId.value, "body": 'QAQ',"action":'1A2B' };
	send(message);
	window.location.reload();
}

function database_Reset(){
	database = [];
	var tmp = 0,unit_1 = 3,unit_10=0,unit_100=0,unit_1000=0;
	for(i=0;i<10000;i++){  //這個for產生答案庫 
        unit_1 = parseInt(((i/1)%10)).toString();  //以下四行把四位數拆成四個各位數分別存到四個變數 
        unit_10 = parseInt((i/10)%10).toString();
        unit_100 = parseInt((i/100)%10).toString();
        unit_1000 = parseInt((i/1000)%10).toString();
		if(database_num.indexOf(unit_1) == -1 || database_num.indexOf(unit_10) == -1 || database_num.indexOf(unit_100) == -1 || database_num.indexOf(unit_1000) == -1)
			continue;
        if(unit_1!=unit_10 && unit_1!=unit_100 && unit_1!=unit_1000 && unit_10!=unit_100 && unit_10!=unit_1000 && unit_100!=unit_1000){
            database[tmp] = unit_1000+unit_100+unit_10+unit_1;
            tmp++;
        }
    }
}

function DealGuess(key,value){//處理當下這次就好
    var index = 0,numIndex = 0;
	var newDatabase = [];
	var newNum = [];
	for (answer of database) 
	{
		if(game1A2B_JudgeAnswer(key,answer) == value){
		  	newDatabase[index] = answer;
			index++;
			if(newNum.length != 10){
				for(i=0;i<=answer.length-1;i++){
					if(newNum.indexOf(answer[i]) > -1)
						continue;
					else {
						newNum[numIndex] = answer[i];
						numIndex++;
					}
				}
			}
		}
	}
	database_num = newNum;
	database = newDatabase;
	//不顯示
	for(i=0;i<10;i++){
		if(database_num.indexOf(i.toString()) == -1)
		  document.getElementById('guessNum'+i.toString()).classList.remove("hideIt");
	}
}

function XXXX(){
	database_num = database_num.filter(function(item) {
		return item != "2"
	});
	
}

function game1A2B_Init(){
	for(i=0;i<10;i++){
		if(database_num.indexOf(i.toString()) == -1)
		  document.getElementById('guessNum'+i.toString()).classList.remove("hideIt");
	}
	opstatus = "";
	gamestatus = "";
    myAnswer = "";
    tryTimes = 0;
	hint.innerHTML = "";
	systemPanel.innerHTML = "";
	details.innerHTML = "<summary >對手紀錄</summary>";
	msgInput.showModal();
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

