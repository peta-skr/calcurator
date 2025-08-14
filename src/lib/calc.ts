export function evaluate(expression: string): number {
  let tokens = tokenizeExpression(expression);
  let rpn = convertToRPN(tokens);
  let result = evaluateRPN(rpn);

  return validateResult(result);
}

type TokenType = "Number" | "Operator";

interface Token {
  type: TokenType;
  value: string;
}

function tokenizeExpression(expression: string): Token[] {
  let tokens: Token[] = new Array();
  let tempNum = "";
  let numTurn = false; // 負の数を扱うために必要なフラグ

  for (let i of expression) {
    // 空白スキップ
    if (/\s/.test(i)) continue;

    if (isNumeric(i)) {
      tempNum += i;
      numTurn = true;
    } else {
      // エラーとかにする方が理想的なので、後で修正する
      if (!["+", "-", "*", "/"].includes(i))
        throw new Error("予期していない文字");

      if (numTurn) {
        let numToken: Token = { type: "Number", value: tempNum };
        let opToken: Token = { type: "Operator", value: i };
        tokens.push(numToken);
        tokens.push(opToken);
        tempNum = "";
        numTurn = false;
      } else {
        tempNum += i;
      }
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

function convertToRPN(tokens: Token[]): Token[] {
  let RPN: Token[] = [];
  let opStack: Token[] = [];

  for (let token of tokens) {
    switch (token.type) {
      case "Number":
        RPN.push(token);
        break;
      case "Operator":
        if (opStack.length == 0) {
          opStack.push(token);
        } else if (
          checkOpPriority(token.value, opStack[opStack.length - 1].value)
        ) {
          let op = opStack.pop();
          if (op !== undefined) {
            RPN.push(op);
          }
          opStack.push(token);
        } else {
          opStack.push(token);
        }
        break;
      default:
        // エラーの方が良いので、後で修正する。
        throw new Error("予期していない文字です");
    }
  }

  while (opStack.length > 0) {
    let op = opStack.pop();
    if (op !== undefined) {
      RPN.push(op);
    }
  }

  return RPN;
}

function checkOpPriority(op1: string, op2: string): boolean {
  let p1 = ["*", "/"].includes(op1) ? 2 : 1;
  let p2 = ["*", "/"].includes(op2) ? 2 : 1;

  return p1 <= p2;
}

function evaluateRPN(RPN: Token[]): number {
  let numStack: number[] = [];

  for (let token of RPN) {
    switch (token.type) {
      case "Number":
        numStack.push(Number(token.value));
        break;
      case "Operator":
        let right = numStack.pop();
        let left = numStack.pop();

        if (right == undefined || left == undefined) {
          // ちゃんとしたエラーに修正する
          throw new Error("予期していないエラー");
        }

        switch (token.value) {
          case "+":
            numStack.push(left + right);
            break;
          case "-":
            numStack.push(left - right);
            break;
          case "*":
            numStack.push(left * right);
            break;
          case "/":
            if (right == 0) throw new DivisionByZeroError("0割はエラーです");
            numStack.push(Math.trunc(left / right));
            break;
        }
    }
  }

  if (numStack.length != 1) {
    // ちゃんとしたエラーに修正する
    throw new Error("予期していないエラー");
  }

  return numStack[0];
}

function validateResult(num: number): number {
  let len = Math.abs(num).toString().length;
  if (len > 8) throw new OverflowError("ERR（オーバーフロー）");

  return num;
}

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
