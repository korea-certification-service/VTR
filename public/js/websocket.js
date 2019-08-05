var serverURL = document.getElementById("serverURL").value;
//var socket = io.connect(serverURL, { transports: ['websocket'] }); // polling 사용 안함
var socket = io(serverURL, { transports: ['websocket'] }); // polling 사용 안함

var _room = document.getElementById("room").value;
var _userId = document.getElementById("userId").value;

// 방 입장
socket.emit('joinroom', { room: _room, userId: _userId, reconnect: false });

function fnScrollLast() {
    var bubble = document.querySelectorAll(".bubble");
    if(bubble.length > 1) {
        bubble[bubble.length-1].scrollIntoView(false);
        //var lastY = bubble[bubble.length-1].offsetTop;
        //document.querySelector(".content").scrollTo(0, lastY);
    }
}

function fnSendMsg() {
    var iptChat = document.getElementById("iptChat");
    var msgVal = iptChat.value;
    var originMsg = iptChat.value;
    var sendTxt = "";
    var arrComand = ["거래안내", "거래요청", "구매확인", "판매완료", "거래완료", "거래취소"];
    var isCommand = false;
    var regTradingTxt = /^@마하 /;
    var userId = document.getElementById("userId").value;
    var buyerTag = document.getElementById("buyerTag").value;
    var sellerTag = document.getElementById("sellerTag").value;
    var otherId = "";
	var dom = '<div class="bubble mach_speech"><p>';
    var content = document.getElementById("content");

    if(userId == buyerTag){
        otherId = sellerTag;
    } else {
        otherId = buyerTag;
    }

    if (regTradingTxt.test(msgVal)) {
        sendTxt = msgVal.replace('@마하 ', '');

        var i;
        for (i = 0; i < arrComand.length; i++) {
          if(arrComand[i] == sendTxt){
            isCommand = true;
            break;
          }
        }

        if(isCommand) { // 존재하는 명령어
			
            switch (i) {
                case 0:
                    dom = '<div class="bubble mach_speech"><p class="max_p">';
                    dom += '거래 프로세스에 대해서 안내해드릴께요.<br>';
                    dom += '<img src="/img/VTR_info.jpg" alt="안내문"/>'              
                    content.insertAdjacentHTML("beforeend", dom);    
                    break;               
                default:
                    socket.emit("trade", { who: _userId, to: otherId, msg: originMsg, command: i, buyerTag: buyerTag, sellerTag: sellerTag });
                    break;
            }

        } else { // 없는 명령어
            dom += originMsg +" 명령어는 존재하지 않습니다. 다시 확인하시고 입력해주세요.";      
            dom += '</p></div>';
            content.insertAdjacentHTML("beforeend", dom);
        }

    } else {
        socket.emit('send_msg', { who: _userId, to: otherId, msg: iptChat.value});
    }

    iptChat.value = '';
    //iptChat.focus();
    fnScrollLast(); // 스크롤 자동 최하단 이동
}

socket.on('new_user', function (data) {
    var p = document.createElement('p');
    document.getElementById("nickname").value = data.nickname;
    p.classList.add("p_system");
    p.innerText = data.yymmdd;
    document.getElementById("content").appendChild(p);
});

socket.on('userlist', function (data) {
    var userlist = data.users;
    var myname = document.getElementById("nickname").value;
    if(userlist.length > 1) {
        userlist.splice(userlist.indexOf(myname), 1);
        document.getElementById("othername").value = userlist[0];
    }
});

socket.on('broadcast_msg', function (data) {
    var txtChat = '';
    
    if(!data.sameUser){ // 같은 유저면 아이디 반복 표시 필요없음
        txtChat += '<em class="my_id">'+_userId+'</em>';
    }

    txtChat += '<div class="bubble my_speech"><p>' + data.msg;
    txtChat += '<span class="chat_time">' + data.msgtime + '</span></p></div>';

    var content = document.getElementById("content");
    content.insertAdjacentHTML("beforeend", txtChat);

    // 메세지에서 반복되는 시간 숨기기
    var my_speech = document.querySelectorAll('.my_speech');
    var len = my_speech.length;

    if(len > 1) { // 두번째 메세지 일때
        var chatTimeLast = my_speech[len-2].querySelector('.chat_time');
        //console.log(chatTimeLast, len)
    
        if(data.sameUser && chatTimeLast.innerText === data.msgtime){
            chatTimeLast.style.display = 'none';
        }
        
        if(chatTimeLast.innerText !== data.msgtime) { // 같은 유저지만 시간이 다른경우 표시
            var em = '<em class="my_id">'+_userId+'</em>';
            my_speech[len-1].insertAdjacentHTML("beforebegin", em);
        }
    }
    
    fnScrollLast(); // 스크롤 자동 최하단 이동
});

