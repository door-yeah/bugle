// 버글(하루 한 버그) 문제 목록.
// 날짜 순서대로 하나씩 열리고, 끝까지 가면 처음으로 돌아간다.
// 문제를 추가하려면 배열 끝에 같은 모양으로 붙이면 된다.
//
//   subject : 화면에 보이는 과목 이름
//   lang    : "c" 또는 "sql" (색칠 방식)
//   goal    : 이 코드가 원래 하려던 일
//   code    : 버그가 심긴 코드. 버그는 반드시 한 줄에만 있어야 한다.
//   bug     : 버그가 있는 줄 번호 (1부터, 빈 줄도 센다)
//   fix     : 그 줄을 고친 모습
//   wrong   : 고치기 단계에 나올 오답 보기 2개. code 는 그럴듯하지만 틀린 수정, why 는 왜 틀렸는지
//   hints   : 틀릴 때마다 하나씩 열리는 힌트 3개 (증상, 종류, 결정적 단서)
//   explain : 끝난 뒤 보여줄 해설
//
// C 코드에 \n, \0 같은 역슬래시가 들어가므로 String.raw 를 쓴다.

window.PUZZLES = [
  {
    subject: "C 포인터",
    lang: "c",
    goal: "길이 n인 배열에서 가장 큰 값을 돌려준다.",
    code: String.raw`int max_of(const int *a, int n) {
    int best = a[0];
    for (int i = 1; i <= n; i++) {
        if (a[i] > best)
            best = a[i];
    }
    return best;
}`,
    bug: 3,
    fix: "    for (int i = 1; i < n; i++) {",
    wrong: [
      { code: "    for (int i = 0; i <= n; i++) {", why: "시작을 0으로 바꿔도 끝은 그대로라 여전히 a[n]을 읽는다." },
      { code: "    for (int i = 1; i < n - 1; i++) {", why: "이번엔 하나 덜 돈다. 마지막 칸 a[n-1]을 보지 않아서, 최댓값이 맨 끝에 있으면 틀린다." },
    ],
    hints: [
      "대부분 맞는 답이 나오는데, 가끔 배열에 없던 엄청 큰 값이 튀어나온다.",
      "배열 범위를 벗어난 읽기다.",
      "길이가 n인 배열의 마지막 칸은 몇 번일까?",
    ],
    explain:
      "길이가 n인 배열의 유효한 인덱스는 0부터 n-1까지다. 조건이 i <= n 이면 마지막에 a[n]을 읽는데, 이건 배열 바로 뒤의 남의 메모리다. 거기 든 값이 우연히 크면 그게 최댓값으로 나온다.",
  },
  {
    subject: "SQL",
    lang: "sql",
    goal: "상사가 없는 직원(최상위 관리자)을 부서 이름과 함께 찾는다.",
    code: String.raw`SELECT e.id, e.name, d.name AS dept
FROM employees e
JOIN departments d
  ON d.id = e.dept_id
WHERE e.manager_id = NULL
ORDER BY e.name;`,
    bug: 5,
    fix: "WHERE e.manager_id IS NULL",
    wrong: [
      { code: "WHERE e.manager_id == NULL", why: "==도 결국 값 비교라 NULL과 비교하면 똑같이 UNKNOWN이 된다." },
      { code: "WHERE e.manager_id = 'NULL'", why: "이건 'NULL'이라는 네 글자 문자열과 비교하는 것이다. 값이 없다는 뜻의 NULL과는 다르다." },
    ],
    hints: [
      "에러는 안 나는데 결과가 항상 0행이다.",
      "NULL을 다루는 방식이 틀렸다.",
      "NULL은 '모르는 값'이라 무엇과 = 로 비교해도 참이 되지 않는다.",
    ],
    explain:
      "SQL에서 NULL과의 = 비교는 참도 거짓도 아닌 UNKNOWN이 되고, WHERE는 참인 행만 통과시킨다. 그래서 manager_id가 실제로 NULL인 행조차 걸러진다. NULL인지 물을 때는 IS NULL을 써야 한다.",
  },
  {
    subject: "동기화",
    lang: "c",
    goal: "소비자 스레드 여러 개가 count를 하나씩 가져간다. count는 음수가 되면 안 된다.",
    code: String.raw`void *producer(void *arg) {
    pthread_mutex_lock(&m);
    count++;
    pthread_cond_signal(&cv);
    pthread_mutex_unlock(&m);
    return NULL;
}

void *consumer(void *arg) {
    pthread_mutex_lock(&m);
    if (count == 0)
        pthread_cond_wait(&cv, &m);
    count--;
    pthread_mutex_unlock(&m);
    return NULL;
}`,
    bug: 11,
    fix: "    while (count == 0)",
    wrong: [
      { code: "    if (count <= 0)", why: "범위만 넓혔을 뿐 여전히 한 번만 검사한다. 깨어난 뒤 다시 확인하지 않는 문제는 그대로다." },
      { code: "    while (count != 0)", why: "조건이 반대가 됐다. 가져갈 게 있을 때 기다리고, 없을 때 빼 버린다." },
    ],
    hints: [
      "소비자가 여럿일 때 가끔 count가 -1이 된다.",
      "조건 변수를 기다리는 방식이 틀렸다.",
      "wait에서 깨어났다고 해서 조건이 아직 참이라는 보장은 없다.",
    ],
    explain:
      "pthread_cond_wait에서 깨어난 뒤 락을 다시 잡기까지 틈이 있어서, 그 사이에 다른 소비자가 count를 먼저 가져갈 수 있다. 이유 없이 깨어나는 경우(spurious wakeup)도 있다. if는 한 번만 검사하므로 count가 0인데도 빼 버린다. 깨어날 때마다 조건을 다시 확인하도록 while로 감싸야 한다.",
  },
  {
    subject: "C 포인터",
    lang: "c",
    goal: "문자열 s를 새로 할당한 메모리에 복사해서 돌려준다.",
    code: String.raw`char *copy_str(const char *s) {
    size_t n = strlen(s);
    char *p = malloc(n);
    if (p == NULL)
        return NULL;
    strcpy(p, s);
    return p;
}`,
    bug: 3,
    fix: "    char *p = malloc(n + 1);",
    wrong: [
      { code: "    char *p = malloc(sizeof(s));", why: "sizeof(s)는 문자열 길이가 아니라 포인터 크기(보통 8바이트)다. 긴 문자열이면 한참 모자란다." },
      { code: "    char *p = malloc(sizeof(char) * n);", why: "sizeof(char)는 1이라 원래 코드와 똑같이 n바이트다. 널 문자 자리는 여전히 없다." },
    ],
    hints: [
      "보통은 잘 돌아가다가 엉뚱한 곳에서 힙이 깨졌다며 죽는다.",
      "버퍼가 1바이트 모자란다.",
      "strlen은 문자열 끝의 '\\0'을 세지 않는다.",
    ],
    explain:
      "strlen은 널 문자를 뺀 길이를 돌려주는데, strcpy는 널 문자까지 n+1바이트를 쓴다. n바이트만 할당하면 마지막 1바이트가 할당 영역 밖에 쓰인다. 당장은 티가 안 나다가 나중에 힙이 망가진 채로 발견되는 전형적인 버그다.",
  },
  {
    subject: "SQL",
    lang: "sql",
    goal: "고객별로 결제 완료(paid)된 주문 수를 센다. 주문이 없는 고객도 0으로 나와야 한다.",
    code: String.raw`SELECT c.name, COUNT(o.id) AS paid
FROM customers c
LEFT JOIN orders o
  ON o.customer_id = c.id
WHERE o.status = 'paid'
GROUP BY c.id, c.name
ORDER BY paid DESC;`,
    bug: 5,
    fix: "  AND o.status = 'paid'",
    wrong: [
      { code: "WHERE o.status = 'paid' OR o.status IS NULL", why: "주문이 아예 없는 고객은 살아나지만, 결제 안 된 주문만 있는 고객은 여전히 사라진다." },
      { code: "  AND o.status IS NOT NULL", why: "고객은 모두 남지만 결제 여부를 가리지 않아서, 결제 안 된 주문까지 세어 버린다." },
    ],
    hints: [
      "결제한 주문이 하나도 없는 고객이 결과에서 통째로 사라진다.",
      "LEFT JOIN이 사실상 INNER JOIN처럼 동작하고 있다.",
      "짝이 없는 고객의 o.status는 NULL인데, 그 행은 어디서 걸러질까?",
    ],
    explain:
      "LEFT JOIN은 짝이 없는 고객을 o 쪽 컬럼이 전부 NULL인 행으로 남겨 둔다. 그런데 WHERE o.status = 'paid'가 그 NULL 행을 다시 걸러 버려서 LEFT JOIN의 의미가 사라진다. 조건을 ON 절로 옮기면 '결제된 주문만 붙이되 고객은 모두 남긴다'가 된다.",
  },
  {
    subject: "동기화",
    lang: "c",
    goal: "잔액이 충분하면 출금하고 0을, 부족하면 -1을 돌려준다. 여러 스레드가 동시에 불러도 안전해야 한다.",
    code: String.raw`int withdraw(Account *acc, int amt) {
    pthread_mutex_lock(&acc->m);
    if (acc->balance < amt)
        return -1;
    acc->balance -= amt;
    pthread_mutex_unlock(&acc->m);
    return 0;
}`,
    bug: 4,
    fix: "        { pthread_mutex_unlock(&acc->m); return -1; }",
    wrong: [
      { code: "        { return -1; pthread_mutex_unlock(&acc->m); }", why: "return 뒤에 있는 코드는 실행되지 않는다. 락은 여전히 안 풀린다." },
      { code: "        { pthread_mutex_destroy(&acc->m); return -1; }", why: "락을 푸는 게 아니라 없애 버린다. 잠긴 뮤텍스를 destroy하는 건 정의되지 않은 동작이고, 이후 계좌를 쓸 수 없게 된다." },
    ],
    hints: [
      "잔액 부족이 한 번 난 뒤로 그 계좌를 쓰는 스레드가 전부 멈춘다.",
      "락을 풀지 않고 빠져나가는 길이 있다.",
      "함수가 끝나는 지점은 두 곳이다. 둘 다 unlock을 지나갈까?",
    ],
    explain:
      "잔액이 부족하면 락을 쥔 채로 return해 버린다. 그 뒤로 같은 계좌의 락을 잡으려는 스레드는 영원히 기다린다. 빠져나가는 모든 경로에서 unlock이 불려야 한다. 실무에서는 반환값을 변수에 담아 두고 함수 끝 한 곳에서만 unlock하는 식으로 이런 실수를 막는다.",
  },
  {
    subject: "C 포인터",
    lang: "c",
    goal: "점수 개수를 입력받고, 그만큼 점수를 읽어 배열에 채운다.",
    code: String.raw`int read_scores(int *scores, int max) {
    int n;
    printf("how many? ");
    scanf("%d", n);
    if (n > max)
        n = max;
    for (int i = 0; i < n; i++)
        scanf("%d", &scores[i]);
    return n;
}`,
    bug: 4,
    fix: '    scanf("%d", &n);',
    wrong: [
      { code: "    scanf(\"%d\", *n);", why: "n은 포인터가 아니라 int라서 *n은 컴파일조차 되지 않는다." },
      { code: "    scanf(\"%d\", &max);", why: "주소를 넘기긴 했지만 엉뚱한 변수다. 입력이 max에 들어가고 n은 초기화되지 않은 채로 쓰인다." },
    ],
    hints: [
      "개수를 입력하자마자 세그폴트로 죽는다.",
      "값을 넘겨야 할 곳과 주소를 넘겨야 할 곳이 뒤바뀌었다.",
      "scanf 두 줄을 나란히 놓고 비교해 보자.",
    ],
    explain:
      "scanf는 읽은 값을 써넣을 주소를 받아야 한다. n을 그대로 넘기면 초기화도 안 된 n의 값을 주소로 착각하고 거기에 쓰려다 죽는다. 아래쪽 scanf는 &scores[i]로 주소를 제대로 넘기고 있다.",
  },
  {
    subject: "SQL",
    lang: "sql",
    goal: "컴퓨터학부(CSE)나 전자공학부(EE)의 4학년 중에서 학점 상위 10명을 뽑는다.",
    code: String.raw`SELECT name, dept, gpa
FROM students
WHERE year = 4
  AND dept = 'CSE' OR dept = 'EE'
ORDER BY gpa DESC
LIMIT 10;`,
    bug: 4,
    fix: "  AND (dept = 'CSE' OR dept = 'EE')",
    wrong: [
      { code: "  AND dept = 'CSE' AND dept = 'EE'", why: "한 학생의 학부가 동시에 CSE이면서 EE일 수는 없어서 결과가 0행이 된다." },
      { code: "  OR dept = 'CSE' OR dept = 'EE'", why: "4학년 전부에 두 학부의 전 학년까지 통과한다. 조건이 오히려 더 느슨해졌다." },
    ],
    hints: [
      "전자공학부 1학년이 결과에 섞여 나온다.",
      "논리 연산자의 우선순위 문제다.",
      "AND는 OR보다 먼저 묶인다. 곱셈과 덧셈처럼.",
    ],
    explain:
      "AND가 OR보다 우선순위가 높아서 조건이 (year = 4 AND dept = 'CSE') OR dept = 'EE'로 해석된다. 그래서 전자공학부는 학년과 상관없이 전부 통과한다. OR 쪽을 괄호로 묶어야 한다.",
  },
  {
    subject: "동기화",
    lang: "c",
    goal: "스레드 4개를 만들고, 각자 자기 번호(0, 1, 2, 3)를 한 번씩 출력한다.",
    code: String.raw`void *run(void *arg) {
    int id = *(int *)arg;
    printf("worker %d\n", id);
    return NULL;
}

int main(void) {
    pthread_t t[4];
    int ids[4];
    for (int i = 0; i < 4; i++) {
        ids[i] = i;
        pthread_create(&t[i], NULL,
                       run, &i);
    }
    for (int i = 0; i < 4; i++)
        pthread_join(t[i], NULL);
    return 0;
}`,
    bug: 13,
    fix: "                       run, &ids[i]);",
    wrong: [
      { code: "                       run, ids);", why: "배열 이름은 첫 칸의 주소라, 네 스레드 모두 ids[0]을 읽어 0만 출력한다." },
      { code: "                       run, &t[i]);", why: "스레드마다 다른 주소이긴 하지만 거기 든 건 번호가 아니라 스레드 핸들이다. 엉뚱한 값을 int로 읽는다." },
    ],
    hints: [
      "같은 번호가 두 번 찍히거나 4 같은 엉뚱한 번호가 나온다. 돌릴 때마다 결과가 다르다.",
      "스레드 여러 개가 변수 하나를 함께 보고 있다.",
      "새 스레드가 arg를 읽는 시점에 i는 아직 그 값일까?",
    ],
    explain:
      "네 스레드 모두 같은 변수 i의 주소를 받는다. 새 스레드가 *arg를 읽기 전에 main의 반복문이 i를 바꿔 버리면 엉뚱한 번호를 읽고, 반복문이 끝난 뒤에 읽으면 이미 사라진 변수를 읽게 된다. 번호를 담아 두려고 ids 배열까지 만들어 놓고는 정작 넘길 때 &i를 썼다. 스레드마다 따로 보관된 칸인 &ids[i]를 넘겨야 한다.",
  },
  {
    subject: "C 포인터",
    lang: "c",
    goal: "문자열 s에 들어 있는 모음의 개수를 세어 *n에 담는다.",
    code: String.raw`void vowels(const char *s, int *n) {
    *n = 0;
    for (; *s != '\0'; s++) {
        if (strchr("aeiou", *s))
            *n++;
    }
}`,
    bug: 5,
    fix: "            (*n)++;",
    wrong: [
      { code: "            *(n++);", why: "괄호만 쳤을 뿐 원래 코드와 뜻이 완전히 같다. 여전히 포인터가 증가한다." },
      { code: "            *++n;", why: "포인터를 먼저 옮기고 그 자리를 읽기만 한다. 값은 하나도 늘지 않는다." },
    ],
    hints: [
      "모음이 몇 개든 결과가 항상 0이다.",
      "연산자 우선순위 때문에 엉뚱한 것이 증가한다.",
      "++가 붙는 대상은 '가리키는 값'일까, '포인터 자신'일까?",
    ],
    explain:
      "후위 ++는 *보다 먼저 묶이므로 *n++는 *(n++)다. 값이 아니라 포인터가 다음 칸으로 넘어가고, 읽어 온 값은 그냥 버려진다. 원래 변수는 0 그대로 남고, 포인터는 점점 남의 메모리를 가리키게 된다. (*n)++로 괄호를 쳐야 한다.",
  },
];
