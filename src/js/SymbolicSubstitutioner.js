import * as algebra from 'algebra.js';

let args = [];
let tableAfterSub;

export{tableAfterSub};

// let assignmentExpressions = [];

let startSymbolicSub = function(unparsedCode, parsedForTable) {
    let localParams = [];
    args = [];
    let tmp=unparsedCode.split('\n');
    let toRemove=[];
    let goodCode='';
    let lastValidLine = 0;
    for(let i=0; i<tmp.length; i++) {
        // tmp[i] = tmp[i].trim();
        if (tmp[i].trim() === '}') {
            // toRemove.push(i);
            // tmp[lastValidLine] = tmp[lastValidLine] + '}';
        } else if (tmp[i].trim().length === 0) {
            toRemove.push(i);
        } else {
            lastValidLine=i;
        }
    }
    for(let i=0; i<toRemove.length; i++) {
        tmp.splice(toRemove[i]-i,1);
    }
    for(let i=0; i<tmp.length; i++) {
        goodCode += tmp[i]+'\n';
    }
    symbolicSub(goodCode, parsedForTable, localParams, goodCode);
    tableAfterSub = parsedForTable;
    return substitutedFunc(parsedForTable, unparsedCode);
};

let symbolicSub = function(unparsedCode, parsedForTable, localParams, substring) {
    for (let i = 0; i < parsedForTable.length; i++) {
        if (parsedForTable[i][1] === 'Variable Declaration') { //function args
            args[args.length] = parsedForTable[i][2];
        } else if (parsedForTable[i][1] === 'VariableDeclaration') { //var declaration- let..
            let subVal = substitute(parsedForTable[i], localParams);
            localParams[localParams.length] = [parsedForTable[i][2], subVal];
        } else if (parsedForTable[i][1] === 'IfStatement' || parsedForTable[i][1] === 'Else IfStatement' || parsedForTable[i][1] === 'WhileStatement') {
            parsedForTable[i][3] = replaceOtherValues(parsedForTable[i][3], localParams);
            i += ifBlock(parsedForTable[i], unparsedCode, JSON.parse(JSON.stringify(localParams)), parsedForTable, substring);
        } else if (parsedForTable[i][1] === 'AssignmentExpression') { // assignment
            parsedForTable[i][2] = replaceOtherValues(parsedForTable[i][2], localParams, true);
            parsedForTable[i][4] = replaceOtherValues(parsedForTable[i][4], localParams, false);
            localParams = updateValue(parsedForTable[i], localParams, 2);
            localParams = updateValue(parsedForTable[i], localParams, 4);
        } else {
            parsedForTable[i][3] = replaceOtherValues(parsedForTable[i][3], localParams, false);
            parsedForTable[i][4] = replaceOtherValues(parsedForTable[i][4], localParams, false);
        }
    }

};

let substitutedFunc = function(table, unparsedCode) {
    let splittedUnparsedCode = unparsedCode.split('\n');
    let toRemove =[];
    let ans='';
    let newRowCounter = 0;
    for (let lineInUnparsedCode=0; lineInUnparsedCode<splittedUnparsedCode.length; lineInUnparsedCode++) {
        let indexInTable = findIndex(lineInUnparsedCode+1, table, 0);
        newRowCounter++;
        if (indexInTable != -1) {
            switch(table[indexInTable][1]) {
            case 'IfStatement':
            case 'WhileStatement':
            case 'Else IfStatement':
                splittedUnparsedCode[lineInUnparsedCode] = replaceBetweenParenthesises(splittedUnparsedCode[lineInUnparsedCode], table[indexInTable][3]);
                table[indexInTable].push(newRowCounter);
                break;
            case 'ReturnStatement':
                splittedUnparsedCode[lineInUnparsedCode] = 'return ' + table[indexInTable][4] + ';';
                break;
            case 'Function Declaration':
                break;
            default:
                toRemove.push(lineInUnparsedCode);
                newRowCounter--;
            }
        }
    }
    for (let i=0; i<toRemove.length; i++) {
        splittedUnparsedCode.splice(toRemove[i]-i,1);
    }
    for(let i=0; i<splittedUnparsedCode.length; i++) {
        ans += splittedUnparsedCode[i]+'\n';
    }
    return ans;
};

let replaceBetweenParenthesises = function(original, replacement) {
    let indexOfOpen, indexOfClose;
    for( indexOfOpen=0; indexOfOpen<original.length; indexOfOpen++) {
        if(original[indexOfOpen]==='(') {
            break;
        }
    }
    for( indexOfClose=original.length-1; indexOfClose>0; indexOfClose--) {
        if (original[indexOfClose]===')') {
            break;
        }
    }
    let startToOpen = original.substring(0, indexOfOpen+1);
    let closeToEnd = original.substring(indexOfClose);
    return startToOpen + replacement + closeToEnd;
}

