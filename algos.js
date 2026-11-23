// 버글 알고리즘 문제 목록. 매주 화요일과 금요일에 하나씩 나온다.
// 끝까지 가면 처음으로 돌아간다. 문제를 추가하려면 배열 끝에 붙이면 된다.
//
// puzzles.js 와 같은 모양에 problem 이 더 붙는다.
//   goal    : 문제 제목
//   problem : { text: 문제 설명, input: 입력 형식, output: 출력 형식,
//               examples: [{ in: 예제 입력, out: 예제 출력 }] }
//
// 좋은 알고리즘 문제의 조건
//   - 버그가 있는 코드도 예제는 모두 맞힌다. 예제에서 바로 틀리면 너무 쉽다.
//   - 문제 설명이 명세다. 설명에 적힌 동작은 전부 의도한 것이고, 버그는 거기서 어긋나는 한 줄이다.

//   judge   : 반례 단계에서 쓰는 채점기. 입력을 읽고(parse), 버그 코드와 바른 코드를 JS로 흉내 내서(buggy, correct)
//             두 출력이 다르면 반례로 인정한다. parse 안의 t 는 입력을 숫자 단위로 읽는 도구다.

(function () {
"use strict";

function find(d, inclusive) {
  var a = d.a, lo = 0, hi = a.length - 1;
  while (inclusive ? lo <= hi : lo < hi) {
    var mid = Math.floor((lo + hi) / 2);
    if (a[mid] === d.x) return String(mid);
    if (a[mid] < d.x) lo = mid + 1; else hi = mid - 1;
  }
  return "-1";
}

function isPrime(n, inclusive) {
  var prime = n >= 2;
  for (var i = 2; inclusive ? i * i <= n : i * i < n; i++) {
    if (n % i === 0) { prime = false; break; }
  }
  return prime ? "YES" : "NO";
}

function sortWith(src, cmp) {
  var a = src.slice();
  for (var i = 1; i < a.length; i++) {
    var v = a[i], j = i - 1;
    while (j >= 0 && cmp(a[j], v) > 0) { a[j + 1] = a[j]; j--; }
    a[j + 1] = v;
  }
  return a.join(" ");
}

function pairs(d, inclusive) {
  var a = d.a, l = 0, r = a.length - 1, cnt = 0;
  while (inclusive ? l <= r : l < r) {
    var s = a[l] + a[r];
    if (s === d.x) { cnt++; l++; r--; }
    else if (s < d.x) l++;
    else r--;
  }
  return String(cnt);
}

window.ALGOS = [
  {
    subject: "알고리즘",
    lang: "c",
    goal: "최대 연속 부분합",
    problem: {
      text: "정수 N개가 한 줄로 주어진다. 연속한 1개 이상의 수를 골라 더했을 때 나올 수 있는 가장 큰 합을 구하라.",
      input: "첫 줄에 N (1 ≤ N ≤ 100,000). 둘째 줄에 정수 N개. 각 정수는 -1,000 이상 1,000 이하.",
      output: "가장 큰 연속 부분합을 출력한다.",
      examples: [
        { in: "5\n2 -3 4 -1 3", out: "6" },
        { in: "3\n1 2 3", out: "6" },
      ],
    },
    code: String.raw`#include <stdio.h>

int main(void) {
    int n, x;
    scanf("%d", &n);
    int cur = 0;
    int best = 0;
    for (int i = 0; i < n; i++) {
        scanf("%d", &x);
        cur = cur > 0 ? cur + x : x;
        if (cur > best)
            best = cur;
    }
    printf("%d\n", best);
    return 0;
}`,
    judge: {
      parse: function (t) {
        var n = t.int(1, 100000), a = t.ints(n, -1000, 1000);
        t.end();
        return a;
      },
      buggy: function (a) {
        var cur = 0, best = 0;
        a.forEach(function (x) { cur = cur > 0 ? cur + x : x; if (cur > best) best = cur; });
        return String(best);
      },
      correct: function (a) {
        var cur = 0, best = -Infinity;
        a.forEach(function (x) { cur = cur > 0 ? cur + x : x; if (cur > best) best = cur; });
        return String(best);
      },
    },
    bug: 7,
    fix: "    int best = -1000;",
    wrong: [
      { code: "    int best = -1;", why: "모든 수가 -2 이하이면 여전히 틀린다. 예를 들어 -5 -2 -7 이면 -2가 답인데 -1이 나온다." },
      { code: "    int best = cur;", why: "이 시점에 cur는 0이다. 결국 0으로 시작하는 원래 코드와 똑같다." },
    ],
    hints: [
      "예제는 다 맞는데 채점하면 틀린다. 어떤 입력에서는 답보다 큰 값이 나온다.",
      "초기값 문제다.",
      "입력이 전부 음수라면 답은 몇일까?",
    ],
    explain:
      "best를 0으로 시작하면 '아무것도 안 고른 합 0'이 답 후보에 들어간다. 그런데 문제는 1개 이상을 골라야 한다. 입력이 -5 -2 -7 이면 답은 -2인데 이 코드는 0을 출력한다. best는 나올 수 있는 가장 작은 답(-1000)이나 첫 번째 수로 시작해야 한다.",
  },
  {
    subject: "알고리즘",
    lang: "c",
    goal: "정렬된 배열에서 수 찾기",
    problem: {
      text: "오름차순으로 정렬된 서로 다른 정수 N개와 정수 X가 주어진다. X가 배열의 몇 번째 칸(0부터 셈)에 있는지 구하라.",
      input: "첫 줄에 N과 X (1 ≤ N ≤ 100,000). 둘째 줄에 오름차순으로 정렬된 서로 다른 정수 N개.",
      output: "X가 있는 칸의 번호를 출력한다. 없으면 -1을 출력한다.",
      examples: [
        { in: "5 7\n1 3 7 9 12", out: "2" },
        { in: "5 4\n1 3 7 9 12", out: "-1" },
      ],
    },
    code: String.raw`#include <stdio.h>

int a[100000];

int main(void) {
    int n, x;
    scanf("%d %d", &n, &x);
    for (int i = 0; i < n; i++)
        scanf("%d", &a[i]);
    int lo = 0, hi = n - 1, ans = -1;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (a[mid] == x) {
            ans = mid;
            break;
        }
        if (a[mid] < x)
            lo = mid + 1;
        else
            hi = mid - 1;
    }
    printf("%d\n", ans);
    return 0;
}`,
    judge: {
      parse: function (t) {
        var n = t.int(1, 100000), x = t.int(-1e9, 1e9), a = t.ints(n, -1e9, 1e9);
        t.end();
        for (var i = 1; i < n; i++) if (a[i - 1] >= a[i]) t.fail("수는 서로 다르고 오름차순이어야 해.");
        return { a: a, x: x };
      },
      buggy: function (d) { return find(d, false); },
      correct: function (d) { return find(d, true); },
    },
    bug: 11,
    fix: "    while (lo <= hi) {",
    wrong: [
      { code: "    while (lo != hi) {", why: "lo == hi 인 칸을 여전히 보지 않는다. 게다가 hi가 lo보다 작아지면 멈추지 않고 배열 밖을 읽는다." },
      { code: "    while (lo + 1 < hi) {", why: "범위를 더 좁게 끝내서, 남은 칸이 두 개일 때부터 보지 않는다. 더 많이 틀린다." },
    ],
    hints: [
      "예제는 다 맞는데, 분명히 있는 수를 찾는데도 -1이 나오는 경우가 있다.",
      "반복문이 너무 일찍 끝난다.",
      "lo와 hi가 같아졌을 때, 그 칸은 확인했을까?",
    ],
    explain:
      "lo와 hi는 '아직 확인 안 한 구간'의 양 끝이다. lo == hi 이면 확인할 칸이 하나 남은 건데, lo < hi 조건은 그 순간 반복을 끝내 버린다. 그래서 탐색이 마지막 한 칸까지 좁혀지는 경우(맨 끝 수, N이 1인 경우 등)를 놓친다. 구간에 칸이 하나라도 남아 있는 동안 돌도록 lo <= hi 로 써야 한다.",
  },
  {
    subject: "알고리즘",
    lang: "c",
    goal: "소수 판별",
    problem: {
      text: "자연수 N이 소수인지 판별하라. 소수는 1과 자기 자신만으로 나누어떨어지는 2 이상의 자연수다.",
      input: "첫 줄에 N (1 ≤ N ≤ 1,000,000,000).",
      output: "소수이면 YES, 아니면 NO를 출력한다.",
      examples: [
        { in: "7", out: "YES" },
        { in: "12", out: "NO" },
        { in: "1", out: "NO" },
      ],
    },
    code: String.raw`#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    int prime = n >= 2;
    for (int i = 2; i * i < n; i++) {
        if (n % i == 0) {
            prime = 0;
            break;
        }
    }
    printf(prime ? "YES\n" : "NO\n");
    return 0;
}`,
    judge: {
      parse: function (t) {
        var n = t.int(1, 1e9);
        t.end();
        return n;
      },
      buggy: function (n) { return isPrime(n, false); },
      correct: function (n) { return isPrime(n, true); },
    },
    bug: 7,
    fix: "    for (int i = 2; i * i <= n; i++) {",
    wrong: [
      { code: "    for (int i = 2; i < n / 2; i++) {", why: "4를 넣으면 i < 2 라서 한 번도 안 돌고 YES가 나온다. 게다가 N이 10억이면 너무 느리다." },
      { code: "    for (int i = 3; i * i <= n; i++) {", why: "2로 나눠 보지 않는다. 4나 8처럼 2로만 나누어떨어지는 수를 소수라고 한다." },
    ],
    hints: [
      "예제는 다 맞는데, 소수가 아닌 수에 YES가 나오는 경우가 있다.",
      "반복 범위의 경계 문제다.",
      "i가 정확히 √N 일 때 반복문 안에 들어갈까?",
    ],
    explain:
      "약수는 짝을 이루므로 √N 이하만 나눠 보면 된다. 그런데 i * i < n 이면 i가 정확히 √N 인 경우를 건너뛴다. 그래서 9, 25, 49처럼 소수의 제곱인 수는 약수를 하나도 찾지 못하고 소수라고 판정된다. √N 까지 포함하도록 i * i <= n 으로 써야 한다.",
  },
  {
    subject: "알고리즘",
    lang: "c",
    goal: "수 정렬하기",
    problem: {
      text: "정수 N개를 오름차순으로 정렬하라.",
      input: "첫 줄에 N (1 ≤ N ≤ 100,000). 둘째 줄에 정수 N개. 각 정수는 -2,000,000,000 이상 2,000,000,000 이하.",
      output: "정렬한 수를 한 줄에 공백으로 구분해 출력한다.",
      examples: [
        { in: "5\n5 2 -3 9 0", out: "-3 0 2 5 9" },
        { in: "3\n100 -100 7", out: "-100 7 100" },
      ],
    },
    code: String.raw`#include <stdio.h>
#include <stdlib.h>

int cmp(const void *p, const void *q)
{
    int x = *(const int *)p;
    int y = *(const int *)q;
    return x - y;
}

int a[100000];

int main(void) {
    int n;
    scanf("%d", &n);
    for (int i = 0; i < n; i++)
        scanf("%d", &a[i]);
    qsort(a, n, sizeof(int), cmp);
    for (int i = 0; i < n; i++)
        printf("%d ", a[i]);
    printf("\n");
    return 0;
}`,
    judge: {
      parse: function (t) {
        var n = t.int(1, 100000), a = t.ints(n, -2e9, 2e9);
        t.end();
        return a;
      },
      // 버그판은 int 뺄셈이 넘치는 것까지 흉내 낸다. 정렬 방식은 어느 브라우저에서나 같도록 삽입 정렬로 고정한다.
      buggy: function (a) { return sortWith(a, function (x, y) { return (x - y) | 0; }); },
      correct: function (a) { return sortWith(a, function (x, y) { return (x > y) - (x < y); }); },
    },
    bug: 8,
    fix: "    return (x > y) - (x < y);",
    wrong: [
      { code: "    return x < y;", why: "0이나 1만 돌려주고 음수는 돌려주지 않는다. qsort는 '앞이 더 작다'를 알 길이 없어서 순서가 엉망이 된다." },
      { code: "    return (long long)x - y;", why: "뺄셈은 넘치지 않지만, 돌려줄 때 다시 int로 잘린다. 40억 같은 값이 잘리면서 부호가 뒤집힌다." },
    ],
    hints: [
      "예제는 다 맞는데, 어떤 입력에서는 순서가 뒤집혀 나온다.",
      "정수 오버플로 문제다.",
      "x - y 의 결과는 언제나 int 안에 들어갈까?",
    ],
    explain:
      "비교 함수는 x가 y보다 앞이면 음수, 뒤면 양수를 돌려주면 된다. x - y 는 그 조건을 간단히 만족하는 것 같지만, 두 수가 멀리 떨어져 있으면 결과가 int 범위(약 ±21억)를 넘쳐 부호가 뒤집힌다. 문제의 범위에서는 차이가 40억까지 날 수 있다. (x > y) - (x < y) 는 빼지 않고 1, 0, -1 만 만들어서 넘칠 일이 없다.",
  },
  {
    subject: "알고리즘",
    lang: "c",
    goal: "제곱의 합",
    problem: {
      text: "정수 N개가 주어진다. 각 수를 제곱한 값을 모두 더한 합을 구하라.",
      input: "첫 줄에 N (1 ≤ N ≤ 100,000). 둘째 줄에 정수 N개. 각 정수의 절댓값은 100,000 이하.",
      output: "제곱의 합을 출력한다.",
      examples: [
        { in: "3\n1 2 3", out: "14" },
        { in: "2\n-10 300", out: "90100" },
      ],
    },
    code: String.raw`#include <stdio.h>

int main(void) {
    int n, x;
    long long sum = 0;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &x);
        sum += x * x;
    }
    printf("%lld\n", sum);
    return 0;
}`,
    judge: {
      parse: function (t) {
        var n = t.int(1, 100000), a = t.ints(n, -100000, 100000);
        t.end();
        return a;
      },
      buggy: function (a) {
        var sum = BigInt(0);
        a.forEach(function (x) { sum += BigInt(Math.imul(x, x)); });
        return String(sum);
      },
      correct: function (a) {
        var sum = BigInt(0);
        a.forEach(function (x) { sum += BigInt(x) * BigInt(x); });
        return String(sum);
      },
    },
    bug: 9,
    fix: "        sum += (long long)x * x;",
    wrong: [
      { code: "        sum += (long long)(x * x);", why: "괄호 안의 x * x 가 int로 먼저 계산돼서 이미 넘친 뒤에 바꾼다. 넘친 값이 그대로 더해진다." },
      { code: "        sum = sum + x * x;", why: "쓰는 모양만 다를 뿐 x * x 는 여전히 int끼리의 곱셈이다." },
    ],
    hints: [
      "예제는 다 맞는데, 어떤 입력에서는 답과 전혀 다른 값이 나온다.",
      "결과를 담는 변수는 충분히 크다. 문제는 계산하는 도중이다.",
      "x * x 는 어떤 자료형으로 계산될까?",
    ],
    explain:
      "sum을 long long으로 잡았으니 안전해 보이지만, x * x 는 int끼리의 곱셈이라 int로 계산된다. 100,000의 제곱은 100억이라 int 범위(약 21억)를 넘쳐 엉뚱한 값이 된다. 넘친 다음에 long long에 더해 봐야 소용없다. 곱하기 전에 한쪽을 (long long)으로 바꿔야 곱셈 자체가 long long으로 계산된다.",
  },
  {
    subject: "알고리즘",
    lang: "c",
    goal: "합이 X인 두 수",
    problem: {
      text: "서로 다른 양의 정수 N개가 오름차순으로 주어진다. 이 중 서로 다른 두 수를 골라 합이 X가 되는 경우가 몇 가지인지 구하라.",
      input: "첫 줄에 N과 X (1 ≤ N ≤ 100,000). 둘째 줄에 오름차순으로 정렬된 서로 다른 양의 정수 N개.",
      output: "합이 X인 두 수 쌍의 개수를 출력한다.",
      examples: [
        { in: "5 12\n1 3 5 7 9", out: "2" },
        { in: "4 5\n1 2 3 4", out: "2" },
      ],
    },
    code: String.raw`#include <stdio.h>

int a[100000];

int main(void) {
    int n, x, cnt = 0;
    scanf("%d %d", &n, &x);
    for (int i = 0; i < n; i++)
        scanf("%d", &a[i]);
    int l = 0, r = n - 1;
    while (l <= r) {
        int s = a[l] + a[r];
        if (s == x) {
            cnt++;
            l++;
            r--;
        } else if (s < x) {
            l++;
        } else {
            r--;
        }
    }
    printf("%d\n", cnt);
    return 0;
}`,
    judge: {
      parse: function (t) {
        var n = t.int(1, 100000), x = t.int(1, 2e9), a = t.ints(n, 1, 1e9);
        t.end();
        for (var i = 1; i < n; i++) if (a[i - 1] >= a[i]) t.fail("수는 서로 다르고 오름차순이어야 해.");
        return { a: a, x: x };
      },
      buggy: function (d) { return pairs(d, true); },
      correct: function (d) { return pairs(d, false); },
    },
    bug: 11,
    fix: "    while (l < r) {",
    wrong: [
      { code: "    while (l != r) {", why: "쌍을 찾아 l과 r이 동시에 움직이면 서로 엇갈려 지나칠 수 있다. 그러면 멈추지 않고 배열 밖까지 간다." },
      { code: "    while (l < r - 1) {", why: "바로 옆에 붙은 두 수는 확인하지 않는다. 1 2 에서 합 3을 찾으면 0이 나온다." },
    ],
    hints: [
      "예제는 다 맞는데, 어떤 입력에서는 쌍을 실제보다 많이 센다.",
      "같은 수를 두 번 쓰는 경우가 생긴다.",
      "l과 r이 같은 칸을 가리킬 때도 반복문 안에 들어갈까?",
    ],
    explain:
      "l == r 이면 두 포인터가 같은 수를 가리키는데, l <= r 조건은 그때도 반복을 돈다. 그래서 X가 어떤 수의 두 배이면(1 3 5 에서 X = 6 이면 3 + 3) 같은 수를 두 번 쓴 것까지 센다. 서로 다른 두 수만 세야 하므로 l < r 일 때만 돌아야 한다.",
  },
];
})();
