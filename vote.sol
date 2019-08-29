pragma solidity ^0.5.11;

contract voteContract {
    uint idx;//vote index
    mapping (uint => string) subject;
    uint deadline;
    
    //토큰을 소모하여 새로운 투표를 게시할 수 있음
    mapping (address => uint) token;
    
    //투표 정보 저장
    mapping (uint => mapping (address => bool)) isVote; 
    mapping (uint => mapping (address => uint)) result; 
    mapping (uint => mapping (uint => uint)) candScore; 
    mapping (uint => mapping (uint => string)) candString; 
    mapping (uint => uint) numberOfCandidates;
    
    //게시판 정보 저장
    mapping(uint => address) writer;
    mapping(uint => bytes32) contentHash;
    mapping(uint => address[]) up;
    mapping(uint => address[]) down;
    mapping(uint => uint) time;
    
    address contractOwner;

    constructor() public {
        contractOwner = msg.sender;
        idx = 0;
    }
    
    function newVote(string memory _subject) public{
        require(token[msg.sender] >= 1);
        require(deadline < now);
        
        idx++;
        subject[idx] = _subject;
        deadline = now + 1 days;
        token[msg.sender]--;
    }


    function addCandidate(string memory _cand) public {
        require(msg.sender == contractOwner);
        bool add = true;
        for (uint i = 0; i < numberOfCandidates[idx]; i++) {
            if(keccak256(bytes(candString[idx][i])) == keccak256(bytes(_cand))){
                add = false; break;
            }
        }

        if(add) {
            candString[idx][numberOfCandidates[idx]] = _cand;
            numberOfCandidates[idx]++;
        }
    }

  
    function vote(uint _candIdx) public {
        require(!isVote[idx][msg.sender]);
        isVote[idx][msg.sender] = true;
        candScore[idx][_candIdx]++;
        result[idx][msg.sender]++;
    }
    
    function buyToken(uint _num) public payable{
      //  require(msg.value >= 1 ether);
        token[msg.sender] = token[msg.sender]+_num;
    }
    
    function write(uint _num, address _writer, string memory _contentHash, uint _time) public{
        writer[_num] = _writer;
        contentHash[_num] = keccak256(bytes(_contentHash));
        time[_num] = _time;
        up[_num].push(msg.sender); //who write the post can not up or down
        down[_num].push(msg.sender);
    }
    
    function postInfo(uint _num) public view returns(address, bytes32, uint , uint, uint){
        return (writer[_num],contentHash[_num],up[_num].length,down[_num].length,time[_num]);
    }
    
    function postUp(uint _num) public{
        for(uint i=0;i<up[_num].length;i++){
            require(up[_num][i] != msg.sender);
        }
        up[_num].push(msg.sender);
    }
    function postDown(uint _num) public{
        for(uint i=0;i<down[_num].length;i++){
            require(down[_num][i] != msg.sender);
        }
        down[_num].push(msg.sender);
    }
    
    function didUpDown(uint _num) public view returns(bool){
        if(up[_num].length == 0) return false;
        if(down[_num].length == 0)return false;
        for(uint i=0;i<up[_num].length;i++){
            if(up[_num][i] == msg.sender) return true;
        }
        for(uint i=0;i<down[_num].length;i++){
            if(down[_num][i] == msg.sender) return true;
        }
        return false;
    }

    function alreadyVoted(uint _idx) public view returns(bool) {
        require(_idx<=idx);
        if(isVote[_idx][msg.sender])
            return true;
        else
            return false;
    }

    function getNumOfCandidates(uint _idx) public view returns(uint) {
        require(_idx<=idx);
        return numberOfCandidates[_idx];
    }

    function getCandidateString(uint _idx, uint _candIdx) public view returns(string memory) {
        return candString[_idx][_candIdx];
    }

    function getScore(uint _idx, uint _candIdx) public view returns(uint) {
        return candScore[_idx][_candIdx];
    }
    function remainTime() public view returns(uint){
        if((deadline - now) > 0){
            return deadline - now;
        }
        else{
            return 0;
        }
    }
    function retOwner() public view returns(address){
        return contractOwner;
    }
    function retIdx() public view returns(uint){
        return idx;
    }
    function retSub(uint _idx) public view returns(string memory){
        return subject[_idx];
    }
    function voteResult(uint _idx) public view returns(uint){
        return result[_idx][msg.sender];
    }
    function killContract() public {
        require(contractOwner == msg.sender);
        selfdestruct(msg.sender);
    }
}