socket.on('other_msg', function (data) {
    var txtChat = '';
    
    if(!data.sameUser){ // 같은 유저면 아이디 반복 표시 필요없음
        txtChat += '<em class="other_id">'+ data.who +'</em>';
    }

    txtChat += '<div class="bubble other_speech"><p>' + data.msg;
    txtChat += '<span class="chat_time">' + data.msgtime + '</span></p></div>';

    var content = document.getElementById("content");
    content.insertAdjacentHTML("beforeend", txtChat);

    // 메세지에서 반복되는 시간 숨기기
    var my_speech = document.querySelectorAll('.other_speech');
    var len = my_speech.length;

    if(len > 1) { // 두번째 메세지 일때
        var chatTimeLast = my_speech[len-2].querySelector('.chat_time');
        //console.log(chatTimeLast, len)
    
        if(data.sameUser && chatTimeLast.innerText === data.msgtime){
            chatTimeLast.style.display = 'none';
        }
        
        if(chatTimeLast.innerText !== data.msgtime) { // 같은 유저지만 시간이 다른경우 표시
            var em = '<em class="other_id">'+ data.who +'</em>';
            my_speech[len-1].insertAdjacentHTML("beforebegin", em);
        }
    }

    fnScrollLast(); // 스크롤 자동 최하단 이동
});

// 시스템 메세지 
socket.on('system_msg', function (data) {
    //console.log('system_msg', data);
    var p = document.createElement('p');
    p.classList.add("p_system");
    var msg = "";
    if(data.inout) {
        if (data.inout === "in") {
            msg = data.who + " 님이 입장하셨습니다.";
        } else if (data.inout === "out") {
            msg = data.who + " 님이 퇴장하셨습니다.";
        }
    }
    p.innerText = msg;
    document.getElementById("content").appendChild(p);
    p.scrollIntoView(false);
});

