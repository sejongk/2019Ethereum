var express    = require('express');
var mysql      = require('mysql');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Web3 = require('web3');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    port     : '3306',
    database : 'debate'
  });
//RESTful api

const url = 'http://localhost:9545';
const web3 = new Web3(new Web3.providers.HttpProvider(url));
const abi =[{"constant":false,"inputs":[{"internalType":"uint256","name":"_candIdx","type":"uint256"}],"name":"vote","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"_idx","type":"uint256"},{"internalType":"uint256","name":"_candIdx","type":"uint256"}],"name":"getCandidateString","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"killContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"retOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"string","name":"_subject","type":"string"}],"name":"newVote","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"_num","type":"uint256"}],"name":"buyToken","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"_num","type":"uint256"}],"name":"postUp","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"string","name":"_cand","type":"string"}],"name":"addCandidate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"remainTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"retIdx","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"_num","type":"uint256"}],"name":"didUpDown","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"_num","type":"uint256"}],"name":"postInfo","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"bytes32","name":"","type":"bytes32"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"_idx","type":"uint256"}],"name":"voteResult","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"_idx","type":"uint256"}],"name":"getNumOfCandidates","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"_idx","type":"uint256"},{"internalType":"uint256","name":"_candIdx","type":"uint256"}],"name":"getScore","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"_idx","type":"uint256"}],"name":"alreadyVoted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"_num","type":"uint256"},{"internalType":"address","name":"_writer","type":"address"},{"internalType":"string","name":"_contentHash","type":"string"},{"internalType":"uint256","name":"_time","type":"uint256"}],"name":"write","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"_idx","type":"uint256"}],"name":"retSub","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"_num","type":"uint256"}],"name":"postDown","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];
const addr = "0x4d3C0C1E0DC19F5A6e43b767a9aa09E806F076d1";
var fromParam = {};
fromParam.from = '0x2888E8904b1980b2629C65d1840DAca1Bb453ED0';//'0x05e6378d1d11F2d0E9f146d82f36676Ed37cd06D';////
const vc = new web3.eth.Contract(abi,addr);


// configuration ===============================================================
app.get('/', function(req, res){
  res.sendfile('./html/tabmenu.html');
});
var roomName = 'main';

io.on('connection', function(socket){
    console.log('a user connected');
    var instanceId = socket.id;
      socket.on('joinRoom',function (data) {
          console.log(data);
          socket.join(roomName);
      });

      socket.on('up', function (data) {
          console.log(data);
          var obj = {};
          obj.result = up(data.num);
          io.sockets.in(roomName).emit('result', obj);
      });

      socket.on('down', function (data) {
        console.log(data);
        var obj = {};
        obj.result = down(data.num);
        io.sockets.in(roomName).emit('result', obj);
    });

    socket.on('upload', function (data) {
        console.log(data);
        var obj = {};
        obj.result = upload(data.idx, data.content);
        io.sockets.in(roomName).emit('result', obj);
    });

    socket.on('download', function (data) {
        console.log(data);
        download(data.idx, data.result, data.pagenum, instanceId);

    });

    socket.on('cli_title', function (data) {
        console.log('title');
        vc.methods.retSub(data.idx).call(fromParam ,(err, subject) => {
            console.log(subject);
            io.to(instanceId).emit('ser_title', {result: subject});
        });
    });
    socket.on('cli_curInfo', function (data) {
        console.log('cli_curInfo');
        var _curIdx;
        var _title;
        var _candLength;
            vc.methods.retIdx().call(fromParam ,(err, __curIdx) => {
                _curIdx = __curIdx;
                vc.methods.retSub(_curIdx).call(fromParam ,(err, __curSub) => {
                    _title = __curSub;
                    vc.methods.getNumOfCandidates(_curIdx).call(fromParam ,(err, __candLength) => {
                        _candLength=__candLength;
                        if(_candLength)
                        io.to(instanceId).emit('ser_curInfo', {curIdx: _curIdx, title : _title, candLength : _candLength});
                    });
                });
        });
        console.log('cli_curInfo end');

    });
    socket.on('cli_candArr', function (data) { //콜백지옥 https://victorydntmd.tistory.com/48 콜백이란?
        console.log('cli_candArr');

        var idx = data.idx;
        var _result=new Array();
        vc.methods.retIdx().call(fromParam ,(err, _curIdx) => {
            if(idx>_curIdx)  io.to(instanceId).emit('ser_candArr', {err: true});
            else{
                vc.methods.getNumOfCandidates(idx).call(fromParam ,(err, _candLength) => {
                    var a=0;
                    var b=0;
                    for(var i=0;i < _candLength;i++ ){
                        var obj=new Object();
                        obj.num=i;
                        _result.push(obj);
                        vc.methods.getCandidateString(idx,i).call(fromParam ,(err, _candString) => {
                            _result[a].string = _candString;
                            a++;
                        });
                        vc.methods.getScore(idx,i).call(fromParam ,(err, _candScore) => {
                            _result[b].score=_candScore;
                            b++;
                            if(b==_candLength) io.to(instanceId).emit('ser_candArr', {result: _result});

                        });
                        
                    }
                });
            }
        });
        console.log('cli_candArr and');

    });
    socket.on('cli_board', function (data) {
        console.log('cli_board');

        var idx = data.idx;
        var result = data.result;
        var pagenum = data.pagenum;
        console.log(idx+"/"+result+"/"+pagenum );
        download(idx, result, pagenum, instanceId);
        console.log('board end');

    });
    socket.on('cli_boardUp', function (data) {
        console.log('cli_boardUp');
        up(data.num,instanceId);
    });
    socket.on('cli_boardDown', function (data) {
        console.log('cli_boardDown');
        down(data.num,instanceId);
    });
    socket.on('cli_boardPost', function (data) {
        console.log('cli_boardPost/'+data.idx+'/'+data.content);
        upload(data.idx ,data.content, instanceId);
    });   
    socket.on('cli_addCand', function (data) {
        console.log('cli_addCand/'+data.candString);
        vc.methods.addCandidate(data.candString).send(fromParam);
        io.to(instanceId).emit('ser_candRefresh', {});
    });   

  });

  function up(num,id){
    connection.query('SELECT * FROM debates WHERE num='+num, function(err, rows) {
        if(err || rows.length==0) return false;
        row= rows[0];
        vc.methods.didUpDown(num).call(fromParam ,(err, result) => {
            console.log(num+"투표했니?"+result);
            if(!result){
                var update_up = row.up+1;
                var query='UPDATE debates SET up ='+update_up+' WHERE num='+num;
                connection.query(query, function(err, rows) {
                    if(err) return false;
                    else{ //블록체인도 갱신
                        //vc.methods.postUp(num).send(fromParam);
                        io.to(id).emit('ser_boardRefresh', {});
                        return true;
                    }
                });
            }
        });
    
      });
}

