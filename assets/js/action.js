import connectWallet from "../../js/connectWallet.js"
import reload from "../../js/reload.js"
import createProfile from "../../js/createProfile.js"
import { checkConnect } from "../../js/util.js"
import createFlot from "../../js/flot.js"
import updateProfile from "../../js/updateProfile.js"
import { request, createTree, selectById, getmemberId, setFather, getRequestArray, join, approve, getFatherTree, destory } from "../../js/contract.js"

$(document).ready(() => {
    reload();
});

$("#connect-button").on('click', () => {
    if ($("#connect-button").val() == "Connect MetaMask") {
        connectWallet();
    } else {
        alert("connected!!!");
    }
});

$("#add-button").on('click', () => {
    console.log($("#checked")[0].checked)
    if (document.create_form.checkValidity() && $("#checked")[0].checked) {
        window.location.href = "#";
        createProfile();
    }
});

$("#create-profile-button").on('click', async () => {
    if (await checkConnect()) {
        window.location.href = "#addMember";
    } else {
        alert("connect wallet or chain error!!!");
    }
});

$("#show-family-disease-button").on('click', async () => {
    if (await checkConnect()) {
        try {
            const memberIds = await getmemberId();
            var i = 0;
            memberIds.forEach(memberId => {
                $("#accountList").append(`<option value=${i}>${memberId}</option>`);
                i++;
            });
        } catch (error) {
            window.location.href = "#";
            alert("no member in your account!");
        }
        $("#treeContainer").hide();
        $("#graphContainer").hide();
        $("#errorContainer1").hide();
        $("#errorContainer2").hide();
        window.location.href = "#familyDisease";
    } else {
        alert("connect wallet or chain error!!!");
    }
});

$("#account-pick-submit-button").on('click', async () => {
    try {
        const memberIdIndex = document.select_form.accountList.value;
        const memberIds = await getmemberId();
        const memberId = memberIds[memberIdIndex];
        const fatherTree = await getFatherTree(memberId);
        const data = await selectById(memberId);
        $(".treeTopPosition").text(`Id: ${fatherTree[2]} Name: ${fatherTree[3]}`);
        $(".treeMiddlePosition").text(`Id: ${fatherTree[0]} Name: ${fatherTree[1]}`);
        $(".treeBottomPosition").text(`Id: ${data[1]} Name: ${data[2]}`);

        await createFlot(memberId);
        $("#treeContainer").show();
        $("#graphContainer").show();
        $("#errorContainer1").hide();
        $("#errorContainer2").hide();
        console.log("complete");
    } catch (error) {
        console.log(error);
        $("#errorContainer1").show();
        $("#treeContainer").hide();
        $("#errorContainer2").show();
        $("#graphContainer").hide();
    }
})

$("#show-workspace-button").on('click', async () => {
    if (await checkConnect()) {
        window.location.href = "#work";
    } else {
        alert("connect wallet or chain error!!!");
    }
});

$("#update-submit-button").on('click', async () => {
    if (document.update_form.checkValidity()) {
        await updateProfile();
    }
});

$("#create-submit-button").on('click', async () => {
    try {
        await createTree();
    } catch (error) {
        alert(error);
    }
    
});

$("#request-submit-button").on('click', async () => {
    if (document.request_form.checkValidity()) {
        const memberId = document.request_form.memberID.value;
        const treeId = document.request_form.treeID.value;
        await request(memberId, treeId);
    }
});

$("#setfather-submit-button").on('click', async () => {
    if (document.setfather_form.checkValidity()) {
        const childId = document.setfather_form.childID.value;
        const fatherId = document.setfather_form.fatherID.value;
        await setFather(childId, fatherId);
    }
})

$("#search-submit-button").on('click', async () => {
    $("#search-field").text("");
    try {
        var memberData;
        if (document.search_form.checkValidity()) {
            const memberId = document.search_form.memberID.value;
            memberData = await selectById(memberId);
        }
        if (typeof(memberData) == "undefined") {
            $("#search-field").text("無此帳號");
        }
        if (memberData[0] != "") {
            $("#search-treeId-field").text(`Tree Id: ${memberData[0]}`);
        } else {
            $("#search-treeId-field").text(`Tree Id: 無`);
        }

        if (memberData[1] != "") {
            $("#search-memberId-field").text(`Member Id: ${memberData[1]}`);
        } else {
            $("#search-memberId-field").text(`Member Id: 無法查看`);
        }

        if (memberData[2] != "") {
            $("#search-name-field").text(`Name: ${memberData[2]}`);
        } else {
            $("#search-name-field").text(`Name: 無法查看`);
        }
        
        if (memberData[3] != "0x0000000000000000000000000000000000000000") {
            $("#search-account-field").text(`Account: ${memberData[3]}`);
        } else {
            $("#search-account-field").text(`Account: 無法查看`);
        }

        if (memberData[4] != "") {
            $("#search-birthday-field").text(`Birthday: ${memberData[4]}`);
        } else {
            $("#search-birthday-field").text(`Birthday: 無法查看`);
        }

        if (memberData[5] != "") {
            $("#search-phone-field").text(`Phone: ${memberData[5]}`);
        } else {
            $("#search-phone-field").text(`Phone: 無法查看`);
        }

        if (memberData[6] != "") {
            $("#search-disease-field").text(`Disease: ${memberData[6]}`);
        } else {
            $("#search-disease-field").text(`Disease: 無法查看`);
        }
        $("#search-result-field").show();
    } catch (error) {
        console.log(error);
        $("#search-field").text("無此帳號");
    }
    
});

$("#manage-submit-button").on('click', async () => {
    const memberIds = await getmemberId();
    if (typeof(memberIds.length) == "undefined") {
        $("#manage-field").text("無");
    } else {
        $("#manage-field").text(`可管理ID：${memberIds}`);

    }
});

$("#getRequest-submit-button").on('click', async () => {
    const requestArray = await getRequestArray();
    if (requestArray.length == 0) {
        $("#getRequest-field").text("無");
    } else {
        $("#getRequest-field").text(`Pending Request: ${requestArray}`);
    }

});

$("#acceptRequest-submit-button").on('click', async () => {
    if (document.acceptRequest_form.checkValidity()) {
        const memberId = document.acceptRequest_form.memberID.value;
        const treeId = document.acceptRequest_form.treeID.value;
        await join(memberId, treeId);
    }
})

$("#member-transfer-submit-button").on('click', async () => {
    console.log("123")
    if (document.managememberTransfer_form.checkValidity()) {
        const memberId = document.managememberTransfer_form.memberID.value;
        const treeId = document.managememberTransfer_form.transferTo.value;
        await approve(memberId, treeId);
    }
});

$("#destory-submit-button").on('click', async () => {
    const memberId = document.destory_form.memberID.value;
    await destory(memberId);
});

$("#search").on('click', async () => {
    if ($("#search").attr('class') == "button") {
        $("#search-field").text("");
        $("#search-result-field").hide();
    }
});

$("#getRequest").on('click', () => {
    if ($("#getRequest").attr('class') == "button") {
        $("getRequest-field").text("");
    }
})

$("#manage").on('click', () => {
    if ($("#manage").attr('class') == "button") {
        $("manage-field").text("");
    }
})