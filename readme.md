# eosio sample project

node app.js
http://localhost:3000/

## How to use
https://github.com/EOSIO/eosjs/tree/v16.0.9

## Own PC
MacBook Pro macOS High Sierra v10.13.6

## Make dir
```
mkdir eos
cd eos
```

## Docker Image Pull
```
docker pull eosio/eos
 
Using default tag: latest
latest: Pulling from eosio/eos
6b98dfc16071: Pull complete 
4001a1209541: Pull complete 
6319fc68c576: Pull complete 
b24603670dc3: Pull complete 
97f170c87c6f: Pull complete 
ca8277dae3e4: Pull complete 
49bdd58b12e0: Pull complete 
5896b4da3447: Pull complete 
bf8386c62bcb: Pull complete 
cd61f928e299: Pull complete 
9c02fa6a4b63: Pull complete 
1f2e1679c160: Pull complete 
Digest: sha256:ab8ba16ee8308316e570b79da3beaf0d60975633afb1a4b9bc0eb4506e1ee6ee
Status: Downloaded newer image for eosio/eos:latest
```

## npm install
```
npm init
npm install --save ejs
npm install --save eosjs
npm install --save express
npm install --save basic-auth-connect
```

## Docker Container Run
```
docker run --name eosio \
  --publish 7777:7777 \
  --publish 127.0.0.1:5555:5555 \
  --volume /tmp/work:/work \
  --volume /tmp/eosio/data:/mnt/dev/data \
  --volume /tmp/eosio/config:/mnt/dev/config \
  --detach \
  eosio/eos-dev \
  /bin/bash -c \
  "keosd --http-server-address=0.0.0.0:5555 & exec nodeos -e -p eosio --plugin eosio::producer_plugin --plugin eosio::history_plugin --plugin eosio::chain_api_plugin --plugin eosio::history_plugin --plugin eosio::history_api_plugin --plugin eosio::http_plugin -d /mnt/dev/data --config-dir /mnt/dev/config --http-server-address=0.0.0.0:7777 --access-control-allow-origin=* --contracts-console --http-validate-host=false --filter-on='*'"
```
※If you already have '/tmp/eosio', it may not work properly.
In that case, change to an alias name, delete it, or change the command.

## Set Alias
```
alias cleos='docker exec -it eosio /opt/eosio/bin/cleos --url http://127.0.0.1:7777 --wallet-url http://127.0.0.1:5555'
```

## Create Wallet & Key pairs
`ex)cleos wallet create -n wallet-name --to-console`
```
cleos wallet create -n nobkov --to-console
  Creating wallet: nobkov
  Save password to use in the future to unlock this wallet.
  Without password imported keys will not be retrievable.
  "PW5~~"
```

`ex)cleos create key --to-console`
```
cleos create key --to-console
  Private key: 5KS~~
  Public key: EOS5~~
```

`ex)cleos wallet import -n your-wallet-name --private-key your-prikey`
```
cleos wallet import -n nobkov --private-key 5KS~~
  imported private key for: EOS5~~
```

## Wallet Open & Unlock
`ex)cleos wallet open -n your-wallet-name`
```
cleos wallet open -n nobkov
```

`ex)cleos wallet unlock -n your-wallet-name`
```
cleos wallet unlock -n nobkov
※your password
```

## Import EOSIO-user
```
cleos wallet import --private-key 5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3 -n nobkov
  imported private key for: EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV  
```

## Create Account
※同じアカウント名は使えないし、削除できない  
`ex)cleos create account eosio create-account-name your-pubkey`

```
cleos create account eosio user1 EOS5~~
cleos create account eosio user2 EOS5~~
```


## Confirm accounts
`ex)cleos get accounts your-pubkey`
```
cleos get accounts EOS5~~
```

## Deploy Smartcontract
コントラクト用のアカウント作成。  
このアカウントを通じて、コントラクトが実行される。  
`ex)cleos create account eosio token your-pubkey`
```
cleos create account eosio token EOS5~~
```
```
docker ps
 CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                                              NAMES
 fe4299d73b3d        eosio/eos-dev       "/bin/bash -c 'keosd…"   11 days ago         Up About an hour    127.0.0.1:5555->5555/tcp, 0.0.0.0:7777->7777/tcp   eosio

docker exec -it f bash
cp /opt/eosio/contracts/eosio.token/eosio.token.wasm /eos/contracts/eosio.token/
ls -l /eos/contracts/eosio.token/
 total 36
 -rw-r--r-- 1 root root   271 Nov 30 20:24 CMakeLists.txt
 -rw-r--r-- 1 root root  1766 Nov 30 20:24 eosio.token.abi
 -rw-r--r-- 1 root root  3789 Nov 30 20:24 eosio.token.cpp
 -rw-r--r-- 1 root root  2120 Nov 30 20:24 eosio.token.hpp
 -rw-r--r-- 1 root root 18965 Jan 21 07:27 eosio.token.wasm
exit
```
```
cleos set contract token /eos/contracts/eosio.token/ -p token@active
```

## Create & Issue Token
`ex)cleos push action token create '[ "eosio", "Maximum-quantity symbol-name"]' -p token@active`
```
cleos push action token create '[ "eosio", "1000000000.0 SYS"]' -p token@active
```

`ex)cleos push action token issue '[ "account-name", "quantity symbol", "memo" ]' -p eosio@active`
```
cleos push action token issue '[ "user1", "1000.0 SYS", "it is memo." ]' -p eosio@active
```

## Confirm Token
`ex)cleos get currency balance token account-name symbol`
```
cleos get currency balance token user1 SYS
```

## Transfer token
`ex)cleos push action token transfer '[ "From:account-name", "To:account-name", "quantity symbol", "memo" ]' -p From:account-name@active`
```
cleos push action token transfer '[ "user1", "user2", "0.1 SYS", "user1 sends 0.1SYS to user2." ]' -p user1@active
```

