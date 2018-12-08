let innerHTML = '';
let clearInnerHTML = function() {
    innerHTML = '';
};

let colorCode = function (codeToColor, argsString, table) {
    let splittedArgs = argsString.split(',');
    let argNames = getArgNames(table, splittedArgs.length);
    let mapRowToColor=[];
    let assignmentString = getAssignmentString(argNames, splittedArgs);

    for(let i=0; i<table.length; i++) {
        if(table[i][1]==='IfStatement' || table[i][1]==='Else IfStatement') {
            let condition = table[i][3];
            let strToEval = assignmentString+ ' ' + condition + ';';
            if(eval(strToEval)) {
                mapRowToColor.push([table[i][5],'green']);
            } else {
                mapRowToColor.push([table[i][5],'red']);
            }
        }
    }
    return printColor(mapRowToColor, codeToColor);
};

let getAssignmentString  = function(argNames, splittedArgs) {
    let assignmentString = '';
    for (let i=0; i<splittedArgs.length; i++) {
        assignmentString+= 'let '+argNames[i]+'='+splittedArgs[i]+';';
    }
    return assignmentString;
};

let printColor = function(mapRowToFunction, convertedString) {
    let convertedStringSplitted = convertedString.split('\n');
    let str = '';
    for (let i=0; i<convertedStringSplitted.length; i++) {
        let indexInMap = isInArray(mapRowToFunction, i+1);
        if(indexInMap>-1) {
            str += '<span style="color: ' + mapRowToFunction[indexInMap][1] +'; display:inline-block;">';
        }
        str += convertedStringSplitted[i];
        if(indexInMap>-1) {
            str += '</span>';
        }
        str+= '<br>';
    }
    innerHTML = str;
    return str;
};

let isInArray = function(arr, rowNum) {
    for (let i=0; i<arr.length; i++) {
        if(arr[i][0]===rowNum){
            return i;
        }
    }
    return -1;
};



let getArgNames = function(table, numberOfArgs) {
    let argNames=[];
    for (let i=0; i<numberOfArgs; i++) {
        argNames.push(table[i+2][2]);
    }
    return argNames;
};

export {colorCode};
export {innerHTML};
export {clearInnerHTML};
