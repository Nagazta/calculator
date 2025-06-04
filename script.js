const display = document.getElementById('display');
const mdasDisplay = document.getElementById('mdas-display');
const leftToRightDisplay = document.getElementById('left-to-right-display');
let memory = 0;
let memoryActive = false; 
const memoryIndicator = document.getElementById('memory-indicator');

let expression = '';
let resultDisplayed = false;
let showMdas = false;
let showLeftToRight = false;

function updateMemoryIndicator() {
    if (memoryActive) {
        memoryIndicator.style.display = 'inline-block';
    } else {
        memoryIndicator.style.display = 'none';
    }
}

function removeCurrentNumberFromExpression() {
    const operators = ['+', '−', '×', '÷'];
    let lastOperatorIndex = -1;
    for (const op of operators) {
        const idx = expression.lastIndexOf(op);
        if (idx > lastOperatorIndex) lastOperatorIndex = idx;
    }
    expression = expression.slice(0, lastOperatorIndex + 1);
}

function memoryAdd() {
    const currentNumber = parseFloat(getCurrentNumber());
    if (!isNaN(currentNumber)) {
        memory += currentNumber;
        memoryActive = true;
        updateMemoryIndicator();

        removeCurrentNumberFromExpression();

        updateDisplay();
    }
}

function memorySubtract() {
    const currentNumber = parseFloat(getCurrentNumber());
    if (!isNaN(currentNumber)) {
        memory -= currentNumber;
        memoryActive = true;
        updateMemoryIndicator();

        removeCurrentNumberFromExpression();
        updateDisplay();
    }
}

function memoryRecall() {
    if (!memoryActive) return;

    const operators = ['+', '−', '×', '÷'];
    const lastChar = expression.slice(-1);

    if (!expression || operators.includes(lastChar)) {
        expression += memory.toString();
    } else {
        let lastOperatorIndex = -1;
        for (const op of operators) {
            const idx = expression.lastIndexOf(op);
            if (idx > lastOperatorIndex) lastOperatorIndex = idx;
        }
        expression = expression.slice(0, lastOperatorIndex + 1) + memory.toString();
    }

    updateDisplay();
}
function memoryClear() {
    memory = 0;
    memoryActive = false;
    updateMemoryIndicator();
}


function getCurrentNumber() {
    const operators = ['+', '−', '×', '÷'];
    let lastOperatorIndex = -1;
    for (const op of operators) {
        const idx = expression.lastIndexOf(op);
        if (idx > lastOperatorIndex) lastOperatorIndex = idx;
    }
    return expression.slice(lastOperatorIndex + 1) || '0';
}

function updateDisplay() {
    display.textContent = expression || '0';
}

function updateMdasResult() {
    if (!showMdas) {
        mdasDisplay.textContent = '';
        return;
    }

    if (!expression) {
        mdasDisplay.textContent = 'MDAS: 0';
        return;
    }

    try {
        const jsExpression = expression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-');

        const result = eval(jsExpression);
        mdasDisplay.textContent = `${expression} = ${result}`;
    } catch {
        mdasDisplay.textContent = `${expression}`;
    }
}

function updateSequentialResult() {
    if (!showLeftToRight) {
        leftToRightDisplay.textContent = '';
        return;
    }

    if (!expression) {
        leftToRightDisplay.textContent = 'Left-to-Right: 0';
        return;
    }

    try {
        const normalizedExpression = expression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-');

        const steps = normalizedExpression.split(/([+\-*/])/).filter(Boolean);

        if (steps.length >= 3) {
            let runningTotal = parseFloat(steps[0]);

            for (let i = 1; i < steps.length - 1; i += 2) {
                const operator = steps[i];
                const operand = parseFloat(steps[i + 1]);

                if (isNaN(operand)) break;

                switch (operator) {
                    case '+': runningTotal += operand; break;
                    case '-': runningTotal -= operand; break;
                    case '*': runningTotal *= operand; break;
                    case '/':
                        if (operand === 0) {
                            leftToRightDisplay.textContent = 'Left-to-Right: Error';
                            return;
                        }
                        runningTotal /= operand;
                        break;
                }
            }

            leftToRightDisplay.textContent = ` ${expression} = ${runningTotal}`;
        } else {
            leftToRightDisplay.textContent = ` ${expression}`;
        }
    } catch {
        leftToRightDisplay.textContent = ` ${expression}`;
    }
}

