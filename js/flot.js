import { getTreeDisease } from "./contract.js";

const createFlot = async (memberId) => {
    // var data = [
    //     {label: "其他", data: 10},
    //     {label: "癌症", data: 20},
    //     {label: "心血管疾病", data: 30},
    //     {label: "慢性疾病", data: 40},
    //     {label: "身體健康", data: 40}
    // ];
    const options ={
        series: {
            pie: {
                innerRadius: 0.5,
                show: true
            }
        },
        legend: {
            show: false
        }
    };
    const datas = await getData(memberId);
    $.plot($("#flotContainer"), datas, options);
};

const getData = async (memberId) => {
    const diseaseData = await getTreeDisease(memberId);
    var datas = [];
    datas.push({label: "無", data: parseInt(diseaseData[0])});
    datas.push({label: "癌症", data: parseInt(diseaseData[1])});
    datas.push({label: "心血管疾病", data: parseInt(diseaseData[2])});
    datas.push({label: "慢性疾病", data: parseInt(diseaseData[3])});
    datas.push({label: "其他", data: parseInt(diseaseData[4])});
    return datas;
}

export default createFlot;