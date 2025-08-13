// calc.spec.ts
import { evaluate, OverflowError, DivisionByZeroError } from "./calc";

describe("優先順位・結合性", () => {
  test("1 + 2 * 3 = 7", () => {
    expect(evaluate("1+2*3")).toBe(7);
  });

  test("左結合: 8 / 2 / 2 = 2", () => {
    expect(evaluate("8/2/2")).toBe(2);
  });

  test("左結合: 12 - 3 - 2 = 7", () => {
    expect(evaluate("12-3-2")).toBe(7);
  });

  test("乗除優先: 10 - 2 * 3 = 4", () => {
    expect(evaluate("10-2*3")).toBe(4);
  });
});

describe("足し算", () => {
  test.each`
    a            | b      | expected
    ${0}         | ${0}   | ${0}
    ${123}       | ${456} | ${579}
    ${99999999}  | ${-1}  | ${99999998}
    ${-99999999} | ${1}   | ${-99999998}
  `("$a + $b = $expected", ({ a, b, expected }) => {
    expect(evaluate(`${a}+${b}`)).toBe(expected);
  });

  test("結果が8桁超でERR（オーバーフロー）", () => {
    expect(() => evaluate("99999999+1")).toThrow(OverflowError);
    expect(() => evaluate("-99999999-1")).toThrow(OverflowError);
  });
});

describe("引き算", () => {
  test.each`
    a    | b    | expected
    ${7} | ${5} | ${2}
    ${5} | ${7} | ${-2}
    ${0} | ${9} | ${-9}
    ${9} | ${0} | ${9}
  `("$a - $b = $expected", ({ a, b, expected }) => {
    expect(evaluate(`${a}-${b}`)).toBe(expected);
  });
});

describe("掛け算", () => {
  test.each`
    a     | b    | expected
    ${3}  | ${4} | ${12}
    ${0}  | ${5} | ${0}
    ${-3} | ${4} | ${-12}
  `("$a * $b = $expected", ({ a, b, expected }) => {
    expect(evaluate(`${a}*${b}`)).toBe(expected);
  });

  test("桁あふれERR", () => {
    expect(() => evaluate("12345678*8")).toThrow(OverflowError); // 98,765,424 -> OK（例）※要件次第で変える
    expect(() => evaluate("99999999*2")).toThrow(OverflowError);
  });
});

describe("割り算（整数・0方向丸め）", () => {
  test.each`
    a     | b     | expected
    ${7}  | ${3}  | ${2}
    ${-7} | ${3}  | ${-2}
    ${7}  | ${-3} | ${-2}
    ${-7} | ${-3} | ${2}
    ${5}  | ${2}  | ${2}
    ${1}  | ${3}  | ${0}
  `("$a / $b = $expected", ({ a, b, expected }) => {
    expect(evaluate(`${a}/${b}`)).toBe(expected);
  });

  test("0割はERR", () => {
    expect(() => evaluate("5/0")).toThrow(DivisionByZeroError);
  });
});

describe("複数演算のチェーン", () => {
  test("10 - 2 * 3 = 4", () => {
    expect(evaluate("10-2*3")).toBe(4);
  });
  test("8 / 2 / 2 = 2", () => {
    expect(evaluate("8/2/2")).toBe(2);
  });
});

describe("単項マイナス（先頭または演算子直後）", () => {
  test.each`
    expr      | expected
    ${"-3*5"} | ${-15}
    ${"2*-3"} | ${-6}
    ${"2--3"} | ${5}
  `("$expr = $expected", ({ expr, expected }) => {
    expect(evaluate(expr)).toBe(expected);
  });
});

describe("スペース無視・無効入力", () => {
  test("空白は無視される", () => {
    expect(evaluate(" 1 +   2* 3 ")).toBe(7);
  });
  test("不正文字は例外", () => {
    expect(() => evaluate("2+a")).toThrow();
  });
});
