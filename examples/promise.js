//references
//https://m.blog.naver.com/azure0777/221027252555
//https://joshua1988.github.io/web-development/javascript/js-async-await/
//https://joshua1988.github.io/web-development/javascript/javascript-asynchronous-operation/

//프로미스의 기본 형태
function 함수명(파라메터){
    return new Promise(function(resolve, reject){ 
      //할일
    });
  }
//할일 = 비동기 함수, resolve,reject = 콜백함수
//resolve는 promise객체일 수도 , 그냥 일반 함수일 수도 있다.
//then으로 계속 엮기 위해서는 Promise객체여야 할것이다. 일반 함수인 경우 resolve가 실행되고 종료될 것이다.

//예제
function myPromise(value){
    return new Promise(function(resolve, reject){
        console.log("3초 후 인사메세지를 출력합니다..");
        setTimeout(function(){    
        if(value){
            console.log("안녕하세요!");
            resolve("성공");
        }
        else {
            reject(Error("실패"));
        }
        }, 3000);
    });
}

function myResolve(value){
  console.log("resolved: ", value);
} 

function myReject(value){
  console.log("rejected: ", value);
}
//1.
myPromise(true).then(myResolve,myReject); // myResolve 실행
myPromise(false).then(myResolve,myReject); // myReject 실행
//2.
myPromise(true)
.then(myPromise)
.then(myPromise)
.then(myResolve)
.catch(myReject);
//then 부분에 파라미터로 resolve만 들어가고 reject가 없다. 대신 catch에 reject가 들어감, 어디에서 reject가 나든 catch로 가 reject실행


//적용
    //이전
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
    //Promise 적용

    function _retIdx(){
        return new Promise(function(resolve, reject){
            vc.methods.retIdx().call(fromParam ,(err, _curIdx) => {
                resolve(_curIdx);
            });    
        });
    }

    function _retSub(_curIdx){
        return new Promise(function(resolve, reject){
            vc.methods.retSub(_curIdx).call(fromParam ,(err, _curSub) => {
                resolve(_curIdx, _curSub);
            });
        });
    }

    function _getNumOfCand(_curIdx, _curSub){
        return new Promise(function(resolve, reject){
            vc.methods.getNumOfCandidates(_curIdx).call(fromParam ,(err, _candLength) => {
                if(_candLength)
                    io.to(instanceId).emit('ser_curInfo', {curIdx: _curIdx, title : _curSub, candLength : _candLength});
            });
        });
    }

    _retIdx()
    .then(_retSub)
    .then(_getNumOfCand);
    