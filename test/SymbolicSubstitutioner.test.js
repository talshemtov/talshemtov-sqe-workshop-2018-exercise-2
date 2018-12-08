import {
    clearTable,
    convertParsedCodeToLocal,
    parseCode, parsedForTable,
} from '../src/js/code-analyzer';
import {startSymbolicSub} from '../src/js/SymbolicSubstitutioner';
import assert from 'assert';

let test = function(codeToParse, expected){
    clearTable();
    let parsedCode = parseCode(codeToParse);
    convertParsedCodeToLocal(parsedCode);
    let table = parsedForTable;
    let substituted=startSymbolicSub(codeToParse, table);
    let actual = substituted;
    return assert.equal(actual, expected);
};

describe('The Symbolic Subtitutioner', () => {
    it('substituting a single line function correctly', () => {
        let codeToParse = 'function foo(x) {\n' +
            'let a = x;\n' +
            'return x;\n' +
            '}';
        let expected = 'function foo(x) {\nreturn x;\n}\n\n';
        test(codeToParse, expected);
    });

    it('substituting a if else function correctly', () => {
        let codeToParse = 'function foo(x) {\n' +
            'let a = x;\n' +
            'if (a > 5) {\n' +
            'return a;\n' +
            '} else {\n' +
            'return 0;\n' +
            '}\n' +
            '}';
        let expected = 'function foo(x) {\n' +
            'if ( x > 5 ) {\n' +
            'return x;\n' +
            '} else {\n' +
            'return 0;\n' +
            '}}\n' +
            '\n';
        test(codeToParse, expected);
    });

    it('substituting a if else if else function correctly', () => {
        let codeToParse = 'function foo(x) {\n' +
            '\tlet a = x;\n' +
            '\tif (a>5) {\n' +
            '\treturn a;\n' +
            '\t} else if (a>10){\n' +
            '\treturn 0;\n' +
            '\t} else {\n' +
            'return 5;\n' +
            '}\n' +
            '}';
        let expected = 'function foo(x) {\n' +
            '\tif ( x > 5 ) {\n' +
            '\treturn x;\n' +
            '\t} else if ( x > 10 ){\n' +
            '\treturn 0;\n' +
            '\t} else {\n' +
            'return 5;\n' +
            '}}\n' +
            '\n';
        test(codeToParse, expected);
    });

    it('substituting a while function correctly', () => {
        let codeToParse = 'function foo(x) {\n' +
            '\tlet a = x;\n' +
            '\twhile (a>5) {\n' +
            '\ta=a+1;\n' +
            'x=a;\n' +
            '}\n' +
            '}';
        let expected = 'function foo(x) {\n' +
            '\twhile ( x > 5 ) {\n' +
            'x =  x + 1 \n' +
            '}}\n' +
            '\n';
        test(codeToParse, expected);
    });

    it('substituting a while function with empty line correctly', () => {
        let codeToParse = 'function foo(x) {\n' +
            '\tlet a = x;\n\n\n' +
            '\twhile (a>5) {\n' +
            '\ta=a+1;\n\n' +
            'x=a;\n\n' +
            '}\n\n' +
            '}';
        let expected = 'function foo(x) {\n' +
            '\twhile ( x > 5 ) {\n' +
            'x =  x + 1 \n' +
            '}}\n' +
            '\n';
        test(codeToParse, expected);
    });
    it('substituting a while function with empty line correctly', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '        if(b<x) {\n' +
            '            return a+b+c;\n' +
            '        } else {\n' +
            '            return c;        \n' +
            '\t   } } else if (b < z * 2) {\n' +
            '        c = c + x + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '        return x + y + z + c;\n' +
            '    }\n' +
            '}';
        let expected = 'function foo(x, y, z){\n' +
            '    if (   x + 1 + y  < z ) {\n' +
            '        if(   x + 1 + y  < x ) {\n' +
            '            return    x + 1  +   x + 1 + y   +  5  ;\n' +
            '        } else {\n' +
            '            return  5 ;\n' +
            '\t   } } else if (   x + 1 + y  <  z * 2  ) {\n' +
            '        return    x + y  + z  +  x + 5  ;\n' +
            '    } else {\n' +
            '        return    x + y  + z  +  z + 5  ;\n' +
            '}}\n' +
            '\n';
        test(codeToParse, expected);
    });

    it('substituting a return function with no local args correctly', () => {
        let codeToParse = 'function foo(x){\n' +
            'return x;\n' +
            '}';
        let expected = 'function foo(x){\n' +
            'return x;\n' +
            '}\n' +
            '\n';
        test(codeToParse, expected);
    });

    it('substituting a return function with 1 local args correctly', () => {
        let codeToParse = 'function foo(x){\n' +
            'let a= x;\n' +
            'return a;\n' +
            '}';
        let expected = 'function foo(x){\n' +
            'return x;\n' +
            '}\n' +
            '\n';
        test(codeToParse, expected);
    });
    it('substituting a assignment expression with arg correctly', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = y;\n' +
            '    return b;\n' +
            '}';
        let expected = 'function foo(x, y, z){\n' +
            '    return y;\n' +
            '}\n' +
            '\n';
        test(codeToParse, expected);
    });
});