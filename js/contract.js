import familyContract from "../abi/familyContract.json" assert { type: 'json' };

var myWeb3;
var myContract;

const web3Init = () => {
    myWeb3 = new Web3(window.ethereum);
    connectContract();
}

const connectContract = () => {
    myContract = new myWeb3.eth.Contract(familyContract, "0x94016a4bdaa2abe46a04b6436a9d3fcaa4b4a9fd");
}

const createMember = async (name, birthdate, phone, disease) => {
    await myContract.methods.create(name, birthdate, phone, disease).send({ from: myWeb3.eth.defaultAccount });
}

const updateWeb3Account = async (account) => {
    myWeb3.eth.defaultAccount = account;
    $("#connect-account").text(`Connected Account: ${ myWeb3.eth.defaultAccount }`);
    $("#connect-button").val("Connected");
}

const updateMember = async (memberId, name, birthdate, phone, disease) => {
    await myContract.methods.update(memberId, name, birthdate, phone, disease).send({ from: myWeb3.eth.defaultAccount });
}

const createTree = async () => {
    await myContract.methods.createtree().send({ from: myWeb3.eth.defaultAccount });
}

const request = async (memberId, treeId) => {
    await myContract.methods.request(memberId, treeId).send({ from: myWeb3.eth.defaultAccount });
}

const setFather = async (chlidId, fatherId) => {
    await myContract.methods.setChildToFather(chlidId, fatherId).send({ from: myWeb3.eth.defaultAccount });
}

const selectById = async (memberId) => {
    const memberData = await myContract.methods.selectByID(memberId).call({ from: myWeb3.eth.defaultAccount });
    const {0: memberTreeId, 1: memberMemberId, 2: memberName, 3: memberAccount, 4: memberBirthday, 5: memberPhone, 6: memberDisease} = memberData;
    var data = [];
    data.push(memberTreeId, memberMemberId, memberName, memberAccount, memberBirthday, memberPhone, memberDisease);
    return data;
}

const getmemberId = async () => {
    const memberIds = await myContract.methods.getMemberArrayByAddr().call({ from: myWeb3.eth.defaultAccount });
    return memberIds;
}

const getRequestArray = async () => {
    const requestArray = await myContract.methods.getRequestArray().call({ from: myWeb3.eth.defaultAccount });
    return requestArray;
}

const join = async (memberId, treeId) => {
    await myContract.methods.join(memberId, treeId).send({ from: myWeb3.eth.defaultAccount });
}

const approve = async (memberId, to) => {
    await myContract.methods.approve(memberId, to).send({ from: myWeb3.eth.defaultAccount });
}

const destory = async (memberId) => {
    await myContract.methods.destory(memberId).send({ from: myWeb3.eth.defaultAccount });
}

const getFatherTree = async (memberId) => {
    const fatherTree = await myContract.methods.getFatherTree(memberId).call({ from: myWeb3.eth.defaultAccount });
    const { 0: a, 1: b, 2: c, 3: d } = fatherTree;
    var data = []
    data.push(a, b, c, d);
    return data;
}

const getTreeDisease = async (memberId) => {
    const memberData = await selectById(memberId);
    const treeDisease = await myContract.methods.getTreeDisease(memberData[0]).call({ from: myWeb3.eth.defaultAccount });
    const { 0: a, 1: b, 2: c, 3: d, 4: e } = treeDisease;
    var data = [];
    data.push(a, b, c, d, e);
    console.log(data.length);
    return data;
};

export { web3Init, createMember, updateWeb3Account, updateMember, createTree, request, selectById, getmemberId, setFather, getRequestArray, join, approve, destory, getFatherTree, getTreeDisease };