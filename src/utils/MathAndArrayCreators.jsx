function roundToNearest50(value) {
    return Math.round(value / 50) * 50;
}
function roundToNearest100(value) {
    return Math.round(value / 100) * 100;
}

function roundUpToNearest(number, n) {
    return Math.ceil(number / n) * n;
}

function roundDownToNearest(number, n) {
    return Math.floor(number / n) * n;
}

function buildStrikePricesArray(midStrikePrice, count, multiplier) {
    count++;
    midStrikePrice = (multiplier === 50? roundToNearest50(midStrikePrice):roundToNearest100(midStrikePrice));
    const strikePriceArray = [midStrikePrice];
    
    const upwardsFirst = roundUpToNearest(midStrikePrice, multiplier);
    for(let i = 1;i<count;i++){
        strikePriceArray.push(upwardsFirst + (i*multiplier));
    }
    const downwardsFirst = roundDownToNearest(midStrikePrice, multiplier);
    for(let i = 1;i<count;i++){
        strikePriceArray.unshift(downwardsFirst - (i*multiplier));
    }
    return strikePriceArray;
}




export { roundToNearest50, buildStrikePricesArray, roundToNearest100 };