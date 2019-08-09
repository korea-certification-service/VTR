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
    fnAt: function() {
        var that = this;

        function hideDim() {
            that.isDim = false;
            document.getElementById("atSec").style.display="none";
            document.getElementById("chatDim").style.display="none";  
        }

        function showDim() {
            that.isDim = true;
            document.getElementById("atSec").style.display="block";
            document.getElementById("chatDim").style.display="block";
        }
        
        document.getElementById("btnAt").addEventListener("click", function(){
            showDim();
        });

        document.getElementById("chatWrap").addEventListener("click", function(e){
            if(e.target.id === "chatDim" && that.isDim){
                hideDim();
            }
        });

        var machCmd = document.querySelectorAll(".at_sec .machCmd");
        var iptChat = document.getElementById("iptChat");
        for (var i = 0; i < machCmd.length; i++) {
            machCmd[i].addEventListener("click", function(e){
                //console.log(e.target.innerText);
                iptChat.value = "";
                iptChat.value = e.target.innerText;
                hideDim();
                // 여기서 메세지 입력되면 됨
                
                fnScrollLast(); // 스크롤 자동 최하단 이동
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
                    alert("Please input the message.");
                    return;
                }
                fnSendMsg();
            }
        });
        iptChat.addEventListener("input", function(ev){
            if(iptChat.value === "") btnSend.classList.remove("on");
            else btnSend.classList.add("on");
        });
        document.getElementById("btnSend").addEventListener("click", function(ev){
            if (ev.target.previousSibling.previousSibling.value==="") {
                alert("Please input the message.");
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
                    statusText = "Start";
                    break;
                case 2:
                    statusText = "Pay(Escrow)";
                    break;
                case 3:
                    statusText = "Deliver";
                    break;
                case 4:
                    statusText = "Completed";                    
                    break;
                default:
                    statusText = "Trading";
                    break;
            }
            document.getElementById("statusText").innerText = statusText;
    
            switch (item.category) {
                case "etc":
                    categoryText = "Asset";
                    break;
                case "game":
                    categoryText = "Game Item";
                    break;
                case "otc":
                    categoryText = "OTC";
                    break;
            }
            document.getElementById("vtrCategory").innerText = categoryText;
            document.getElementById("vtrTitle").innerText = item.title;
            document.getElementById("vtrPriceNum").innerText = item.price;

        })
        .fail(function(xhr, status, error) {
            console.log("It is occured a error during VTR info.", error);
        });
    },
    loadLastStatus: function() {
        var itemId = this.itemId;
        var APIServer = document.getElementById("APIServer").value;
        var room = document.getElementById("room").value;
        var that = this;

        function getChatList() {
            $.ajax({
                url: "http://192.168.0.10:4000/vtr/getChat",
                type: "GET",
                data: {"room": room},
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            })
            .done(function(result) {
                console.log("msgs", result);
                var userId = document.getElementById("userId").value;
                var msgs = result.msgs;
                var domMsg = "";

                for (var i = 0; i < msgs.length; i++) {
                    
                    if (msgs[i].who === userId) { // 내가 쓴글
                        if(msgs[i].sameUser) { // 또 쓴 글
                            domMsg += '<div class="bubble my_speech">';
                            domMsg += '<p>'+msgs[i].msg+'<span class="chat_time" style="display: none;">'
                            domMsg += msgs[i].msgtime+'</span></p></div>';
                        } else {
                            domMsg += '<em class="my_id">'+msgs[i].who+'</em>';
                            domMsg += '<div class="bubble my_speech">';
                            domMsg += '<p>'+msgs[i].msg+'<span class="chat_time">'
                            domMsg += msgs[i].msgtime+'</span></p></div>';
                        }
                        
                    } else if (msgs[i].who !== userId){ // 상대방이 쓴 글
                        if(msgs[i].sameUser) { // 또 쓴 글
                            domMsg += "";
                        } else {
                    
                        }
                    }
                    
                }

                /*
                <em class="my_id">testkcs</em>
                <div class="bubble my_speech">
                <p>111돔복구<span class="chat_time" style="display: none;">3:54 PM</span></p>
                </div>
                <div class="bubble my_speech">
                <p>222같은아이디<span class="chat_time">3:54 PM</span></p>
                </div><em class="other_id">tjdudwp02</em>
                <div class="bubble other_speech">
                <p>333다른아이디<span class="chat_time">3:54 PM</span></p>
                </div><em class="my_id">testkcs</em>
                <div class="bubble my_speech">
                <p>444다른아이디<span class="chat_time" style="display: none;">3:54 PM</span></p>
                </div>
                <div class="bubble my_speech">
                <p>555같은아이디<span class="chat_time">3:54 PM</span></p>
                </div>
                */

                emitTradeProcess();
            })
            .fail(function(xhr, status, error) {
                console.log("It is occured a error during chating messages.", error);
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
                console.log("It is occured a error during item infomation.", error);
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
                    alert("Please input a price only number.");
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

                    console.log(objOpt);
                    socket.emit("trade", objOpt);
                })
                .fail(function(xhr, status, error) {
                    console.log(error);
                    alert("It is occured a error during Start.");
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
                    alert("It is occured a error during Pay(Escrow).");
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
                    alert("It is occured a error during Deliver.");
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
                    alert("It is occured a error during Completed.");
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
                    console.log(json);
                    chatUI.setTradeInfo();
                    if(json.successYn === "Y") {
                        thisDom.setAttribute("disabled", "disabled");
                        //socket.emit("trade", { who: _userId, to: otherId, command: 5.1, buyerTag: that.buyerTag, sellerTag: that.sellerTag });
                        objOpt.command = 5.1;
                        socket.emit("trade", objOpt);
                        // document.getElementById("tradeStatus").value = "50";
                    } else {
                        alert(json.msg);
                    }
                })
                .fail(function(xhr, status, error) {
                    console.log(error);
                    alert("It is occured a error during Cancel Transaction.");
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
            if(confirm("Do you want to out?")){
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