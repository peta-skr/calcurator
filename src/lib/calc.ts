export function evaluate(expression: string): number {
  let tokens = tokenizeExpression(expression);
  console.log(tokens);
  //   rpn = convertToRPN(tokens);
  //   result = evaluateRPN(rpn);
  //   return validateResult(result);

  return 1;
}

type TokenType = "Number" | "Operator";

interface Token {
  type: TokenType;
  value: string;
}

function tokenizeExpression(expression: string): Token[] {
  let tokens: Token[] = new Array();
  let tempNum = "";

  for (let i of expression) {
    // 空白スキップ
    if (/\s/.test(i)) continue;

    if (isNumeric(i)) {
      tempNum += i;
    } else {
      // エラーとかにする方が理想的なので、後で修正する
      if (!["+", "-", "*", "/"].includes(i)) continue;

      let numToken: Token = { type: "Number", value: tempNum };
      let opToken: Token = { type: "Operator", value: i };
      tokens.push(numToken);
      tokens.push(opToken);
      tempNum = "";
    }
  }

  if (tempNum != "") {
    let numToken: Token = { type: "Number", value: tempNum };
    tokens.push(numToken);
  }

  return tokens;
}

function isNumeric(str: string): boolean {
  // !isNaN(Number(str))では空白と空文字がtrueになってしまうため
  if (str == "" || str == " " || str == "　") return false;
  return !isNaN(Number(str));
}

function convertToRPN() {}

function calculateRPN() {}

function validateResult() {}

export class OverflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class DivisionByZeroError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
