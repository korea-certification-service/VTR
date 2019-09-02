var __langChat = {
    sendMsg_alert: "메세지를 입력해주세요.",
    item_status: ["거래안내", "거래요청", "구매확인", "판매완료", "거래완료", "거래취소", "대화중"],
    item_category: ["자산거래", "게임아이템", "OTC거래"],
    setTradeInfo_fail: "채팅방 정보를 가져오는 중에 에러 발생",
    getChatList_fail: "채팅 내용를 가져오는 중에 에러 발생",
    emitTradeProcess_fail: "초기 정보를 가져오는 중에 에러 발생",
    btnTransactionRequest_alert: "가격을 숫자로 입력해주세요.",
    btnTransactionRequest_fail: "구매 요청 중 에러가 발생하였습니다.",
    btnPurchaseConfirmation_fail: "구매 확인 중 에러가 발생하였습니다.",
    btnSalesComplete_fail: "판매 확인 중 에러가 발생하였습니다.",
    btnTransactionComplete_fail: "거래 완료 중 에러가 발생하였습니다.",
    btnCancelTransaction_fail: "거래 취소 중 에러가 발생하였습니다.",
    tempCloseMethod_confirm: "채팅방을 나가시겠습니까?",
};
var __langSocket = {
    fnSendMsg:{
        reg: /^@마하 /,
        command: "@마하 ",
        dom1: "거래 프로세스에 대해서 안내해드릴께요.<br>",
        dom2: function(originMsg){
            return originMsg +" 명령어는 존재하지 않습니다. 다시 확인하시고 입력해주세요.";
        }  
    },
    system_msg: {
        in: function(who){
            return who + " 님이 입장하셨습니다.";
        },
        out: function(who){
            return who + " 님이 퇴장하셨습니다.";
        }
    },
    eject: {
        alert: "동일한 아이디로 여러개 디바이스에 접속 하실수 없습니다. 모바일과 PC중 하나에서 거래를 진행해주세요."
    },
    trade_seller: {
        err_dom: function(msg){
            return "<em>" + msg + "</em> 명령어는 판매자가 실행할 수 없습니다.";
        },
        seller: {
            case1_dom: '판매자의 거래요청을 기다리는 중입니다.<br>잠시만 기다려주세요.',
            case1_1dom: function(price, ccCode){
                return '판매자가 <em>' + price + ccCode + '</em>의 가격으로 거래요청을 하였습니다.<br>거래를 진행하시려면 <em>@마하 구매확인</em>을 입력해주세요.';
            },
            case3_1dom: '판매자가 판매완료를 하였습니다.<br>거래가 정상적으로 끝났다면 <em>@마하 거래완료</em>를 입력해주세요.',
            case5_dom: '판매자가 거래취소를 요청 중입니다.<br>잠시만 기다려주세요.',
            case5_1dom: '판매자가 거래취소를 하였습니다.',
        },
        buyer: {
            case1_dom1: '거래를 시작하겠습니다.<br>먼저 거래 가격을 입력해주세요.<br>',
            case1_dom2: '거래요청',
            case1_dom3: '거래요청을 하시고 잠시만 기다려주세요.',
            case1_dom4: '이미 거래요청 상태입니다.',
            case1_1dom: '거래요청이 정상적으로 완료되었습니다.<br>구매자의 구매확인을 기다리는 중입니다.',
            case3_dom1: '반드시 물건을 보내신 후 판매완료를 눌러주세요.<br>택배로 보내셨다면 송장번호를 구매자에게 알려주세요.<br>',
            case3_dom2: '거래 취소를 원하시면 거래취소를 눌러주세요.',
            case3_dom3: '판매완료',
            case3_dom4: '거래취소', 
            case3_dom5: '판매완료를 할 수 있는 거래상태가 아닙니다.', 
            case3_1dom: '판매완료가 정상적으로 완료되었습니다.<br>구매자의 거래완료를 기다리는 중입니다.',
            case5_dom1: '취소할 거래가 아직 진행 되지 않았습니다.',
            case5_dom2: '거래완료 상태에서는 거래를 취소할 수 없습니다.',
            case5_dom3: '거래취소를 원하시면 아래 버튼을 눌러주세요.',
            case5_dom4: '거래취소',
            case5_1dom1: '거래 취소가 완료되었습니다.<br>',
            case5_1dom2: '거래를 초기화 하실려면 좌측 상단의 나가기 버튼을 눌러주세요.',
        }
    },
    trade_buyer: {
        err_dom: function(msg){
            return "<em>" + msg + "</em> 명령어는 구매자가 실행할 수 없습니다.";
        },
        seller: {
            case2_dom: '구매자의 구매확인을 기다리는 중입니다.<br>잠시만 기다려주세요.',
            case2_1dom: '구매자가 구매확인을 하였습니다.<br>물건을 구매자에게 송달 하셨다면 <em>@마하 판매완료</em>를 입력해주세요',
            case4_dom: '구매자의 거래완료를 기다리는 중입니다.',
            case4_1dom: '구매자가 거래완료를 눌렀습니다.<br>앞으로도 마켓마하와 함께 안전한 거래하세요.',
            case5_1dom1: '구매자가 거래취소를 하였습니다.<br>',
            case5_1dom2: '거래를 초기화 하실려면 좌측 상단의 나가기 버튼을 눌러주세요.',
        },
        buyer: {
            case2_dom1: function(vtrPrice){
                return '거래가격을 확인 해주세요.<br><em>' + vtrPrice + '</em> 가격으로 구매를 확정 하시려면 구매확인을 눌러주세요.<br>거래취소를 원하시면 거래취소를 눌러주세요.';
            },
            case2_dom2: '구매확인',
            case2_dom3: '거래취소',
            case2_dom4: '구매확인을 할 수 있는 거래상태가 아닙니다.',
            case2_1dom: '구매확인이 정상적으로 완료되었습니다.<br>판매자의 판매완료를 기다리는 중입니다.',
            case4_dom1: '물건은 잘 받으셨나요?<br>정상적으로 거래가 완료되었다면 거래완료를 눌러주세요.',
            case4_dom2: '거래완료',
            case4_dom3: '거래완료를 할 수 있는 거래상태가 아닙니다.',
            case4_1dom: '거래가 완료 되었습니다.<br>앞으로도 마켓마하와 함께 안전한 거래하세요.',
            case5_dom1: '취소할 거래가 아직 진행 되지 않았습니다.',
            case5_dom2: '구매자는 구매완료 상태에서는 거래를 취소할 수 없습니다.',
            case5_dom3: '구매자는 판매완료 상태에서는 거래를 취소할 수 없습니다.',
            case5_dom4: '거래완료 상태에서는 거래를 취소할 수 없습니다.',
            case5_dom5: '거래를 취소를 원하시면 아래 버튼을 눌러주세요.',
            case5_dom6: '거래취소',
            case5_1dom: '거래 취소가 완료되었습니다.',
        }
    },
} // end