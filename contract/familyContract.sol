// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;
import "@openzeppelin/contracts/utils/Strings.sol";
contract FamilyMemberContract{

    address public owner; 
    
    struct Member{
        string treeID;
        string memberID;
        address account;
        string name;
        string birthday;
        string phone;
        string disease;
    }

    string[] idArray;
    uint256 treecount = 0;
    uint256 memberCount = 0;

    constructor(){
        owner = msg.sender; // owner == deployer
    }

    mapping (string=>Member)  idToMemMap;  //memberID 對應 member data
    mapping (address=>string[]) addrToIDMap; // 帳號對應 memberID
    mapping(string => string)  child_to_father; //子memberID -> 父memberID
    mapping(address=>string) ownertotree; // address -> treeID
    mapping(string=>uint256[5])disease_in_tree ; //treeID -> disease total
    //mapping(string=>Member [] )member_in_tree; //treeID -> member
    mapping(string=>string[])treeIdToRequestMemList; //treeID -> requestArray
    

    modifier onlymanager(address _owner,string memory _treeID){
        require (compareStrings(ownertotree[_owner],_treeID),"not mangager");
        _;
    }

    // modifier onlyOwner(){
    //     require(owner == msg.sender, "Only owner");
    //     _;
    // }
    
    modifier onlyLicensee(string memory _memberID){
        require(idToMemMap[_memberID].account == msg.sender, "only licensee");
        _;
    }

    event Approval(address indexed _owner, address indexed _spender, string _memberID);
    event Request(address indexed _owner, string  _memberID, string  _treeID);
    event Join(address indexed _owner, string  _memberID, string  _treeID);
    event setchild(address indexed _owner,string _childID, string _fatherID);

    function createtree()public { 
        require(compareStrings(ownertotree[msg.sender],""),"You already create tree by this address!");
        require(addrToIDMap[msg.sender].length > 0, "You dont have member in this address!");
        ownertotree[msg.sender] = Strings.toString(treecount);
        request(addrToIDMap[msg.sender][0],Strings.toString(treecount));
        join(addrToIDMap[msg.sender][0],Strings.toString(treecount));//預設第一個mem是treeowner
        treecount++; //treeID
    }

    function checkSameFamily(string memory _memberID)private view returns(bool){
        if (addrToIDMap[msg.sender].length > 0 && !(compareStrings(idToMemMap[_memberID].treeID,""))) {
            for (uint256 index=0; index< addrToIDMap[msg.sender].length; index++){
                if(compareStrings(idToMemMap[_memberID].treeID, idToMemMap[addrToIDMap[msg.sender][index]].treeID)){
                    return true;
                }
            }
        }
        return false;
    }

    function setChildToFather(string memory _childID,string memory _fatherID)public onlyLicensee(_childID){
        require(!(compareStrings(idToMemMap[_fatherID].treeID,"")),"father's tree ID can not be null!");
        require(compareStrings(idToMemMap[_childID].treeID,idToMemMap[_fatherID].treeID),"treeID diffrent");
        child_to_father[_childID] = _fatherID;
        emit setchild(msg.sender ,_childID,_fatherID);
    } 

    // function getfather(string memory _childID)public view returns(string memory){
    //     return child_to_father[_childID];
    // }

    function request(string memory _memberID, string memory _treeID) public onlyLicensee(_memberID){
        require(isRegister(_memberID)==true, "memberID is not register");
        treeIdToRequestMemList[_treeID].push(_memberID);
        // requestArray.push(Member({treeID:_treeID, memberID:_memberID, account:msg.sender, name:idToMemMap[_memberID].name, birthday:idToMemMap[_memberID].birthday, phone:idToMemMap[_memberID].phone,disease:""}));
        emit Request(msg.sender, _memberID, _treeID);
    }

    function getFatherTree(string memory _childID) public view returns(string memory fatherId1, string memory fatherName1, string memory fatherId2, string memory fatherName2) {
        return (child_to_father[_childID], idToMemMap[child_to_father[_childID]].name, child_to_father[child_to_father[_childID]], idToMemMap[child_to_father[child_to_father[_childID]]].name);
    }

    function getRequestArray()public view returns (string[] memory requests){
        require(!(compareStrings(ownertotree[msg.sender],"")), "You are not tree owner");
        return treeIdToRequestMemList[ownertotree[msg.sender]];
    }

    function join(string memory _memberID, string memory _treeID) public onlymanager(msg.sender,_treeID){
        (bool find,) = check_if_request(_memberID, _treeID);
        if (find == false)
            return;
        //ownertotree[msg.sender];
        idToMemMap[_memberID].treeID = _treeID;
        if(compareStrings(idToMemMap[_memberID].disease,"none")==true){
            disease_in_tree[_treeID][0] ++;
        }
        else if(compareStrings(idToMemMap[_memberID].disease,"cancer")==true){
            disease_in_tree[_treeID][1] ++;
        }
        else if(compareStrings(idToMemMap[_memberID].disease,"cardiovascular disease")==true){
            disease_in_tree[_treeID][2] ++;
        }
        else if(compareStrings(idToMemMap[_memberID].disease,"chronic disease")==true){
            disease_in_tree[_treeID][3] ++;
        }
        else{ //none 
            disease_in_tree[_treeID][4] ++;
        }
        //member_in_tree[_treeID].push(idToMemMap[_memberID]);
        removeMemberInRequestArray(_memberID,_treeID);
        emit Join(msg.sender, _memberID, _treeID);
    }

    function getTreeDisease(string memory _treeID)public view returns(uint256[5] memory diseases){
        require(addrToIDMap[msg.sender].length > 0, "You dont have member in this address!");
        for(uint256 index=0; index < addrToIDMap[msg.sender].length; index++){
            if(compareStrings(idToMemMap[addrToIDMap[msg.sender][index]].treeID, _treeID)){
                return disease_in_tree[_treeID];
            }
        }
    }

    function removeMemberInRequestArray(string memory _memberID, string memory _treeID) private onlymanager(msg.sender,_treeID){
        (bool find, uint256 index) = check_if_request(_memberID, _treeID);
        if(find == true && index >=0){
            if(index > treeIdToRequestMemList[_treeID].length)
                revert("Index Error");

            for(uint256 i=index ; i < treeIdToRequestMemList[_treeID].length-1; i++){
                treeIdToRequestMemList[_treeID][i] = treeIdToRequestMemList[_treeID][i+1];
            }
            treeIdToRequestMemList[_treeID].pop();
        }
    }

    function check_if_request(string memory _memberID,string memory _treeID )view private returns(bool, uint256){
        for (uint256 i=0; i< treeIdToRequestMemList[_treeID].length; i++){ // use bool not -1 because uint256 no include -1 it must use int but num(int) == num(uint/2)
            if(compareStrings(treeIdToRequestMemList[_treeID][i], _memberID))
                return (true, i);
        }
        return (false, 0);
    }


    function isRegister(string memory _memberID)public view returns (bool){
        for(uint256 i=0 ; i < idArray.length; i++){
            if(compareStrings(idArray[i], _memberID)){
                return true;
            }
        }
        return false;
    }

    // function total() public view returns(uint256){
    //     uint256 num = 0;
    //     for(uint256 i=0 ; i < idArray.length; i++){
    //         num++;
    //     }
    //     return num;
    // }
    
    function create(string memory _name, string memory _birthday, string memory _phone, string memory _disease) public{ // string need memory , address(calldata) no need memory
        string memory _memberID = Strings.toString(memberCount);
        idToMemMap[_memberID] = Member({treeID:"", memberID:_memberID, account:msg.sender, name:_name, birthday:_birthday, phone:_phone,disease:_disease}); // default treeId = ""
        addrToIDMap[msg.sender].push(_memberID);// one address can control multiple member
        idArray.push(_memberID); // push id to idArray
        memberCount++;
    }
    
    function update(string memory _memberID, string memory _name, string memory _birthday, string memory _phone, string memory _disease) public onlyLicensee(_memberID)  {
        // require(isRegister(_memberID) == true, "Member hasn't been registered.");
        idToMemMap[_memberID] = Member({treeID:idToMemMap[_memberID].treeID, memberID:idToMemMap[_memberID].memberID, account:idToMemMap[_memberID].account, name:_name, birthday:_birthday, phone:_phone,disease:_disease});
    }

    function getMemberID(string memory _name, string memory _birthday, string memory _phone, string memory _disease) public view returns(string memory _memberID){
        for (uint256 i=0; i< memberCount; i++){ // use bool not -1 because uint256 no include -1 it must use int but num(int) == num(uint/2)
            if(compareStrings(idToMemMap[idArray[i]].name, _name) && compareStrings(idToMemMap[idArray[i]].birthday, _birthday) && compareStrings(idToMemMap[idArray[i]].phone, _phone) && compareStrings(idToMemMap[idArray[i]].disease, _disease)){
                return idArray[i];
            }
                
        }
        revert("memberID no found");
    }
    

    function selectByID(string memory _memberID)public view returns(string memory treeID,string memory memberID, string memory name, address account, string memory birthday, string memory phone, string memory disease){
        if(!(isRegister(_memberID))){
            revert("Member not found!!");
        }
        else if(idToMemMap[_memberID].account == msg.sender){//only licence
            return (idToMemMap[_memberID].treeID, idToMemMap[_memberID].memberID, idToMemMap[_memberID].name, idToMemMap[_memberID].account, idToMemMap[_memberID].birthday, idToMemMap[_memberID].phone, idToMemMap[_memberID].disease);
        }
        else if(checkSameFamily(_memberID)){ //in same family
             return (idToMemMap[_memberID].treeID, idToMemMap[_memberID].memberID, idToMemMap[_memberID].name, address(0), idToMemMap[_memberID].birthday, idToMemMap[_memberID].phone, "");    
        }
        else{
            return (idToMemMap[_memberID].treeID, idToMemMap[_memberID].memberID, idToMemMap[_memberID].name, address(0),"","","");
        }
    }
    
    
    function getMemberArrayByAddr()public view returns(string [] memory ){
        return addrToIDMap[msg.sender];
    }

    function approve(string memory _memberID, address _to)public onlyLicensee(_memberID){
        require(_to == address(_to), "invild address");
        require(msg.sender != _to, "same address"); // avoid same address approving
        idToMemMap[_memberID] = Member({treeID:idToMemMap[_memberID].treeID, memberID:_memberID, account:_to, name:idToMemMap[_memberID].name, birthday:idToMemMap[_memberID].birthday, phone:idToMemMap[_memberID].phone,disease:""});
        deleteIDinAddrToIDMap(_memberID);
        addrToIDMap[_to].push(_memberID);
        emit Approval(msg.sender, _to, _memberID);
    }

    function destory(string memory _memberID) public onlyLicensee(_memberID){
        require(isRegister(_memberID)==true, "memberID is not register");
        deleteIDinAddrToIDMap(_memberID); //delete acount's mapping
        delete idToMemMap[_memberID]; 
        delete child_to_father[_memberID];
        (bool find, uint256 index) = getIndexById(_memberID);
        if(find){
            deleteIdByIndex(index);
        }
    }

    function deleteIDinAddrToIDMap(string memory _memberID) private {
        for (uint256 index=0; index< addrToIDMap[msg.sender].length; index++){ // use bool not -1 because uint256 no include -1 it must use int but num(int) == num(uint/2)
            if(compareStrings(addrToIDMap[msg.sender][index], _memberID)){// if found do Remove()
                for(uint256 i=index ; i < addrToIDMap[msg.sender].length-1; i++){
                    addrToIDMap[msg.sender][i] = addrToIDMap[msg.sender][i+1];
                }
                addrToIDMap[msg.sender].pop();
                return;
            }
        }
    }

    function deleteIdByIndex(uint256 index) private {
        if(index > idArray.length)
        revert("Index Error");

        for(uint256 i=index ; i < idArray.length-1; i++){
            idArray[i] = idArray[i+1];
        }
        idArray.pop();
    }

    function getIndexById(string memory _memberID) private view returns (bool find, uint256 index){ //private or internal
        for (uint256 i=0; i< idArray.length; i++){ // use bool not -1 because uint256 no include -1 it must use int but num(int) == num(uint/2)
            if(compareStrings(idArray[i], _memberID))
                return (true, i);
        }
        return (false, 0);
    }

    function compareStrings(string memory a, string memory b) public pure returns (bool) {
        return (keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b))); //雜湊
    }
}