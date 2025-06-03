const display = document.getElementById('display');

let expression = '';
let resultDisplayed = false;

function updateDisplay(value) {
    display.textContent = value;
}

function handleNumber(value) {
    if (resultDisplayed) {
        expression = '';
        resultDisplayed = false;
    }
    expression += value;
    updateDisplay(expression);
}

function handleOperator(op) {
    if (resultDisplayed) {
        resultDisplayed = false;
    }
    if (expression === '') return;

    const lastChar = expression.slice(-1);
    if ("+-×÷−*/".includes(lastChar)) {
        expression = expression.slice(0, -1) + op;
    } else {
        expression += op;
    }
    updateDisplay(expression);
}

function calculate() {
    if (expression === '') return;

    try {
        const sanitized = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        const result = eval(sanitized);
        updateDisplay(result);
        expression = result.toString();
        resultDisplayed = true;
    } catch (error) {
        updateDisplay("Error");
        expression = '';
        resultDisplayed = true;
    }
}

function clearCalculator() {
    expression = '';
    resultDisplayed = false;
    updateDisplay('0');
}

function backspace() {
    if (resultDisplayed) {
        clearCalculator();
        return;
    }
    expression = expression.slice(0, -1);
    updateDisplay(expression || '0');
}

// Bind buttons
const numberMap = {
    zero: '0', one: '1', two: '2', three: '3',
    four: '4', five: '5', six: '6',
    seven: '7', eight: '8', nine: '9'
};

Object.entries(numberMap).forEach(([id, val]) => {
    document.getElementById(id).addEventListener('click', () => handleNumber(val));
});

document.getElementById('decimal').addEventListener('click', () => {
    if (resultDisplayed) {
        expression = '';
        resultDisplayed = false;
    }

    const parts = expression.split(/[\+\−\×\÷]/);
    const currentNumber = parts[parts.length - 1];

    if (!currentNumber.includes('.')) {
        expression += '.';
        updateDisplay(expression);
    }
});

document.getElementById('add').addEventListener('click', () => handleOperator('+'));
document.getElementById('subtract').addEventListener('click', () => handleOperator('−'));
document.getElementById('multiply').addEventListener('click', () => handleOperator('×'));
document.getElementById('divide').addEventListener('click', () => handleOperator('÷'));

document.getElementById('equals').addEventListener('click', calculate);
document.getElementById('clear').addEventListener('click', clearCalculator);
document.getElementById('backspace').addEventListener('click', backspace);

// Optional: keyboard support
document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (!isNaN(key)) handleNumber(key);
    else if (key === '.') handleNumber('.');
    else if (key === '+' || key === '-') handleOperator(key);
    else if (key === '*' || key === 'x') handleOperator('×');
    else if (key === '/' || key === '÷') handleOperator('÷');
    else if (key === 'Enter' || key === '=') calculate();
    else if (key === 'Backspace') backspace();
    else if (key.toLowerCase() === 'c') clearCalculator();
});
