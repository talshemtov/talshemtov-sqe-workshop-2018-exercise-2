import $ from 'jquery';


let colorCode = function (codeToColor, argsString, table) {
    let assignmentString = '';
    let splittedArgs = argsString.split(',');
    let argNames = getArgNames(table, splittedArgs.length);
    let mapRowToColor=[];
    for (let i=0; i<splittedArgs.length; i++) {
        assignmentString+= 'let '+argNames[i]+'='+splittedArgs[i]+';';
    }
    for(let i=0; i<table.length; i++) {
        if(table[i][1]==='IfStatement' || table[i][1]==='Else IfStatement') {
            let condition = table[i][3];
            let strToEval = assignmentString+ ' ' + condition + ';';
            if(eval(strToEval)) {
                // colorLineGreen();
                mapRowToColor.push([table[i][5],'green']);
                // let tmp = document.createElement('label');
                // tmp.innerHTML = convStringTable[table.]
                // document.body.appendChild(tmp);

            } else {
                mapRowToColor.push([table[i][5],'red']);
                // colorLineRed();
            }
        }
    }
    printColor(mapRowToColor, codeToColor);
}

let printColor = function(mapRowToFunction, convertedString) {
    let node = document.getElementById('results');
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
    let convertedStringSplitted = convertedString.split('\n');
    for (let i=0; i<convertedStringSplitted.length; i++) {
        let element = document.createElement('label');
        element.innerHTML = convertedStringSplitted[i]+'<br />';
        let indexInMap = isInArray(mapRowToFunction, i+1);
        if(indexInMap>-1) {
            element.style.color=mapRowToFunction[indexInMap][1];
        }
        document.getElementById('results').appendChild(element);
    }
}

let isInArray = function(arr, rowNum) {
    for (let i=0; i<arr.length; i++) {
        if(arr[i][0]===rowNum){
            return i;
        }
    }
    return -1;
}



let getArgNames = function(table, numberOfArgs) {
    let argNames=[];
    for (let i=0; i<numberOfArgs; i++) {
        argNames.push(table[i+2][2]);
    }
    return argNames;
};

export {colorCode};