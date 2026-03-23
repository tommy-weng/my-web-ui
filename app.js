const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors'); // 新增
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// 解析 JSON 格式的请求体
app.use(express.json());
app.use(cors()); // 新增：允许所有来源访问，解决跨域问题

// 静态资源目录
const PUBLIC_DIR = path.join(__dirname, 'public');
app.use(express.static(PUBLIC_DIR));

// 简单的日志中间件
app.use((req, res, next) => {
    console.log(`收到请求: ${req.method} ${req.url}`);
    next();
});

// 上传文件保存目录
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        // 生成一个安全的落盘文件名：时间戳 + 随机数 + 原扩展名
        const ext = path.extname(file.originalname || '');
        const safeExt = ext.replace(/[^.a-zA-Z0-9]/g, '');
        const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
        cb(null, name);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    }
});


// 0. 首页：返回登录页
app.get('/', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'login.html'));
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

// 3. 实现一个 POST 接口：上传文件
// 使用 multipart/form-data，字段名为 file
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: '未收到文件字段 file' });
    }

    // 返回可用于下载的文件名
    res.json({
        message: '上传成功',
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        downloadUrl: `/api/download/${encodeURIComponent(req.file.filename)}`
    });
});

// 3.1 实现一个 POST 接口：上传多个文件
// 使用 multipart/form-data，字段名为 files（同名 key 可传多次）
app.post('/api/uploads', upload.array('files', 10), (req, res) => {
    const files = Array.isArray(req.files) ? req.files : [];
    if (files.length === 0) {
        return res.status(400).json({ message: '未收到文件字段 files' });
    }

    res.json({
        message: '批量上传成功',
        count: files.length,
        files: files.map(f => ({
            filename: f.filename,
            originalname: f.originalname,
            mimetype: f.mimetype,
            size: f.size,
            downloadUrl: `/api/download/${encodeURIComponent(f.filename)}`
        }))
    });
});

// 4. 实现一个 GET 接口：下载文件
// 防止路径穿越：只允许下载 uploads 目录下的单个文件名
app.get('/api/download/:filename', (req, res) => {
    const filename = req.params.filename;

    // 只取 basename，避免像 ../../xx 这种路径
    const safeName = path.basename(filename);
    const filePath = path.join(UPLOAD_DIR, safeName);

    // 确保最终路径仍在 UPLOAD_DIR 内（双保险）
    const resolvedBase = path.resolve(UPLOAD_DIR) + path.sep;
    const resolvedTarget = path.resolve(filePath);
    if (!resolvedTarget.startsWith(resolvedBase)) {
        return res.status(400).json({ message: '非法文件名' });
    }

    if (!fs.existsSync(resolvedTarget)) {
        return res.status(404).json({ message: '文件不存在' });
    }

    // 触发浏览器下载
    res.download(resolvedTarget, safeName);
});

// 统一处理 multer 抛出的错误（例如超过大小限制）
app.use((err, req, res, next) => {
    if (err && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: '文件过大（最大 50MB）' });
    }
    if (err) {
        console.error('发生错误:', err);
        return res.status(500).json({ message: '服务器内部错误' });
    }
    next();
});

app.listen(port, () => {
    console.log(`服务器已启动：http://localhost:${port}`);
});
