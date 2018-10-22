let activeDice = 0
let game = {}
let isThisPlayer1 = false
let isThisPlayer2 = false
let sequence = 1

start()

// 在开始游戏的时候设置主要的变量
function start() {
    window.addEventListener('load', () => {
        socket = io()
        setListeners()
    })
}

// 设置监听器
// 1. 连接，发送socketid和address到server
// 2. server响应游戏数据
// 3. 当两者连接的时候，server发送玩家地址
function setListeners() { }

// 显示用户操作时更新的通知
function status(message) {
    document.querySelector('.status').innerHTML = message
    setTimeout(() => {
        document.querySelector('.status').innerHTML = ''
    }, 3e3)
}

function getGameBalance() {
    if (isThisPlayer1) return game.balancePlayer1
    else return game.balancePlayer2
}

function getOtherGameBalance() {
    if (isThisPlayer1) return game.balancePlayer2
    else return game.balancePlayer1
}

function getGameEscrow() {
    if (isThisPlayer1) return game.escrowPlayer1
    else return game.escrowPlayer2
}
// 在玩游戏时下注
async function placeBet(bet) {
    if (parseInt(bet) > parseInt(getGameBalance())) return status("You can't bet more than your current balance")
    if (parseInt(bet) > parseInt(getOtherGameBalance())) return status("You can't bet more than your opponent's current balance")
    if (parseInt(bet) > parseInt(getGameEscrow())) return status("You can't bet more than your escrow ")

    const nonce = Math.floor(Math.random() * 1e16)
    const hash = generateHash(nonce, activeDice, bet, getGameBalance(), sequence)
    const signedMessage = await signMessage(hash)

    let data = {
        signedMessage: signedMessage,
        nonce: nonce,
        call: activeDice,
        bet: bet,
        sequence: sequence,
        sender: web3.eth.defaultAccount
    }

    if (isThisPlayer1) {
        WebSocket.emit('signed-message-player-1', data)
    } else {
        WebSocket.emit('signed-message-player-2', data)
    }

    sequence++
}

// 使用玩家的游戏信息生成加密hash
function generateHash(noce, call, bet, balance, sequence) {
    const hash = '0x' + ethereumjs.ABI.soliditySHA3(
        ['uint256', 'uint256', 'uint256', 'uint256', 'uint256'],
        [String(nonce), String(call), String(bet), String(balance), String(sequence)]
    ).toString('hex')

    return hash
}

// 使用用户地址签名加密消息，以便从他那里得到确认
function signMessage(hash) { }

// 显示有关游戏的统计信息
function updateVisuallData() {
    document.querySelector('.game-info').innerHTML = `
        Contract: <b>${gameData.contractAddress}</b> <br/>
        You are: <b>${(isThisPlayer1) ? 'player 1' : 'player 2'}</b> <br/>
        Address player 1: <b>${game.addressPlayer1}</b> <br/>
        Address player 2: <b>${game.addressPlayer2}</b> <br/>
        Balance player 1: <b>${web3.fromWei(gameData.balancePlayer1)} ether</b> <br/>
        Balance player 2: <b>${web3.fromWei(gameData.balancePlayer2)} ether</b> <br/>
        Escrow player 1: <b>${web3.fromWei(gameData.escrowPlayer1)} ether</b> <br/>
        Escrow player 2: <b>${web3.fromWei(gameData.escrowPlayer2)} ether</b> <br/>
        Current game: <b>${gameData.sequence}</b>
    `
}

let game = {
    contractAddress: '',
    addressPlayer1: '',
    addressPlayer2: '',
    socketPlayer1: '',
    socketPlayer2: '',
    escrowPlayer1: '',
    escrowPlayer2: '',
    balancePlayer1: '',
    balancePlayer2: '',
    sequence: '',
    signedMessage1: '',
    signedMessage2: '',
    betPlayer1: '',
    betPlayer2: '',
    callPlayer1: '',
    callPlayer2: '',
    nonce1: '',
    nonce2: ''
}