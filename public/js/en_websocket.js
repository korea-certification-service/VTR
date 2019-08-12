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
    var arrComand = ["VTR Guide", "Start", "Pay(Escrow)", "Deliver", "Completed", "Cancel"];
    var isCommand = false;
    var regTradingTxt = /^@MACH /;
    var userId = document.getElementById("userId").value;
    var buyerTag = document.getElementById("buyerTag").value;
    var sellerTag = document.getElementById("sellerTag").value;
    var otherId = "";
	var dom = '<div class="bubble mach_speech"><p>';
    var content = document.getElementById("content");
    var btnSend = document.getElementById("btnSend");

    if(userId == buyerTag){
        otherId = sellerTag;
    } else {
        otherId = buyerTag;
    }

    if (regTradingTxt.test(msgVal)) {
        sendTxt = msgVal.replace('@MACH ', '');

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
                    dom += 'Let me tell you about the transaction process.<br>';
                    dom += '<img src="/img/VTR_info_en.jpg" alt="안내문"/>'              
                    content.insertAdjacentHTML("beforeend", dom);    
                    break;               
                default:
                    socket.emit("trade", { who: _userId, to: otherId, msg: originMsg, command: i, buyerTag: buyerTag, sellerTag: sellerTag });
                    break;
            }

        } else { // 없는 명령어
            dom += originMsg +" The command does not exist. Please check again and enter.";      
            dom += '</p></div>';
            content.insertAdjacentHTML("beforeend", dom);
        }

    } else {
        socket.emit('send_msg', { who: _userId, to: otherId, msg: iptChat.value});
    }

    iptChat.value = '';
    btnSend.classList.remove("on");
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
            msg = data.who + " has joined.";
        } else if (data.inout === "out") {
            msg = data.who + " has left.";
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
        dom += "The command <em>" + data.msg + "</em> cannot be executed by the seller.";
        dom += '<span class="chat_time">' + data.msgtime + '</span></p></div>';    
        dom += '</p></div>';
        content.insertAdjacentHTML("beforeend", dom);
    } else if(data.type === "basic"){
        if(data.flagNum === undefined) { // 구매자
            switch (data.command) {
                case 1:     
                    if(tradeStatus === "50") {
                        dom += 'Waiting for the seller\'s Start.<br>Please wait.'; 
                    } else {    
                        return;  
                    }
                    break;
                case 1.1:
                    chatUI.setTradeInfo();
                    dom += 'The seller requested a transaction with a price of <em>' + data.price + data.ccCode + '</em>.<br>Click on the <em>@Mach Pay(Escrow)</em> to proceed with the transaction.';
                    break;
                case 3:           
                    //dom += '';
                    return;
                    break;
                case 3.1:    
                    chatUI.setTradeInfo();        
                    dom += 'The seller has completed the sale.<br>If the transaction is completed, click on the <em>@MACH Completed.</em>';
                    break;
                case 5:    
                    if(tradeStatus == "50") {
                        return;  
                    } else if(tradeStatus !== "4") {            
                        dom += 'The seller is requesting a cancellation.<br> Please wait.';   
                    } else {
                        return;
                    }
                    break;
                case 5.1:
                    chatUI.setTradeInfo(); 
                    socket.isTradeStep1 = undefined;
                    dom += 'The seller has canceled the transaction.';
                    break;                      
                default:
                    dom += '';
                    break;
            }
        } else { // 판매자
            switch (data.command) {
                case 1:    
                    if((tradeStatus === "0" && socket.isTradeStep1 === undefined) || (tradeStatus === "50" && socket.isTradeStep1 === undefined)) {
                        dom += 'You will start the transaction. <br> Please enter the transaction price first.<br>';             
                        dom += '<input type="text" class="ipt_price" maxLength="10" value="' + tradePrice + '"><button id="btnTransactionRequest" class="btn_chat btn_t_r">Start</button>';
                        socket.isTradeStep1 = true;
                    } else if(tradeStatus === "50" && socket.isTradeStep1) {
                        dom += 'Please request a transaction and wait a moment.';
                    } else if(tradeStatus !== "50") {
                        dom += 'You are already in a Start status.';             
                    } else {
                        return;
                    }
                    break;
                case 1.1:    
                    chatUI.setTradeInfo();       
                    dom += 'Your Start has been successfully completed. <br> Waiting for buyer to confirm purchase.';   
                    break;
                case 3:
                    if(tradeStatus == "2") {
                        dom += 'Be sure to send the item and press Deliver. <br> If you sent it by courier, please inform the buyer of the invoice number.<br>';  
                        dom += 'If you want to cancel the transaction, please click Cancel.';  
                        dom += '<button id="btnSalesComplete" class="btn_chat btn_s_c">Deliver</button>';
                        dom += '<button id="btnCancelTransaction" class="btn_chat btn_c_t">Cancel</button>';  
                    } else {
                        dom += 'You are not in a transaction that can be completed.';
                    }
                    break;
                case 3.1:           
                    chatUI.setTradeInfo(); 
                    dom += 'Sale completed successfully. <br> Waiting for buyer to complete transaction.'
                    break;         
                case 5:
                    if(tradeStatus == "50") {
                        dom += 'The transaction to cancel has not yet been processed.';  
                    }else if(tradeStatus === "4") {               
                        dom += 'You can not cancel a transaction while it\'s closed.'; 
                    } else {
                        dom += 'Press the button below to cancel the transaction.';   
                        dom += '<button id="btnCancelTransaction" class="btn_chat btn_c_t">Cancel</button>';    
                    }
                    break;
                case 5.1:
                    chatUI.setTradeInfo(); 
                    socket.isTradeStep1 = undefined;
                    dom += 'Transaction cancellation is complete.';
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
                        dom += 'Waiting for buyer to confirm purchase. <br> Please wait.';     
                    } else {
                        return;
                    }
                    break;
                case 2.1:
                    chatUI.setTradeInfo();          
                    dom += 'The buyer has confirmed the purchase. <br> If you have delivered the item to the buyer, click on the <em>@MACH Deliver</em>.';     
                    break;
                case 4:
                    if(tradeStatus == "3") {     
                        dom += 'Waiting for buyer to complete the transaction.';
                    } else {    
                        return;
                    }
                    break;
                case 4.1:
                    chatUI.setTradeInfo();          
                    dom += 'The buyer has completed the transaction.<br> Make a safe transaction with Market Mach in the future.';
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
                    dom += 'The buyer has canceled the transaction.';
                    break;                                        
                default:
                    dom += '';
                    break;
            }
        } else { // 구매자
            switch (data.command) {
                case 2:
                    if(tradeStatus == "1") {   
                        dom += 'Please confirm the transaction price.<br>The <em>' + vtrPrice + '</em> confirm the purchase at the price, press Confirm Purchase. <br> If you want to cancel the transaction, click Cancel.';
                        dom += '<button id="btnPurchaseConfirmation" class="btn_chat btn_p_c">Pay(Escrow)</button>';    
                        dom += '<button id="btnCancelTransaction" class="btn_chat btn_c_t">Cancel</button>';    
                    } else {
                        dom += 'This is not a transactional state where you can confirm your purchase.';
                    }
                    break;
                case 2.1: 
                    chatUI.setTradeInfo();       
                    dom += 'Pay(Escrow) completed successfully. <br> Waiting for the seller to complete the sale.';   
                    break;
                case 4:
                    if(tradeStatus == "3") {             
                        dom += 'Did you receive the goods well? <br> If the transaction is completed, click on the <em>@MACH Completed</em>.';
                        dom += '<button id="btnTransactionComplete" class="btn_chat btn_t_c">Completed</button>';   
                    } else {
                        dom += 'It is not a condition to complete the transaction.';
                    }
                    break;
                case 4.1:
                    chatUI.setTradeInfo();       
                    dom += 'Your transaction has been completed.<br> Make a safe transaction with Market Mach in the future.';
                    break;                    
                case 5:    
                    if(tradeStatus == "50") {
                        dom += 'The transaction to cancel has not yet been processed.';      
                    } else if(tradeStatus === "2") {       
                        dom += 'The buyer can not cancel a transaction while it is in complete purchase.'; 
                    } else if(tradeStatus === "3") {       
                        dom += 'The buyer can not cancel the transaction when the sale is complete.'; 
                    } else if(tradeStatus === "4") {         
                        dom += 'You can not cancel a transaction while it is closed.'; 
                    } else {
                        dom += 'If you want to cancel the transaction, please press the button below.';   
                        dom += '<button id="btnCancelTransaction" class="btn_chat btn_c_t">Cancel</button>';    
                    }
                    break;
                case 5.1:
                    chatUI.setTradeInfo();
                    socket.isTradeStep1 = undefined;
                    dom += 'It is successfully completed cancel transaction.';
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