function down(num, id){
    connection.query('SELECT * FROM debates WHERE num='+num, function(err, rows) {
        if(err) throw err;
        row= rows[0];
        vc.methods.didUpDown(num).call(fromParam ,(err, result) => {
            //console.log(result);
            if(!result){
                var update_down = row.down+1;
                var query='UPDATE debates SET down ='+update_down+' WHERE num='+num;
                connection.query(query, function(err, rows) {
                    if(err) throw err;
                    else{ //블록체인도 갱신
                        vc.methods.postDown(num).send(fromParam);
                        io.to(id).emit('ser_boardRefresh', {});
                        return true;
                    }
                });
            }
        });
    
    });
}


function download(idx, result, pagenum, id){
    var obj = new Object();
    obj.result= result;
    var query = 'SELECT * FROM debates WHERE idx='+idx +" AND result=" + result+" ORDER BY up DESC LIMIT "+(pagenum-1)*5+", 5"; 
    //  var query = 'SELECT * FROM debates WHERE idx=0'+" AND result=0 " +" ORDER BY up DESC LIMIT "+(3-1)*5+", 5";  
  
    connection.query(query, function(err, rows) {
      if(err) {
        console.log('err');  
        obj.arr = false;
      }
      else{
          //console.log(rows);
          obj.arr = rows;
      }

      io.to(id).emit('ser_board', obj);
      
      //socket.in(roomName).emit('serverSent',obj);
      //io.sockets.in(roomName).emit('serverSent', obj);
    });
}

function upload(idx, _content, id){
    vc.methods.alreadyVoted(idx).call((err, alreadyVote) =>{
        if(alreadyVote){
            vc.methods.voteResult(idx).call(fromParam,(err, _voteResult) =>{
                var query = 'INSERT INTO debates (idx, result, writer, content) VALUES ';
                var param = '("'+idx+'","'+_voteResult+'","'+fromParam.from+'","'+ _content+'")';
                connection.query(query+param, function(err, result) {
                    if(err) console.log(err);
                    else {
                        connection.query('select * from debates where num = '+result.insertId, function(err, rows) {
                        var timestamp = +rows[0].ts;
                        console.log(timestamp);
                        vc.methods.write(result.insertId, fromParam.from, _content, timestamp ).send(fromParam);
                        io.to(id).emit('ser_boardRefresh', {});
                        });
                    }
                  });
            
            });
          
        }
    });
}


/*
app.listen(3000, function () {
  console.log('Express server listening on port 3000' );
});
*/
http.listen(3000, function(){
    console.log('listening on *:3000');
  });