socket.on("trade_seller", function(data) {
    //console.log("trade_seller", data);
	var dom = '<div class="bubble mach_speech"><p>';
    var content = document.getElementById("content");    
    var tradePrice = document.getElementById("tradePrice").value;   
    var tradeStatus = document.getElementById("tradeStatus").value;

    if(data.type === "err") {
        dom += "<em>" + data.msg + "</em> 명령어는 판매자가 실행할 수 없습니다.";
        dom += '<span class="chat_time">' + data.msgtime + '</span></p></div>';    
        dom += '</p></div>';
        content.insertAdjacentHTML("beforeend", dom);
    } else if(data.type === "basic"){
        if(data.flagNum === undefined) { // 구매자
            switch (data.command) {
                case 1:     
                    if(tradeStatus === "50") {
                        dom += '판매자의 거래요청을 기다리는 중입니다.<br>잠시만 기다려주세요.'; 
                    } else {    
                        return;  
                    }
                    break;
                case 1.1:
                    chatUI.setTradeInfo();
                    dom += '판매자가 <em>' + data.price + data.ccCode + '</em>의 가격으로 거래요청을 하였습니다.<br>거래를 진행하시려면 <em>@마하 구매확인</em>을 입력해주세요.';
                    break;
                case 3:           
                    //dom += '';
                    return;
                    break;
                case 3.1:    
                    chatUI.setTradeInfo();        
                    dom += '판매자가 판매완료를 하였습니다.<br>거래가 정상적으로 끝났다면 <em>@마하 거래완료</em>를 입력해주세요.';
                    break;
                case 5:    
                    if(tradeStatus == "50") {
                        return;  
                    } else if(tradeStatus !== "4") {            
                        dom += '판매자가 거래취소를 요청 중입니다.<br>잠시만 기다려주세요.';   
                    } else {
                        return;
                    }
                    break;
                case 5.1:
                    chatUI.setTradeInfo(); 
                    socket.isTradeStep1 = undefined;
                    dom += '판매자가 거래취소를 하였습니다.';
                    break;                      
                default:
                    dom += '';
                    break;
            }
        } else { // 판매자
            switch (data.command) {
                case 1:    
                    if(tradeStatus === "50" && socket.isTradeStep1 === undefined) {
                        dom += '거래를 시작하겠습니다.<br>먼저 거래 가격을 입력해주세요.<br>';             
                        dom += '<input type="text" class="ipt_price" maxLength="10" value="' + tradePrice + '"><button id="btnTransactionRequest" class="btn_chat btn_t_r">거래요청</button>';
                        socket.isTradeStep1 = true;
                    } else if(tradeStatus === "50" && socket.isTradeStep1) {
                        dom += '거래요청을 하시고 잠시만 기다려주세요.';
                    } else if(tradeStatus !== "50") {
                        dom += '이미 거래요청 상태입니다.';             
                    } else {
                        return;
                    }
                    break;
                case 1.1:    
                    chatUI.setTradeInfo();       
                    dom += '거래요청이 정상적으로 완료되었습니다.<br>구매자의 구매확인을 기다리는 중입니다.';   
                    break;
                case 3:
                    if(tradeStatus == "2") {
                        dom += '반드시 물건을 보내신 후 판매완료를 눌러주세요.<br>택배로 보내셨다면 송장번호를 구매자에게 알려주세요.<br>';  
                        dom += '거래 취소를 원하시면 거래취소를 눌러주세요.';  
                        dom += '<button id="btnSalesComplete" class="btn_chat btn_s_c">판매완료</button>';
                        dom += '<button id="btnCancelTransaction" class="btn_chat btn_c_t">거래취소</button>';  
                    } else {
                        dom += '판매완료를 할 수 있는 거래상태가 아닙니다.';
                    }
                    break;
                case 3.1:           
                    chatUI.setTradeInfo(); 
                    dom += '판매완료가 정상적으로 완료되었습니다.<br>구매자의 거래완료를 기다리는 중입니다.'
                    break;         
                case 5:
                    if(tradeStatus == "50") {
                        dom += '취소할 거래가 아직 진행 되지 않았습니다.';  
                    }else if(tradeStatus === "4") {               
                        dom += '거래완료 상태에서는 거래를 취소할 수 없습니다.'; 
                    } else {
                        dom += '거래취소를 원하시면 아래 버튼을 눌러주세요.';   
                        dom += '<button id="btnCancelTransaction" class="btn_chat btn_c_t">거래취소</button>';    
                    }
                    break;
                case 5.1:
                    chatUI.setTradeInfo(); 
                    socket.isTradeStep1 = undefined;
                    dom += '거래 취소가 완료되었습니다.';
                    break;                                     
                default:
                    dom += '';
                    break;
            }
        }

		dom += '<span class="chat_time">' + data.msgtime + '</span></p></div>';
        content.insertAdjacentHTML("beforeend", dom);
    }

    fnScrollLast(); // 스크롤 자동 최하단 이동
});

