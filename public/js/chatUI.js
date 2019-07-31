

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
        iptChat.addEventListener("keypress", function(ev){
            if (ev.which == 13) {
                if (ev.target.value==="") {
                    alert("메세지를 입력해주세요.");
                    return;
                }
                fnSendMsg();
            }
        });
        document.getElementById("btnSend").addEventListener("click", function(ev){
            if (ev.target.previousSibling.previousSibling.value==="") {
                alert("메세지를 입력해주세요.");
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
            
            console.log(item);
            document.getElementById("tradePrice").value = item.price;
            document.getElementById("tradeStatus").value = item.status;

            switch (item.status) {
                case 1:
                    statusText = "거래요청";
                    break;
                case 2:
                    statusText = "구매확인";
                    break;
                case 3:
                    statusText = "판매완료";
                    break;
                case 4:
                    statusText = "거래완료";                    
                    break;
                default:
                    statusText = "대화중";
                    break;
            }
            document.getElementById("statusText").innerText = statusText;
    
            switch (item.category) {
                case "etc":
                    categoryText = "자산거래";
                    break;
                case "game":
                    categoryText = "게임아이템";
                    break;
                case "otc":
                    categoryText = "OTC거래";
                    break;
            }
            document.getElementById("vtrCategory").innerText = categoryText;
            document.getElementById("vtrTitle").innerText = item.title;
            document.getElementById("vtrPriceNum").innerText = item.price;

        })
        .fail(function(xhr, status, error) {
            console.log("채팅방 정보를 가져오는 중에 에러 발생", error);
        });
    },
    loadLastStatus: function() {
        var itemId = this.itemId;
        var APIServer = document.getElementById("APIServer").value;
        var that = this;
        $.ajax({
            url: APIServer + "/v2/items/" + itemId,
            headers: {"token": document.getElementById("tk").value},
            type: "GET",
            contentType: "application/json; charset=utf-8",
        })
        .done(function(result) {
            var item = result.data;
            var objOpt = { who: _userId, to: that.otherId, buyerTag: that.buyerTag, sellerTag: that.sellerTag };
            console.log(item);
            
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
            console.log("초기 정보를 가져오는 중에 에러 발생", error);
        });
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
                var ccCode = "MACH";
                if(tradePrice === 0 || isNaN(tradePrice)) {
                    alert("가격을 입력해주세요.");
                    ipt_price[ipt_price.length-1].focus();
                    return;
                } 
                // IE에서 disabled여도 클릭이 되는 이슈
                if(thisDom.getAttribute("disabled") === "disabled") return;

                var bodyParam = {};
                bodyParam.itemId = itemId;
                bodyParam.stepValue = "1";
                bodyParam.reqValue = {
            		buyerTag: that.buyerTag,
                    sellerTag: that.sellerTag,
                    cryptoCurrencyCode: ccCode,
                    price: tradePrice,
                    //country: that.country,
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
                    alert("구매 요청 중 에러가 발생하였습니다.");
                })                
            },        
            "btnPurchaseConfirmation": function() {
                var thisDom = this;
                // IE에서 disabled여도 클릭이 되는 이슈
                if(thisDom.getAttribute("disabled") === "disabled") return;

                var bodyParam = {};
                bodyParam.itemId = itemId;
                bodyParam.stepValue = "2";

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
                    alert("구매 확인 중 에러가 발생하였습니다.");
                });
            },
            "btnSalesComplete": function() {
                var thisDom = this;
                // IE에서 disabled여도 클릭이 되는 이슈
                if(thisDom.getAttribute("disabled") === "disabled") return; 

                var bodyParam = {};
                bodyParam.itemId = itemId;
                bodyParam.stepValue = "3";

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
                    alert("판매 확인 중 에러가 발생하였습니다.");
                });               
            },
            "btnTransactionComplete": function() {
                var thisDom = this;
                // IE에서 disabled여도 클릭이 되는 이슈
                if(thisDom.getAttribute("disabled") === "disabled") return; 

                var bodyParam = {};
                bodyParam.itemId = itemId;
                bodyParam.stepValue = "4";

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
                    alert("거래 완료 중 에러가 발생하였습니다.");
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
                    reqUserTag: _userId
                }

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
                    alert("거래 취소 중 에러가 발생하였습니다.");
                });
            },
        };

        document.addEventListener("click", function(e) {
            var target = e.target || e.srcElement;
            if(proxyEvent.hasOwnProperty(target.id)) {
                proxyEvent[target.id].call(target);
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