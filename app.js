const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors'); // 新增

// 解析 JSON 格式的请求体
app.use(express.json());
app.use(cors()); // 新增：允许所有来源访问，解决跨域问题

// 简单的日志中间件
app.use((req, res, next) => {
    console.log(`收到请求: ${req.method} ${req.url}`);
    next();
});


// 0. 实现一个 GET 接口：显示标题
app.get('/', (req, res) => {
    res.send('<h1>欢迎来到我的第一个 Express 服务器！</h1>');
});

// 1. 实现一个 GET 接口：获取数据
app.get('/api/user', (req, res) => {
    res.json({
        name: "Gemini",
        role: "AI Assistant",
        status: "Online"
    });
});

// 2. 实现一个 POST 接口：提交数据
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === '123456') {
        res.send({ message: "登录成功！" });
    } else {
        res.status(401).send({ message: "用户名或密码错误" });
    }
});

app.listen(port, () => {
    console.log(`服务器已启动：http://localhost:${port}`);
});
