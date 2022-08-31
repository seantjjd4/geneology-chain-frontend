import { updateMember } from "./contract.js";

const updateProfile = async () => {
    const memberId = document.update_form.memberID.value;
    const name = document.update_form.name.value;
    const birthdate = document.update_form.birthdate.value;
    const phone = document.update_form.phone.value;
    const diseaseIndex = document.update_form.disease.value;

    var disease;

    if (diseaseIndex == 1) {
        disease = "cancer"
    } else if (diseaseIndex == 2) {
        disease = "cardiovascular disease";
    } else if (diseaseIndex == 3) {
        disease = "chronic disease";
    } else if (diseaseIndex == 4) {
        disease = "others";
    } else {
        disease = "none";
    }

    await updateMember(memberId, name, birthdate, phone, disease);
}

export default updateProfile;