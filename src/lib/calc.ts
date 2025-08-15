export function evaluate(expression: string): number {
  if (!expression || expression.trim() === "") {
    throw new Error("空の式です");
  }

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
  let tokens: Token[] = [];
  let i = 0;

  while (i < expression.length) {
    const char = expression[i];

    // 空白をスキップ
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // 数字の場合
    if (isNumeric(char)) {
      let numStr = "";
      while (i < expression.length && isNumeric(expression[i])) {
        numStr += expression[i];
        i++;
      }
      tokens.push({ type: "Number", value: numStr });
      continue;
    }

    // 演算子の場合
    if (["+", "-", "*", "/"].includes(char)) {
      // 単項マイナスのチェック
      if (char === "-" && isUnaryMinus(tokens)) {
        // 次の数字を読み取って負数として処理
        i++;
        let numStr = "-";

        // 空白スキップ
        while (i < expression.length && /\s/.test(expression[i])) {
          i++;
        }

        // 数字を読み取り
        while (i < expression.length && isNumeric(expression[i])) {
          numStr += expression[i];
          i++;
        }

        if (numStr === "-") {
          throw new Error("不正な式: 単項マイナスの後に数字がありません");
        }

        tokens.push({ type: "Number", value: numStr });
      } else {
        tokens.push({ type: "Operator", value: char });
        i++;
      }
      continue;
    }

    throw new Error(`不正な文字: ${char}`);
  }

  return tokens;
}

function isUnaryMinus(tokens: Token[]): boolean {
  // 式の先頭、または直前が演算子の場合は単項マイナス
  return tokens.length === 0 || tokens[tokens.length - 1].type === "Operator";
}

function isNumeric(char: string): boolean {
  return /^[0-9]$/.test(char);
}

function convertToRPN(tokens: Token[]): Token[] {
  const rpn: Token[] = [];
  const opStack: Token[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case "Number":
        rpn.push(token);
        break;
      case "Operator":
        // スタック上の演算子で、現在の演算子以上の優先度のものを出力
        while (
          opStack.length > 0 &&
          getPriority(opStack[opStack.length - 1].value) >=
            getPriority(token.value)
        ) {
          const op = opStack.pop();
          if (op) rpn.push(op);
        }
        opStack.push(token);
        break;
      default:
        throw new Error("予期しないトークンタイプ");
    }
  }

  // 残りの演算子をすべて出力
  while (opStack.length > 0) {
    const op = opStack.pop();
    if (op) rpn.push(op);
  }

  return rpn;
}

function getPriority(operator: string): number {
  switch (operator) {
    case "+":
    case "-":
      return 1;
    case "*":
    case "/":
      return 2;
    default:
      return 0;
  }
}

function evaluateRPN(RPN: Token[]): number {
  const stack: number[] = [];

  for (const token of RPN) {
    switch (token.type) {
      case "Number":
        const num = parseInt(token.value, 10);
        if (isNaN(num)) {
          throw new Error(`不正な数値: ${token.value}`);
        }
        stack.push(num);
        break;
      case "Operator":
        if (stack.length < 2) {
          throw new Error("演算子に対してオペランドが不足しています");
        }

        const right = stack.pop();
        const left = stack.pop();
        let result: number;

        if (right === undefined || left === undefined) {
          throw new Error("正常にオペランドが取得できませんでした");
        }

        switch (token.value) {
          case "+":
            result = left + right;
            break;
          case "-":
            result = left - right;
            break;
          case "*":
            result = left * right;
            break;
          case "/":
            if (right == 0) {
              throw new DivisionByZeroError("ゼロで割ることはできません");
            }
            result = Math.trunc(left / right);
            break;
          default:
            throw new Error(`未知の演算子: ${token.value}`);
        }

        // 中間結果の8桁チェック
        validateResult(result);
        stack.push(result);
        break;
      default:
        throw new Error("予期しないトークンタイプ");
    }
  }

  if (stack.length != 1) {
    throw new Error("式が不正です");
  }

  return stack[0];
}

function validateResult(num: number): number {
  if (!Number.isFinite(num)) {
    throw new OverflowError("計算結果が無限大です");
  }

  if (Math.abs(num) > 99999999) {
    throw new OverflowError("計算結果が8桁を超えました");
  }

  return num;
}

export class OverflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OverflowError";
  }
}

export class DivisionByZeroError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DivisionByZeroError";
  }
}
