# TODO应用后端系统

这是一个使用Java和Spring Boot开发的TODO应用后端系统，提供用户管理、任务管理、笔记管理、日历任务管理和专注历史管理等功能。

## 技术栈

- Java 11
- Spring Boot 3.2.0
- Spring Security
- JWT
- Spring Data JPA
- MySQL

## 功能特性

- 用户注册和登录
- 任务的创建、读取、更新和删除
- 笔记的创建、读取、更新和删除
- 日历任务的创建、读取、更新和删除
- 专注历史的创建和读取
- JWT认证和授权

## 目录结构

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── todoapp/
│   │   │           └── backend/
│   │   │               ├── TodoAppApplication.java       # 应用主类
│   │   │               ├── controller/                    # 控制器
│   │   │               ├── model/                        # 数据模型
│   │   │               ├── repository/                   # 数据仓库
│   │   │               └── security/                     # 安全相关
│   │   └── resources/
│   │       └── application.properties                   # 配置文件
│   └── test/                                             # 测试代码
└── pom.xml                                               # Maven配置文件
```

## 环境要求

- JDK 11或更高版本
- Maven 3.6.0或更高版本
- MySQL 8.0或更高版本

## 运行步骤

1. **创建数据库**
   - 在MySQL中创建一个名为`todoapp`的数据库
   - 确保数据库用户有足够的权限

2. **配置数据库连接**
   - 修改`src/main/resources/application.properties`文件中的数据库连接信息

3. **构建项目**
   ```bash
   mvn clean package
   ```

4. **运行应用**
   ```bash
   java -jar target/backend-1.0.0.jar
   ```

5. **访问API**
   - 应用将在`http://localhost:8080/api`上运行

## API接口

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 任务接口

- `GET /api/tasks` - 获取所有任务
- `GET /api/tasks/type/{type}` - 按类型获取任务
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/{id}` - 更新任务
- `DELETE /api/tasks/{id}` - 删除任务

### 笔记接口

- `GET /api/notes` - 获取所有笔记
- `POST /api/notes` - 创建笔记
- `PUT /api/notes/{id}` - 更新笔记
- `DELETE /api/notes/{id}` - 删除笔记

### 日历任务接口

- `GET /api/calendar` - 获取所有日历任务
- `GET /api/calendar/date/{date}` - 按日期获取日历任务
- `POST /api/calendar` - 创建日历任务
- `PUT /api/calendar/{id}` - 更新日历任务
- `DELETE /api/calendar/{id}` - 删除日历任务

### 专注历史接口

- `GET /api/focus` - 获取所有专注历史
- `POST /api/focus` - 创建专注历史

## 注意事项

- 所有非认证接口都需要在请求头中包含`Authorization: Bearer {token}`
- 数据库连接信息需要根据实际环境进行修改
- 生产环境中需要修改JWT密钥为更安全的值