socket.on("trade_buyer", function(data) {
    //console.log("trade_buyer", data);
	var dom = '<div class="bubble mach_speech"><p>';
    var content = document.getElementById("content");
    var tradeStatus = document.getElementById("tradeStatus").value;
    var vtrPrice = document.getElementById("vtrPrice").innerText;

    if(data.type === "err") {
        dom += "<em>" + data.msg + "</em> 명령어는 구매자가 실행할 수 없습니다.";
        dom += '<span class="chat_time">' + data.msgtime + '</span></p></div>';    
        dom += '</p></div>';
        content.insertAdjacentHTML("beforeend", dom);
    } else if(data.type === "basic"){
        if(data.flagNum === undefined) { // 판매자
            switch (data.command) {
                case 2:   
                    if(tradeStatus == "1") {         
                        dom += '구매자의 구매확인을 기다리는 중입니다.<br>잠시만 기다려주세요.';     
                    } else {
                        return;
                    }
                    break;
                case 2.1:
                    chatUI.setTradeInfo();          
                    dom += '구매자가 구매확인을 하였습니다.<br>물건을 구매자에게 송달 하셨다면 <em>@마하 판매완료</em>를 입력해주세요';     
                    break;
                case 4:
                    if(tradeStatus == "3") {     
                        dom += '구매자의 거래완료를 기다리는 중입니다.';
                    } else {    
                        return;
                    }
                    break;
                case 4.1:
                    chatUI.setTradeInfo();          
                    dom += '구매자가 거래완료를 눌렀습니다.<br>앞으로도 마켓마하와 함께 안전한 거래하세요.';
                    break;
                case 5:    
                    if(tradeStatus == "2") {
                        // dom += '구매자가 거래취소를 요청 중입니다.<br>잠시만 기다려주세요.';
                        return; // 구매확인 단계에서도 구매취소 못하게 막음
                    } else {    
                        return;  
                    }
                    break; 
                case 5.1:
                    chatUI.setTradeInfo(); 
                    socket.isTradeStep1 = undefined;
                    dom += '구매자가 거래취소를 하였습니다.';
                    break;                                        
                default:
                    dom += '';
                    break;
            }
        } else { // 구매자
            switch (data.command) {
                case 2:
                    if(tradeStatus == "1") {   
                        dom += '거래가격을 확인 해주세요.<br><em>' + vtrPrice + '</em> 가격으로 구매를 확정 하시려면 구매확인을 눌러주세요.<br>거래취소를 원하시면 거래취소를 눌러주세요.';
                        dom += '<button id="btnPurchaseConfirmation" class="btn_chat btn_p_c">구매확인</button>';    
                        dom += '<button id="btnCancelTransaction" class="btn_chat btn_">거래취소</button>';    
                    } else {
                        dom += '구매확인을 할 수 있는 거래상태가 아닙니다.';
                    }
                    break;
                case 2.1: 
                    chatUI.setTradeInfo();       
                    dom += '구매확인이 정상적으로 완료되었습니다.<br>판매자의 판매완료를 기다리는 중입니다.';   
                    break;
                case 4:
                    if(tradeStatus == "3") {             
                        dom += '물건은 잘 받으셨나요?<br>정상적으로 거래가 완료되었다면 거래완료를 눌러주세요.';
                        dom += '<button id="btnTransactionComplete" class="btn_chat btn_t_c">거래완료</button>';   
                    } else {
                        dom += '거래완료를 할 수 있는 거래상태가 아닙니다.';
                    }
                    break;
                case 4.1:
                    chatUI.setTradeInfo();       
                    dom += '거래가 완료 되었습니다.<br>앞으로도 마켓마하와 함께 안전한 거래하세요.';
                    break;                    
                case 5:    
                    if(tradeStatus == "50") {
                        dom += '취소할 거래가 아직 진행 되지 않았습니다.';      
                    } else if(tradeStatus === "2") {       
                        dom += '구매자는 구매완료 상태에서는 거래를 취소할 수 없습니다.'; 
                    } else if(tradeStatus === "3") {       
                        dom += '구매자는 판매완료 상태에서는 거래를 취소할 수 없습니다.'; 
                    } else if(tradeStatus === "4") {         
                        dom += '거래완료 상태에서는 거래를 취소할 수 없습니다.'; 
                    } else {
                        dom += '거래를 취소를 원하시면 아래 버튼을 눌러주세요.';   
                        dom += '<button id="btnCancelTransaction" class="btn_chat btn_c_t">거래취소</button>';    
                    }
                    break;
                case 5.1:
                    chatUI.setTradeInfo();
                    socket.isTradeStep1 = undefined;
                    dom += '거래 취소가 완료되었습니다.';
                    break;                                      
                default:
                    dom += '';
                    break;
            }
        }
       
		dom += '<span class="chat_time">' + data.msgtime + '</span></p></div>';
        content.insertAdjacentHTML("beforeend", dom); 
    }    

    fnScrollLast(); // 스크롤 자동 최하단 이동
});

// 접속 끊겼을 때
socket.on('reconnect', function (data) {
    console.log('reconnect');
    socket.emit('joinroom', { room: _room, userId: _userId, reconnect: true });
});