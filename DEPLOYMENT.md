# 部署指南 - 手机对比工具

## 🎯 问题已解决

您遇到的问题已经修复！原来的项目使用了绝对路径，导致下载后无法正常工作。现在所有文件都使用相对路径，可以直接使用。

## 📁 项目文件结构

```
phone-comparison-tool/
├── index.html              # 主页面（修复了路径问题）
├── style.css               # 样式文件
├── script.js               # JavaScript功能文件（使用相对路径）
├── data/
│   └── all_phones_unified.json  # 手机数据文件（92款手机）
├── README.md               # 详细使用说明
└── test.html               # 数据加载测试页面
```

## 🚀 使用方法

### 方法一：直接打开（推荐）

1. **下载整个 `phone-comparison-tool` 文件夹**
2. **双击 `index.html` 文件**
3. **在浏览器中打开**

### 方法二：本地服务器（如果遇到CORS问题）

```bash
# 进入项目目录
cd phone-comparison-tool

# 启动Python服务器
python3 -m http.server 8080

# 或使用Node.js服务器
npx serve .

# 然后访问 http://localhost:8080
```

## ✅ 修复内容

1. **文件路径修复**：所有文件引用都使用相对路径
2. **数据路径修复**：JavaScript中的数据加载路径已修正
3. **项目结构优化**：创建了完整的独立项目目录
4. **测试工具**：添加了 `test.html` 用于验证数据加载

## 🔧 故障排除

### 如果仍然无法加载数据：

1. **检查文件完整性**：确保 `data/all_phones_unified.json` 文件存在
2. **使用测试页面**：打开 `test.html` 查看详细错误信息
3. **使用本地服务器**：避免浏览器安全限制

### 如果功能不正常：

1. **检查浏览器控制台**：按F12查看错误信息
2. **刷新页面**：清除缓存后重新加载
3. **尝试不同浏览器**：确保JavaScript支持

## 🌐 部署到网站

### 选项1：独立部署
将整个 `phone-comparison-tool` 文件夹上传到你的网站服务器

### 选项2：集成到现有网站
- 复制 `index.html` 内容到你的页面
- 复制 `style.css` 和 `script.js` 文件
- 保持 `data` 目录结构

## 📊 数据说明

- **总机型数**：92款
- **品牌覆盖**：华为、荣耀、小米、OPPO、vivo、iQOO、一加、realme
- **数据格式**：标准JSON格式，易于更新
- **本地存储**：用户添加的数据保存在浏览器本地

## 🛠️ 自定义修改

### 更新手机数据：
1. 替换 `data/all_phones_unified.json` 文件
2. 保持JSON格式结构不变
3. 刷新页面即可

### 修改样式：
1. 编辑 `style.css` 文件
2. 浏览器会自动应用更改

### 添加功能：
1. 编辑 `script.js` 文件
2. 修改 `index.html` 添加新元素

---

**现在您可以下载整个 `phone-comparison-tool` 文件夹并正常使用了！** 🎉