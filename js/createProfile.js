import { createMember } from "./contract.js";

const createProfile = async () => {
    const name = document.create_form.name.value;
    const birthdate = document.create_form.birthdate.value;
    const phone = document.create_form.phone.value;
    const diseaseIndex = document.create_form.disease.value;
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

    createMember(name, birthdate, phone, disease);
}

export default createProfile;