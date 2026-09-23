// ================= 登录逻辑 =================
async function doLogin(e) {
    e.preventDefault(); // 阻止表单默认提交刷新页面

    const user = document.getElementById('user').value;
    const pw = document.getElementById('pw').value;
    const msgDom = document.getElementById('msg');
    const btn = document.getElementById('loginBtn');

    try {
        btn.disabled = true; // 防止 Enter 连按重复提交
        // 同源请求（由 Express 静态服务提供页面）
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pw })
        });

        const result = await response.json();

        if (response.ok) {
            showBalls(); // 登录成功：进入彩色球场景
            return;
        }

        msgDom.innerText = result.message;
        msgDom.style.color = 'red';
    } catch (error) {
        msgDom.innerText = "无法连接到服务器，请检查后端是否运行";
    } finally {
        btn.disabled = false;
    }
}

// ================= 彩色球逻辑 =================
const COLORS = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];
const balls = [0, 1, 2].map(i => document.getElementById('ball' + i));
let focusedIndex = 0;    // 当前焦点球下标
let ballsActive = false; // 是否已进入彩色球场景

// 给球涂色（索引存到 dataset，便于下次取"下一个颜色"）
function paintBall(ball, colorIndex) {
    const idx = ((colorIndex % COLORS.length) + COLORS.length) % COLORS.length;
    ball.dataset.colorIndex = idx;
    ball.style.backgroundColor = COLORS[idx];
    ball.style.color = COLORS[idx]; // 供焦点光晕 currentColor 使用
}

// 初始三球颜色错开：红 / 黄 / 蓝
balls.forEach((ball, i) => paintBall(ball, i * 2));

// 渲染焦点状态
function renderFocus() {
    balls.forEach((ball, i) => ball.classList.toggle('focused', i === focusedIndex));
}

// 登录成功后进入球场景
function showBalls() {
    ballsActive = true;
    document.querySelector('.card').style.display = 'none'; // 隐藏登录卡片
    document.getElementById('ballStage').style.display = 'block';
    focusedIndex = 0;
    renderFocus();
    // 移走输入框焦点，避免 Enter 再次触发表单提交
    if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
    }
}

// 全局监听 Enter：变色 -> 焦点切到下一个球（循环轮转）
document.addEventListener('keydown', (e) => {
    if (!ballsActive || e.key !== 'Enter') return;
    e.preventDefault();

    const ball = balls[focusedIndex];
    paintBall(ball, Number(ball.dataset.colorIndex) + 1); // 当前球换成下一个颜色

    focusedIndex = (focusedIndex + 1) % balls.length;     // 焦点轮转到下一个球
    renderFocus();
});

// 支持触屏/鼠标点击（手机上没有 Enter 键）：点击哪个球就给哪个球换色
balls.forEach((ball, i) => {
    ball.addEventListener('click', () => {
        if (!ballsActive) return;

        paintBall(ball, Number(ball.dataset.colorIndex) + 1); // 被点击的球换成下一个颜色
        focusedIndex = (i + 1) % balls.length;                // 焦点轮转到下一个球
        renderFocus();
    });
});
