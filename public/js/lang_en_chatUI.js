var __langChat = {
    sendMsg_alert: "Please input the message.",
    item_status: ["VTR Guide", "Start", "Pay(Escrow)", "Deliver", "Completed", "Cancel", "Talking"],
    item_category: ["Asset", "Game Item", "OTC"],
    setTradeInfo_fail: "It is occured a error(don't get a VTR info)",
    getChatList_fail: "It is occured a error.(don't get a chat info)",
    emitTradeProcess_fail: "It is occured a error.(don't get a item infomation)",
    btnTransactionRequest_alert: "Please input a price only number.",
    btnTransactionRequest_fail: "It is occured a error.(state: Start)",
    btnPurchaseConfirmation_fail: "It is occured a error.(state: Pay(Escrow))",
    btnSalesComplete_fail: "It is occured a error.(state: Deliver)",
    btnTransactionComplete_fail: "It is occured a error.(state: Completed)",
    btnCancelTransaction_fail: "It is occured a error.(state: Cancel)",
    tempCloseMethod_confirm: "Do you want to out?",
};
var __langSocket = {
    fnSendMsg:{
        reg: /^@MACH /i,
        command: "@MACH ",
        dom1: 'Let me tell you about trading process.<br>',
        dom2: function(originMsg){
            return originMsg +" The command does not exist. Please check again and enter.";
        }  
    },
    system_msg: {
        in: function(who){
            return who + " has joined.";
        },
        out: function(who){
            return who + " has left.";
        }
    },
    eject: {
        alert: "동일한 아이디로 여러개 디바이스에 접속 하실수 없습니다. 모바일과 PC중 하나에서 거래를 진행해주세요."
    },
    trade_seller: {
        err_dom: function(msg){
            return "The command <em>" + msg + "</em> cannot be executed by the seller.";
        },
        buyer: {
            case1_dom: 'Waiting for the seller\'s Start.<br>Please wait.',
            case1_1dom: function(price, ccCode){
                return 'The seller requested trading with a price of <em>' + price + ccCode + '</em>.<br>Click on the <em>@Mach Pay(Escrow)</em> to proceed with trading.';
            },
            case3_1dom: 'The seller has completed the sale.<br>If trading is completed, click on the <em>@MACH Completed.</em>',
            case5_dom: 'The seller is requesting a cancellation.<br> Please wait.',
            case5_1dom: 'The seller has canceled trading.',
        },
        seller: {
            case1_dom1: 'You will start trading. <br> Please enter trading price first.<br>',
            case1_dom2: 'Start',
            case1_dom3: 'After fix the price, click Start button', //'Please request trading and wait a moment.',
            case1_dom4: 'You are already in a Start status.',
            case1_1dom: 'Your Start has been successfully completed. <br> Waiting for buyer to confirm purchase.',
            case3_dom1: 'Be sure to send the item and press Deliver. <br> If you sent it by courier, please inform the buyer of the invoice number.<br>',
            case3_dom2: 'If you want to cancel trading, please click Cancel.',
            case3_dom3: 'Deliver',
            case3_dom4: 'Cancel',
            case3_dom5: 'You are not in trading that can be completed.', 
            case3_1dom: 'Sale completed successfully. <br> Waiting for buyer to complete trading.',
            case5_dom1: 'Trading cancellation has not yet been processed.',
            case5_dom2: 'You can not cancel trading while it\'s closed.',
            case5_dom3: 'Press the button below to cancel trading.',
            case5_dom4: 'Cancel',
            case5_1dom1: 'It is successfully completed trading cancellation.<br>',
            case5_1dom2: 'If you want to reset trading, click exit icon on the left top.',
        }
    },
    trade_buyer: {
        err_dom: function(msg){
            return "The <em>" + msg + "</em> command can not be executed by the buyer.";
        },
        seller: {
            case2_dom: 'Waiting for buyer to confirm purchase. <br> Please wait.',
            case2_1dom: 'The buyer has confirmed the purchase. <br> If you have delivered the item to the buyer, click on the <em>@MACH Deliver</em>.',
            case4_dom: 'Waiting for buyer to complete trading.',
            case4_1dom: 'The buyer has completed trading.<br> Make trading safety with Market Mach in the future.',
            case5_1dom1: 'The buyer has canceled trading.',
            case5_1dom2: 'If you want to reset trading, click exit icon on the left top.',
        },
        buyer: {
            case2_dom1: function(vtrPrice){
                return 'Please confirm trading price.<br>The <em>' + vtrPrice + '</em> confirm the purchase at the price, press Confirm Purchase. <br> If you want to cancel trading, click Cancel.';
            },
            case2_dom2: 'Pay(Escrow)',
            case2_dom3: 'Cancel',
            case2_dom4:  'This is not trading state where you can confirm your purchase.',
            case2_1dom: 'Pay(Escrow) completed successfully. <br> Waiting for the seller to complete the sale.',
            case4_dom1: 'Did you receive the goods well? <br> If trading is completed, click on the <em>@MACH Completed</em>.',
            case4_dom2: 'Completed',
            case4_dom3: 'It is not a condition to complete trading.',
            case4_1dom: 'Your trading has been completed.<br> Make trading safety with Market Mach in the future.',
            case5_dom1: 'Trading cancellation has not yet been processed.',
            case5_dom2: 'The buyer can not cancel trading while it is in complete purchase.',
            case5_dom3: 'The buyer can not cancel trading when the sale is complete.',
            case5_dom4: 'You can not cancel trading while it is closed.',
            case5_dom5: 'If you want to cancel trading, please press the button below.',
            case5_dom6: 'Cancel',
            case5_1dom1: 'It is successfully completed trading cancellation.<br>',
            case5_1dom2: 'If you want to reset trading, click exit icon on the left top.',
        }
    },
} // end