let findIndex = function(val, array, col) {
    for (let i=0; i<array.length; i++) {
        if(val===array[i][col]) {
            return i;
        }
    }
    return -1;
};

let ifBlock = function(ifRowInTable, unparsedCode, blockLocalParams, parsedForTable, sub) {
    unparsedCode = unparsedCode.replace(/^\s*[\r\n]/gm, ''); //remove empty lines
    let splitted = unparsedCode.split('\n');
    let substring = new String();
    for (let i=ifRowInTable[0]-1; i<splitted.length; i++) {
        substring += splitted[i] + '\n';
    }
    let endOfIfBlockPosition = findClosingBracketMatchIndex(substring, substring.indexOf('{'));
    endOfIfBlockPosition += (unparsedCode.length-substring.length+1);
    // let innerBlock = substring.substring(0,endOfIfBlockPosition).trim().replace(/^\s*[\r]/gm, '').split('\n');
    // for (let i =0; i<innerBlock.length; i++){
    //     if (innerBlock[i].trim().length<2) {
    //         innerBlock.splice(i, 1);
    //     }
    // }
    // let lineOfClosing = innerBlock.length-1 + ifRowInTable[0];
    let lineOfClosing = getLineNumberByIndex(unparsedCode, endOfIfBlockPosition);
    let innerBlockTable = getBlock(parsedForTable, ifRowInTable[0], lineOfClosing);
    symbolicSub(unparsedCode, innerBlockTable, blockLocalParams.slice(),
        substring.substring(substring.indexOf('{')+1,endOfIfBlockPosition));
    return innerBlockTable.length;
};

let getBlock = function(parsedForTable, ifLine, endOfBlockLine) {
    let blockTable = [];
    for (let i=0; i<parsedForTable.length; i++) {
        if (parsedForTable[i][0]> ifLine && parsedForTable[i][0]<endOfBlockLine) {
            blockTable.push(parsedForTable[i]);
        }
    }
    return blockTable;
};

let getLineNumberByIndex = function(string, index) {
    let counter = 1;
    for (let i =0; i<index; i++) {
        if(string[i]==='\n') {
            counter++;
        }
    }
    return counter;
};

let replaceOtherValues = function(string, localParams, isName) {
    let res=string;
    for (let i=0; i<localParams.length; i++) {
        if ((string.length===1 && string.includes(localParams[i][0])) ||string.includes(' ' + localParams[i][0] + ' ') || string.includes(' ' + localParams[i][0] + ';')) {
            if (string.length===1) {
                res = res.replace(localParams[i][0], localParams[i][1]);
            } else {
                res = res.replace(' ' + localParams[i][0] + ' ', ' (' + localParams[i][1] + ') ');
            }
        }
    }
    try {
        parseInt(res);
    } catch (e) {
        return res; ///res is not a number and can replace name in row
    }
    if (isName) {

        return string; //res is a number
    } return res;
};

let updateValue = function(rowToUpdate, localParams, indexToUpdate) {
    let currentVal = null;
    let found = false;
    let index = -1;
    for (let i=0; i<localParams.length; i++) {
        if (localParams[i][0] === rowToUpdate[indexToUpdate].trim()) {
            currentVal = localParams[i][1];
            found = true;
            index = i;
        }
    }
    if (found) {
        let newValue = rowToUpdate[4].replace(rowToUpdate[indexToUpdate], currentVal);
        try {
            newValue = algebra.parse(newValue).toString();
        } catch (e) { e.print();}
        localParams[index][1] = ' '+newValue+' ';
        rowToUpdate[4] = ' '+newValue+' ';
    }
    return localParams;
};

let substitute = function(details, localParams) {
    let value = details[4];
    if ((typeof value) === 'string')
    {
        for (let j = 0; j < localParams.length; j++) {
            if (value.includes(localParams[j][0])) {
                value = value.replace(localParams[j][0]+' ', localParams[j][1]);
            }
        }
    }
    return value;
};

function findClosingBracketMatchIndex(str, pos) {
    let depth = 1;
    for (let i = pos + 1; i < str.length; i++) {
        switch (str[i]) {
        case '{':
            depth++;
            break;
        case '}':
            if (--depth == 0) {
                return i;
            }
            break;
        }
    }
    return -1;    // No matching closing parenthesis
}

// let substituteUnparsedCode = function(unparsedCode) {
//     removeVarDeclarations(unparsedCode);
//     removeAssignmentExpressions(unparsedCode);
// }
//
// let removeVarDeclarations = function(unparsedCode) {
//     return unparsedCode.replace(/^.*let .*$/mg, '');
// };
//
// let removeAssignmentExpressions = function(unparsedCode) {
//     return unparsedCode.replace(/^.* = .*$\n/mg, '');
// };

export {startSymbolicSub};