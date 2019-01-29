const express = require('express')
const ejs = require('ejs')
const app = express()
const Eos = require('eosjs');
const basicAuth = require('basic-auth-connect')

// ======================
// httpEndpoint
const httpEndpoint = "http://localhost:7777"
// 公開鍵
const actPubKey = "your pubkey"
// 秘密鍵
const actPriKey = "your prikey"
// ChainId
const chainId = "your chain id"
// token symbol
const symbol = 'your symbol'
// ----------------------
// Basic Auth user
const baUser = 'hoge'
// Basic Auth password
const baPass = 'foo'
// ======================

const config = {
  chainId: chainId,
  keyProvider: actPriKey,
  httpEndpoint: httpEndpoint,
  expireInSeconds: 60,
  broadcast: true,
  sign: true,
  debug: true
}

const eos = Eos(config);

// postを使用するための設定
app.use(express.json());
app.use(express.urlencoded());

// Basic認証の設定
// userIdとpasswordは適当に設定する
// ハードコーディングバンザイ
app.all('/*',basicAuth(function(user,password){
  return user === baUser && password === baPass;
}))

// 第1引数: レンダリング対象の拡張子
// 第2引数: レンダリング用の関数
app.engine('ejs', ejs.renderFile)

// ブロック情報を取得する
async function getBlock(info){
  var obj = new Object()
  obj.info = info
  obj.block = await eos.getBlock(info.last_irreversible_block_num)
  return obj
}

app.get('/', (request, response) => {
  eos.getInfo({
    // nothing
  }).then(info => {
    return getBlock(info)
  }).then(obj => {
    response.render('index.ejs', {
      title: 'Express + EJS',
      info: obj.info,
      block: obj.block
    })
  }).catch(e => {
    console.log('=== error ===');
    console.log(e);
    response.render('index.ejs', {
      title: 'Express + EJS',
      info: '',
      block: ''
    })
  })
})

app.get('/accounts', (request, response) => {
  getAccounts().then(function(result) {
    return String(result.account_names).split(",")
  }).then(function(result) {
    response.render('account.ejs', {
      title: 'Express + EJS',
      name: "",
      token: "",
      accounts: result
    })
  }).catch(function(err) {
    console.log(err);
  })
})

app.get('/create', (request, response) => {
  response.render('create.ejs', {
    title: 'Express + EJS'
  })
})

app.post('/create/account', (request, response) => {
  var name = request.body.name

  eos.transaction(tr => {
    // コンストラクタの実行権限（eosio.code）が必要
    tr.newaccount({
      creator: 'token',
      name: name,
      owner: actPubKey,
      active: actPubKey
    })

    tr.buyrambytes({
      payer: 'token',
      receiver: name,
      bytes: 5000
    })

    tr.delegatebw({
      from: 'token',
      receiver: name,
      stake_net_quantity: '10.0 '+symbol,
      stake_cpu_quantity: '10.0 '+symbol,
      transfer: 1
    })
  }).then(function() {
    response.render('create.ejs', {
      title: 'Create Account Done!!'
    })
  }).catch(function(e) {
    response.render('create.ejs', {
      title: 'Create Account Done!!'
    })
  })
})

app.get('/token/:name', (request, response) => {
  var name = request.params.name
  // code,account,symbol
  eos.getCurrencyBalance('token', name, symbol, (error, result) => {
    response.render('account.ejs', {
      title: 'Express + EJS',
      name: name,
      token: result,
      accounts: ""
    })
  })
})

app.post('/transfer', (request, response) => {
  var from = request.body.from
  var to = request.body.to
  var coin = request.body.token + " " + symbol
  var memo = request.body.memo

  eos.transaction('token', token => {
    token.transfer(from, to, coin, memo)
    response.render('account.ejs', {
      title: 'Transfer Done!!',
      name: "",
      token: "",
      accounts: ""
    })
  }).catch(e => {
    console.log(e);
  })
})

app.get('/history/:name', (request, response) => {
  var name = request.params.name
  eos.getActions(name, (error, result) => {
    var act = result.actions
    response.render('history.ejs', {
      title: 'Express + EJS',
      content: act
    })
  })
})

var getAccounts = function() {
  return new Promise(function(resolve, reject) {
    eos.getKeyAccounts(actPubKey, (err, res) => {
      err ? reject(err) : resolve(res);
    })
  })
}


app.listen(3000)