function appendToResult(value) {
    const operators = ['+', '−', '×', '÷'];
    const lastChar = expression.slice(-1);

    if (operators.includes(value)) {
        if (operators.includes(lastChar)) {
            expression = expression.slice(0, -1) + value;
        } else if (expression) {
            expression += value;
        }
        updateDisplay();
        showLeftToRight = true;
        updateSequentialResult();
        return;
    }

    if (!isNaN(value)) {
        if (resultDisplayed) {
            expression = '';
            resultDisplayed = false;
            showMdas = false;
            showLeftToRight = false;
            updateMdasResult();
            updateSequentialResult();
        }

        const lastOperatorIndex = Math.max(
            expression.lastIndexOf('+'),
            expression.lastIndexOf('−'),
            expression.lastIndexOf('×'),
            expression.lastIndexOf('÷')
        );
        const beforeOperand = expression.slice(0, lastOperatorIndex + 1);
        let operand = expression.slice(lastOperatorIndex + 1);

        const parts = operand.split('.');
        if (parts.length > 1) {
            operand = parts[0] + '.' + parts.slice(1).join('');
        }

        expression = beforeOperand + operand + value;
        updateDisplay();
        return;
    }

    expression += value;
    updateDisplay();
}

function appendDecimal() {
    const lastChar = expression.slice(-1);

    if (lastChar === '.') {
        expression = expression.slice(0, -1);
        updateDisplay();
        return;
    }

    const lastOperatorIndex = Math.max(
        expression.lastIndexOf('+'),
        expression.lastIndexOf('−'),
        expression.lastIndexOf('×'),
        expression.lastIndexOf('÷')
    );
    const currentOperand = expression.slice(lastOperatorIndex + 1);

    if (!currentOperand.includes('.')) {
        if (resultDisplayed) {
            expression = '0';
            resultDisplayed = false;
            showMdas = false;
            showLeftToRight = false;
            updateMdasResult();
            updateSequentialResult();
        }
        expression += '.';
        updateDisplay();
    }
}

function calculateResult() {
    if (!expression) return;

    try {
        const jsExpression = expression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-');

        const result = eval(jsExpression);

        display.textContent = result;
        expression = result.toString();
        resultDisplayed = true;
        showMdas = true;
        showLeftToRight = false;

        updateMdasResult();
        updateSequentialResult();
    } catch (error) {
        display.textContent = 'Error';
        mdasDisplay.textContent = 'Error';
        leftToRightDisplay.textContent = 'Error';
        expression = '';
        resultDisplayed = true;
        showMdas = false;
        showLeftToRight = false;
    }
}

function clearResult() {
    expression = '';
    resultDisplayed = false;
    showMdas = false;
    showLeftToRight = false;
    display.textContent = '0';
    mdasDisplay.textContent = '';
    leftToRightDisplay.textContent = '';
    updateMemoryIndicator(); 
}


function backspace() {
    if (resultDisplayed) {
        clearResult();
        return;
    }
    expression = expression.slice(0, -1);
    updateDisplay();
}

const numberMap = {
    zero: '0', one: '1', two: '2', three: '3',
    four: '4', five: '5', six: '6',
    seven: '7', eight: '8', nine: '9'
};

Object.entries(numberMap).forEach(([id, val]) => {
    document.getElementById(id).addEventListener('click', () => appendToResult(val));
});

document.getElementById('decimal').addEventListener('click', appendDecimal);
document.getElementById('add').addEventListener('click', () => appendToResult('+'));
document.getElementById('subtract').addEventListener('click', () => appendToResult('−'));
document.getElementById('multiply').addEventListener('click', () => appendToResult('×'));
document.getElementById('divide').addEventListener('click', () => appendToResult('÷'));

document.getElementById('equals').addEventListener('click', calculateResult);
document.getElementById('clear').addEventListener('click', clearResult);
document.getElementById('backspace').addEventListener('click', backspace);

document.getElementById('memory-add').addEventListener('click', memoryAdd);
document.getElementById('memory-subtract').addEventListener('click', memorySubtract);
document.getElementById('memory-recall').addEventListener('click', memoryRecall);
document.getElementById('memory-clear').addEventListener('click', memoryClear);

document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (!isNaN(key) && key !== ' ') appendToResult(key);
    else if (key === '.') appendDecimal();
    else if (key === '+') appendToResult('+');
    else if (key === '-') appendToResult('−');
    else if (key === '*' || key.toLowerCase() === 'x') appendToResult('×');
    else if (key === '/' || key === '÷') {
        e.preventDefault();
        appendToResult('÷');
    }
    else if (key === 'Enter' || key === '=') calculateResult();
    else if (key === 'Backspace') backspace();
    else if (key.toLowerCase() === 'c') clearResult();
});

clearResult();
