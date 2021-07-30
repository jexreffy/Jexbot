'use strict'
module.exports = (codeStartAt, codeMap, category, categoryName, result) => {
    let retVal = {};

    retVal.category = category;
    retVal.name = categoryName;
    retVal.link = `<https://alttpr.com/h/${result.data.hash}>`;
    retVal.code = ``;

    for (let p = 0; p < result.data.patch.length; p++) {
        let startAt = codeStartAt;

        let key = parseInt(Object.keys(result.data.patch[p])[0]);

        if (startAt > key) continue;

        let data = null;
        if (startAt < key) {
            key = parseInt(Object.keys(result.data.patch[p - 1])[0]);
            data = result.data.patch[p - 1][`${key}`];
        } else {
            data = result.data.patch[p][`${key}`];
        }

        let offset = startAt - key;

        for (let c = 0; c < 5; c++) {
            retVal.code += `<${codeMap[data[c + offset]]}>${c < 4 ? ' ' : ''}`
        }

        break;
    }

    return retVal;
}