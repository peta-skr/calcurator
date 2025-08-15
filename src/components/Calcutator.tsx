import React, { useState } from "react";
import "./Calculator.css";
import { evaluate } from "../lib/calc";

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [isError, setIsError] = useState(false);
  const [justCalculated, setJustCalculated] = useState(false);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  // 全てクリア
  function handleClear() {
    setDisplay("0");
    setExpression("");
    setIsError(false);
    setJustCalculated(false);
    setWaitingForOperand(false);
  }

  // 符号切り替え
  const handlePlusMinus = () => {
    if (isError) return;

    if (display === "0") return;

    const newDisplay = display.startsWith("-")
      ? display.slice(1)
      : "-" + display;
    setDisplay(newDisplay);

    // 式が空でない場合、最後の数値を置き換える
    if (expression && !waitingForOperand) {
      const parts = expression.split(/([+\-*/])/);
      if (parts.length > 0) {
        parts[parts.length - 1] = newDisplay;
        setExpression(parts.join(""));
      }
    } else if (!expression) {
      setExpression(newDisplay);
    }
  };

  function handleOperator(operator: string) {
    if (isError) return;

    if (justCalculated) {
      // 計算直後の場合、結果を使って新しい計算を開始
      setExpression(display + operator);
      setJustCalculated(false);
      setWaitingForOperand(true);
      return;
    }

    if (waitingForOperand) {
      // すでに演算子が入力されている場合、置き換える
      setExpression(expression.slice(0, -1) + operator);
      return;
    }

    if (expression === "") {
      // 最初の数値がない場合
      if (display !== "0") {
        setExpression(display + operator);
        setWaitingForOperand(true);
      }
    } else {
      // 既存の式に追加
      setExpression(expression + operator);
      setWaitingForOperand(true);
    }
  }

  // 数字入力
  function handleDigit(digit: string) {
    if (isError) {
      setIsError(false);
      setDisplay(digit);
      setExpression(digit);
      setJustCalculated(false);
      setWaitingForOperand(false);
      return;
    }

    if (justCalculated) {
      // 計算直後の場合、新しい計算を開始
      setDisplay(digit);
      setExpression(digit);
      setJustCalculated(false);
      setWaitingForOperand(false);
      return;
    }

    if (waitingForOperand) {
      // 演算子の後の最初の文字
      setDisplay(digit);
      setExpression(expression + digit);
      setWaitingForOperand(false);
      return;
    }

    // 通常の数字入力
    if (display === "0") {
      setDisplay(digit);
      if (expression === "0") {
        setExpression(digit);
      } else {
        setExpression(expression + digit);
      }
    } else {
      // 8桁制限チェック
      if (display.replace("-", "").length >= 8) {
        return; // 8桁を超える場合は入力を模試
      }

      setDisplay(display + digit);
      setExpression(expression + digit);
    }
  }

  // 計算実行
  function handleEquals() {
    if (isError) return;

    // 不完全な式の場合は何もしない
    if (waitingForOperand || expression === "0") {
      return;
    }

    try {
      const result = evaluate(expression);

      // 結果が8桁を超える場合はエラー
      if (Math.abs(result) > 99999999) {
        setIsError(true);
        setDisplay("ERR");
        return;
      }

      // -0を0に正規化
      const normalizedResult = result === 0 ? 0 : result;

      setDisplay(normalizedResult.toString());
      setExpression(normalizedResult.toString());
      setJustCalculated(true);
      setWaitingForOperand(false);
    } catch (error) {
      setIsError(true);
      setDisplay("ERR");
      setExpression("");
      setWaitingForOperand(false);
    }
  }

  return (
    <div className="calculator">
      <div className="display">
        <div className="expression">{expression || "0"}</div>
        <div className="result">{display}</div>
      </div>

      <div className="buttons">
        <button className="btn btn-function btn-ac" onClick={handleClear}>
          AC
        </button>
        <button className="btn btn-function" onClick={handlePlusMinus}>
          ±
        </button>
        <button
          className="btn btn-operator"
          onClick={() => handleOperator("/")}
        >
          ÷
        </button>

        <button className="btn btn-number" onClick={() => handleDigit("7")}>
          7
        </button>
        <button className="btn btn-number" onClick={() => handleDigit("8")}>
          8
        </button>
        <button className="btn btn-number" onClick={() => handleDigit("9")}>
          9
        </button>
        <button
          className="btn btn-operator"
          onClick={() => handleOperator("*")}
        >
          ×
        </button>

        <button className="btn btn-number" onClick={() => handleDigit("4")}>
          4
        </button>
        <button className="btn btn-number" onClick={() => handleDigit("5")}>
          5
        </button>
        <button className="btn btn-number" onClick={() => handleDigit("6")}>
          6
        </button>
        <button
          className="btn btn-operator"
          onClick={() => handleOperator("-")}
        >
          −
        </button>

        <button className="btn btn-number" onClick={() => handleDigit("1")}>
          1
        </button>
        <button className="btn btn-number" onClick={() => handleDigit("2")}>
          2
        </button>
        <button className="btn btn-number" onClick={() => handleDigit("3")}>
          3
        </button>
        <button
          className="btn btn-operator"
          onClick={() => handleOperator("+")}
        >
          +
        </button>

        <button
          className="btn btn-number btn-zero"
          onClick={() => handleDigit("0")}
        >
          0
        </button>
        <button className="btn btn-equals" onClick={handleEquals}>
          =
        </button>
      </div>
    </div>
  );
};

export default Calculator;
