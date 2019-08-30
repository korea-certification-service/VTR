/**
 * 언어 불문하고 chatUI 하나로 통합 => 각 국가에 맞는 언어는 lang_으로 시작하는 js 파일에 기술
 * 웹소켓이 아닌 UI와 관련된 로직들 기술
 */
var chatUI = {
    isDim: false,
    country: document.getElementById("country").value,
    itemId: document.getElementById("itemId").value,
    buyerTag: document.getElementById("buyerTag").value,
    sellerTag: document.getElementById("sellerTag").value,
    otherId: "",
    init: function() {
        this.setOtherId();
        this.showCmdBtn();
        this.fnAt();
        this.fnImoji();
        this.orientationchange();
        this.sendMsg();
        this.ActBtn();
        this.setTradeInfo();
        this.loadLastStatus();
        this.tempCloseMethod();
    },
    closeWindow: function() {
        var itemId = this.itemId;
        
        var bodyParam = {};
        bodyParam.itemId = itemId;
        bodyParam.stepValue = "15";
        bodyParam.reqValue = {
            reqUserTag: _userId,
            country: this.country
        };

        if(document.getElementById("tradeStatus").value === "50"){
            $.ajax({
                url: "/test/call-backend",
                data: JSON.stringify(bodyParam),
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).always(function(){
                window.close();
            })
        } else {
            window.close();
        }

    },
    setOtherId: function (){
        if(document.getElementById("userId").value == document.getElementById("buyerTag").value){
            this.otherId = document.getElementById("sellerTag").value;
        } else {
            this.otherId = document.getElementById("buyerTag").value
        }
    },
    showCmdBtn: function() {
        var parentEl = document.getElementById("atSec");
        var sellerCmd = document.querySelectorAll(".sellerCmd");
        var buyerCmd = document.querySelectorAll(".buyerCmd");
        var len;
        if(_userId === this.buyerTag) {
            for (var i = 0, len = sellerCmd.length; i < len; i++) {
                parentEl.removeChild(sellerCmd[i]);
            }
        }
        if(_userId === this.sellerTag) {
            for (var i = 0, len = buyerCmd.length; i < len; i++) {
                parentEl.removeChild(buyerCmd[i]);
            }
        }
    },
    methodDim: {
        hideDim: function() {
            chatUI.isDim = false;
            document.getElementById("imojiSec").style.display="none";
            document.getElementById("atSec").style.display="none";
            document.getElementById("chatDim").style.display="none"; 
        },
        showDim: function(secId) {
            this.hideDim();
            chatUI.isDim = true;
            document.getElementById(secId).style.display="block";
            document.getElementById("chatDim").style.display="block";
        }
    },    
    fnAt: function() {
        var that = this;
        
        document.getElementById("btnAt").addEventListener("click", function(){
            that.methodDim.showDim("atSec");
        });

        document.getElementById("chatWrap").addEventListener("click", function(e){
            if(e.target.id === "chatDim" && that.isDim){
                that.methodDim.hideDim();
            }
        });

        var machCmd = document.querySelectorAll(".at_sec .machCmd");
        var iptChat = document.getElementById("iptChat");
        for (var i = 0; i < machCmd.length; i++) {
            machCmd[i].addEventListener("click", function(e){
                //console.log(e.target.innerText);
                iptChat.value = "";
                iptChat.value = e.target.innerText;
                that.methodDim.hideDim();
                // 여기서 메세지 입력되면 됨
                document.getElementById("btnSend").click();
                
                fnScrollLast(); // 스크롤 자동 최하단 이동
            });
        }
    },
    fnImoji: function() {
        var that = this;
        
        document.getElementById("btnEmoji").addEventListener("click", function(){
            that.methodDim.showDim("imojiSec");
        });

        document.getElementById("chatWrap").addEventListener("click", function(e){
            if(e.target.id === "chatDim" && that.isDim){
                that.methodDim.hideDim();
            }
        });

        var imoji = document.querySelectorAll(".imoji_sec li img");
        for (var i = 0; i < imoji.length; i++) {
            imoji[i].addEventListener("click", function(e){
                var title = e.currentTarget.getAttribute("title");
                fnSendMsg({imoji: title});

                that.methodDim.hideDim();
            });
        }
    },
    orientationchange: function() {
        window.addEventListener("orientationchange", function() {
            // window.orientation: 90 가로, 0 세로
            document.getElementById("content").addEventListener("click", function(){
                document.getElementById("chatDim").focus();
            });
        });        
    },
    sendMsg: function() {
        var iptChat = document.getElementById("iptChat");
        var btnSend = document.getElementById("btnSend");
        iptChat.addEventListener("keypress", function(ev){
            if (ev.which == 13) {
                if (ev.target.value==="") {
                    alert(__langChat.sendMsg_alert);
                    return;
                }
                fnSendMsg();
            }
        });
        iptChat.addEventListener("input", function(ev){
            if(iptChat.value === "") btnSend.classList.remove("on");
            else btnSend.classList.add("on");
        });
        btnSend.addEventListener("click", function(ev){
            if (iptChat.value==="") {
                alert(__langChat.sendMsg_alert);
                return;
            }
            fnSendMsg();
        });
    },
    setTradeInfo: function() {
        var itemId = this.itemId;
        var APIServer = document.getElementById("APIServer").value;
        $.ajax({
            url: APIServer + "/v2/items/" + itemId,
            headers: {"token": document.getElementById("tk").value},
            type: "GET",
            contentType: "application/json; charset=utf-8",
        })
        .done(function(result) {
            var item = result.data;
            var statusText = "";
            var categoryText = "";
            
            // console.log(item);
            document.getElementById("tradePrice").value = item.price;
            document.getElementById("tradeStatus").value = item.status;
            document.getElementById("ccCode").value = item.cryptoCurrencyCode;

            switch (item.status) {
                case 1:
                    statusText = __langChat.item_status[1];
                    break;
                case 2:
                    statusText = __langChat.item_status[2];
                    break;
                case 3:
                    statusText = __langChat.item_status[3];
                    break;
                case 4:
                    statusText = __langChat.item_status[4];                    
                    break;
                default:
                    statusText = __langChat.item_status[6];
                    break;
            }
            document.getElementById("statusText").innerText = statusText;
    
            switch (item.category) {
                case "etc":
                    categoryText = __langChat.item_category[0];
                    break;
                case "game":
                    categoryText = __langChat.item_category[1];
                    break;
                case "otc":
                    categoryText = __langChat.item_category[2];
                    break;
            }
            document.getElementById("vtrCategory").innerText = categoryText;
            document.getElementById("vtrTitle").innerText = item.title;
            document.getElementById("vtrPriceNum").innerText = item.price;

        })
        .fail(function(xhr, status, error) {
            console.log(__langChat.setTradeInfo_fail, error);
        });
    },
    loadLastStatus: function() {
        var itemId = this.itemId;
        var APIServer = document.getElementById("APIServer").value;
        var room = document.getElementById("room").value;
        var that = this;

        function getChatList() {
            $.ajax({
                url: "http://192.168.0.100:4000/vtr/getChat",
                type: "GET",
                data: {"room": room},
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            })
            .done(function(result) {
                console.log("msgs", result);
                var userId = document.getElementById("userId").value;
                var msgs = result.msgs;
                var content = document.getElementById("content");
                var domMsg = "";
                var arrIdx = [];

                for (var i = 0; i < msgs.length; i++) {
                    
                    if (msgs[i].who === userId) { // 내가 쓴글
                        if(msgs[i].sameUser) { // 또 쓴 글
                            domMsg += '<div class="bubble my_speech">';
                            domMsg += '<p>'+msgs[i].msg+'<span class="chat_time" style="display:none">';
                            domMsg += msgs[i].msgtime+'</span></p></div>';
                        } else {
                            domMsg += '<em class="my_id">'+msgs[i].who+'</em>';
                            domMsg += '<div class="bubble my_speech">';
                            domMsg += '<p>'+msgs[i].msg+'<span class="chat_time" style="display:none">';
                            domMsg += msgs[i].msgtime+'</span></p></div>';
                            arrIdx.push(i);
                        }

                    } else if (msgs[i].who !== userId){ // 상대방이 쓴 글
                        if(msgs[i].sameUser) { // 또 쓴 글
                            domMsg += '<div class="bubble other_speech">';
                            domMsg += '<p>'+msgs[i].msg+'<span class="chat_time" style="display:none">';
                            domMsg += msgs[i].msgtime+'</span></p></div>';
                        } else {
                            domMsg += '<em class="other_id">'+msgs[i].who+'</em>';
                            domMsg += '<div class="bubble other_speech">';
                            domMsg += '<p>'+msgs[i].msg+'<span class="chat_time" style="display:none">';
                            domMsg += msgs[i].msgtime+'</span></p></div>';
                            arrIdx.push(i);
                        }
                    }
                    
                }

                content.insertAdjacentHTML("beforeend", domMsg);

                var bubble = document.querySelectorAll(".bubble");
                for (let j = 1; j < arrIdx.length; j++) { // 현재 0이 거래안내 메세지
                    var tgtIdx = arrIdx[j];
                    bubble[tgtIdx].querySelector(".chat_time").style.display="inline";
                }
                bubble[bubble.length-1].querySelector(".chat_time").style.display="inline";

                emitTradeProcess();
            })
            .fail(function(xhr, status, error) {
                console.log(__langChat.getChatList_fail, error);
                emitTradeProcess();
            });
        }
        // 완성할 때까지 막기
        // getChatList();

        emitTradeProcess(); // dom 그리는 로직 완성되면 여기 호출부 삭제

        function emitTradeProcess() {
            $.ajax({
                url: APIServer + "/v2/items/" + itemId,
                headers: {"token": document.getElementById("tk").value},
                type: "GET",
                contentType: "application/json; charset=utf-8",
            })
            .done(function(result) {
                var item = result.data;
                var objOpt = { who: _userId, to: that.otherId, buyerTag: that.buyerTag, sellerTag: that.sellerTag };
                // console.log(item);
                
                switch (item.status) {
                    case 1: // 구매자가 구매확인
                        if(_userId === that.buyerTag) {
                            objOpt.command = 2;
                            socket.emit("trade", objOpt);
                        }
                        break;
                    case 2: // 판매자가 판매완료
                        if(_userId === that.sellerTag) {
                            objOpt.command = 3;
                            socket.emit("trade", objOpt);
                        }
                        break;
                    case 3: // 구매자가 거래완료
                        if(_userId === that.buyerTag) {
                            objOpt.command = 4;
                            socket.emit("trade", objOpt);
                        }        
                        break;
                    default:
                        break;
                }
            })
            .fail(function(xhr, status, error) {
                console.log(__langChat.emitTradeProcess_fail, error);
            });
        }
    },
    ActBtn: function() {
        var that = this;
        var dom = '<div class="bubble mach_speech"><p>';
        var content = document.getElementById("content");
        var itemId = this.itemId;
        var objOpt = { who: _userId, to: that.otherId, buyerTag: that.buyerTag, sellerTag: that.sellerTag };
        var proxyEvent= {
            "btnTransactionRequest": function() {
                var thisDom = this;
                var ipt_price = document.querySelectorAll(".ipt_price");
                var tradePrice = parseFloat(ipt_price[ipt_price.length-1].value);
                var ccCode = document.getElementById("ccCode").value;
                // IE에서 disabled여도 클릭이 되는 이슈
                if(thisDom.getAttribute("disabled") === "disabled") return;
                if(tradePrice === 0 || tradePrice < 0 || isNaN(tradePrice)) {
                    alert(__langChat.btnTransactionRequest_alert);
                    ipt_price[ipt_price.length-1].focus();
                    return;
                }

                var bodyParam = {};
                bodyParam.itemId = itemId;
                bodyParam.stepValue = "1";
                bodyParam.reqValue = {
            		buyerTag: that.buyerTag,
                    sellerTag: that.sellerTag,
                    cryptoCurrencyCode: ccCode,
                    price: tradePrice,
                    country: that.country,
                };

                $.ajax({
                    url: "/test/call-backend",
                    data: JSON.stringify(bodyParam),
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                })
                .done(function(json) {
                    //console.log(json);

                    thisDom.setAttribute("disabled", "disabled");
                    //socket.emit("trade", { who: _userId, to: otherId, command: 1.1, price: tradePrice, ccCode:ccCode, buyerTag: that.buyerTag, sellerTag: that.sellerTag });
                    objOpt.command = 1.1;
                    objOpt.price = tradePrice;
                    objOpt.ccCode=ccCode;

                    // console.log(objOpt);
                    socket.emit("trade", objOpt);
                })
                .fail(function(xhr, status, error) {
                    console.log(error);
                    alert(__langChat.btnTransactionRequest_fail);
                })                
            },        
            "btnPurchaseConfirmation": function() {
                var thisDom = this;
                // IE에서 disabled여도 클릭이 되는 이슈
                if(thisDom.getAttribute("disabled") === "disabled") return;

                var bodyParam = {};
                bodyParam.itemId = itemId;
                bodyParam.stepValue = "2";
                bodyParam.reqValue = {country: that.country};
                $.ajax({
                    url: "/test/call-backend",
                    data: JSON.stringify(bodyParam),
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                })
                .done(function(json) {
                    console.log(json);
                    if(json.successYn === undefined) {
                        thisDom.setAttribute("disabled", "disabled");
                        thisDom.nextSibling.setAttribute("disabled", "disabled");
                        //socket.emit("trade", { who: _userId, to: otherId, command: 2.1, buyerTag: that.buyerTag, sellerTag: that.sellerTag });
                        objOpt.command = 2.1;
                        socket.emit("trade", objOpt);
                    } else {
                        alert(json.msg);
                    }

                })
                .fail(function(xhr, status, error) {
                    console.log(error);
                    alert(__langChat.btnPurchaseConfirmation_fail);
                });
            },
            "btnSalesComplete": function() {
                var thisDom = this;
                // IE에서 disabled여도 클릭이 되는 이슈
                if(thisDom.getAttribute("disabled") === "disabled") return; 

                var bodyParam = {};
                bodyParam.itemId = itemId;
                bodyParam.stepValue = "3";
                bodyParam.reqValue = {country: that.country};

                $.ajax({
                    url: "/test/call-backend",
                    data: JSON.stringify(bodyParam),
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                })
                .done(function(json) {
                    console.log(json);
                    if(json.successYn === undefined) {
                        thisDom.setAttribute("disabled", "disabled");
                        thisDom.nextSibling.setAttribute("disabled", "disabled");
                        //socket.emit("trade", { who: _userId, to: otherId, command: 3.1, buyerTag: that.buyerTag, sellerTag: that.sellerTag });
                        objOpt.command = 3.1;
                        socket.emit("trade", objOpt);
                    } else {
                        alert(json.msg);
                    }

                })
                .fail(function(xhr, status, error) {
                    console.log(error);
                    alert(__langChat.btnSalesComplete_fail);
                });               
            },
            "btnTransactionComplete": function() {
                var thisDom = this;
                // IE에서 disabled여도 클릭이 되는 이슈
                if(thisDom.getAttribute("disabled") === "disabled") return; 

                var bodyParam = {};
                bodyParam.itemId = itemId;
                bodyParam.stepValue = "4";
                bodyParam.reqValue = {country: that.country};

                $.ajax({
                    url: "/test/call-backend",
                    data: JSON.stringify(bodyParam),
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                })
                .done(function(json) {
                    console.log(json);
                    if(json.successYn === undefined) {
                        thisDom.setAttribute("disabled", "disabled");
                        //socket.emit("trade", { who: _userId, to: otherId, command: 4.1, buyerTag: that.buyerTag, sellerTag: that.sellerTag });
                        objOpt.command = 4.1;
                        socket.emit("trade", objOpt);
                    } else {
                        alert(json.msg);
                    }

                })
                .fail(function(xhr, status, error) {
                    console.log(error);
                    alert(__langChat.btnTransactionComplete_fail);
                });

            },
            "btnCancelTransaction": function() {
                var thisDom = this;
                var prevDom = thisDom.previousSibling;
                if(prevDom.tagName !== undefined && prevDom.tagName.toLowerCase() === "button") prevDom.setAttribute("disabled", "disabled");
                // IE에서 disabled여도 클릭이 되는 이슈
                if(thisDom.getAttribute("disabled") === "disabled") return; 

                var bodyParam = {};
                bodyParam.itemId = itemId;
                bodyParam.stepValue = "5";
                bodyParam.reqValue = {
                    reqUserTag: _userId,
                    country: that.country
                };

                $.ajax({
                    url: "/test/call-backend",
                    data: JSON.stringify(bodyParam),
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                })
                .done(function(json) {
                    // console.log(json);
                    chatUI.setTradeInfo();
                    if(json.successYn === "Y") {
                        // thisDom.setAttribute("disabled", "disabled");
                        //socket.emit("trade", { who: _userId, to: otherId, command: 5.1, buyerTag: that.buyerTag, sellerTag: that.sellerTag });
                        var btnChat = document.querySelectorAll(".btn_chat");
                        for (var i = 0; i < btnChat.length; i++) {
                            btnChat[i].setAttribute("disabled", "disabled");
                        }
                        objOpt.command = 5.1;
                        socket.emit("trade", objOpt);
                        // document.getElementById("tradeStatus").value = "50";
                    } else {
                        alert(json.msg);
                    }
                })
                .fail(function(xhr, status, error) {
                    console.log(error);
                    alert(__langChat.btnCancelTransaction_fail);
                });
            },
        };

        document.addEventListener("click", function(e) {
            var target = e.target || e.srcElement;
            if(proxyEvent.hasOwnProperty(target.id)) {
                proxyEvent[target.id].call(target);
            }
        });  
    },
    tempCloseMethod : function() {
        document.getElementById("btnOut").addEventListener("click", function(){
            if(confirm(__langChat.tempCloseMethod_confirm)){
                chatUI.closeWindow();
            }
        });     
    }
}    
chatUI.init();

function getChatInDB() {
    $.ajax({
        url: "http://localhost:4000/vtr/getchat",
        data: {},
        type: "GET",
        dataType: "json"
    })
    .done(function(json) {
        console.log(json[0].msgs);
    })
    .fail(function(xhr, status, errorThrown) {

    })
}