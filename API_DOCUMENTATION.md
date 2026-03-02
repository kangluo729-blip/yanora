# API 文档

## 基础信息

- **Base URL**: `http://localhost:3001/api`
- **认证方式**: JWT Bearer Token
- **内容类型**: `application/json`

## 认证

所有需要认证的请求需要在 Header 中包含：
```
Authorization: Bearer <token>
```

---

## 1. 认证 API

### 1.1 用户注册

**POST** `/auth/register`

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应：**
```json
{
  "message": "注册成功",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "jwt_token"
}
```

---

### 1.2 用户登录

**POST** `/auth/login`

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应：**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "avatar_url": null
  },
  "token": "jwt_token"
}
```

---

### 1.3 获取当前用户

**GET** `/auth/me`

**需要认证：** ✅

**响应：**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "avatar_url": null
  }
}
```

---

### 1.4 用户登出

**POST** `/auth/logout`

**需要认证：** ✅

**响应：**
```json
{
  "message": "登出成功"
}
```

---

## 2. 管理员 API

### 2.1 管理员登录

**POST** `/admin/login`

**请求体：**
```json
{
  "email": "admin@yanora.com",
  "password": "admin123456"
}
```

**响应：**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@yanora.com",
    "role": "super_admin"
  },
  "token": "jwt_token"
}
```

---

### 2.2 获取管理员列表

**GET** `/admin/admins`

**需要认证：** ✅ (管理员)

**响应：**
```json
{
  "admins": [
    {
      "user_id": "uuid",
      "email": "admin@yanora.com",
      "role": "super_admin",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2.3 创建管理员

**POST** `/admin/admins`

**需要认证：** ✅ (超级管理员)

**请求体：**
```json
{
  "email": "newadmin@yanora.com",
  "password": "password123",
  "role": "admin"
}
```

**响应：**
```json
{
  "message": "管理员创建成功",
  "admin": {
    "user_id": "uuid",
    "email": "newadmin@yanora.com",
    "role": "admin"
  }
}
```

---

## 3. 预约 API

### 3.1 创建预约

**POST** `/bookings`

**请求体：**
```json
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "phone": "+86 138 0000 0000",
  "serviceType": "facial_contour",
  "services": [
    {
      "name": "鼻部整形",
      "price": 50000
    }
  ],
  "preferredDate": "2024-02-01",
  "preferredTime": "10:00",
  "message": "希望了解更多信息",
  "paymentMethod": "PayPal"
}
```

**响应：**
```json
{
  "message": "预约创建成功",
  "booking": {
    "id": "uuid",
    "name": "张三",
    "status": "pending",
    "total_amount": 50100,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 3.2 获取用户预约列表

**GET** `/bookings`

**需要认证：** ✅

**响应：**
```json
{
  "bookings": [
    {
      "id": "uuid",
      "name": "张三",
      "email": "zhangsan@example.com",
      "service_type": "facial_contour",
      "preferred_date": "2024-02-01",
      "status": "pending",
      "total_amount": 50100,
      "services": [
        {
          "service_name": "鼻部整形",
          "service_price": 50000
        }
      ]
    }
  ]
}
```

---

### 3.3 获取所有预约（管理员）

**GET** `/bookings/all`

**需要认证：** ✅ (管理员)

**查询参数：**
- `status` (可选): pending | confirmed | cancelled | completed

**响应：**
```json
{
  "bookings": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "张三",
      "email": "zhangsan@example.com",
      "phone": "+86 138 0000 0000",
      "service_type": "facial_contour",
      "preferred_date": "2024-02-01",
      "preferred_time": "10:00",
      "status": "pending",
      "payment_status": "pending",
      "total_amount": 50100,
      "created_at": "2024-01-01T00:00:00.000Z",
      "services": [...]
    }
  ]
}
```

---

### 3.4 更新预约状态

**PATCH** `/bookings/:id`

**需要认证：** ✅ (管理员)

**请求体：**
```json
{
  "status": "confirmed",
  "paymentStatus": "paid"
}
```

**响应：**
```json
{
  "message": "预约更新成功",
  "booking": {
    "id": "uuid",
    "status": "confirmed",
    "payment_status": "paid"
  }
}
```

---

### 3.5 删除预约

**DELETE** `/bookings/:id`

**需要认证：** ✅ (管理员)

**响应：**
```json
{
  "message": "预约删除成功"
}
```

---

## 4. 案例 API

### 4.1 获取简单案例

**GET** `/cases/simple`

**响应：**
```json
{
  "cases": [
    {
      "id": "uuid",
      "before_image_url": "/uploads/before.jpg",
      "after_image_url": "/uploads/after.jpg",
      "display_order": 1
    }
  ]
}
```

---

### 4.2 创建简单案例

**POST** `/cases/simple`

**需要认证：** ✅ (管理员)

**请求体：**
```json
{
  "beforeImageUrl": "/uploads/before.jpg",
  "afterImageUrl": "/uploads/after.jpg",
  "displayOrder": 1
}
```

**响应：**
```json
{
  "message": "案例创建成功",
  "case": {
    "id": "uuid",
    "before_image_url": "/uploads/before.jpg",
    "after_image_url": "/uploads/after.jpg"
  }
}
```

---

### 4.3 获取详细案例

**GET** `/cases/detailed`

**查询参数：**
- `category` (可选): facial_contour | body_sculpting | injection_lifting | dental | hair_transplant

**响应：**
```json
{
  "cases": [
    {
      "id": "uuid",
      "surgery_name": "鼻部整形",
      "before_image_url": "/uploads/before.jpg",
      "after_image_url": "/uploads/after.jpg",
      "before_features": ["鼻梁较低", "鼻翼较宽"],
      "after_features": ["鼻梁挺拔", "鼻翼精致"],
      "category": "facial_contour",
      "is_featured": true
    }
  ]
}
```

---

### 4.4 创建详细案例

**POST** `/cases/detailed`

**需要认证：** ✅ (管理员)

**请求体：**
```json
{
  "surgeryName": "鼻部整形",
  "beforeImageUrl": "/uploads/before.jpg",
  "afterImageUrl": "/uploads/after.jpg",
  "beforeFeatures": ["鼻梁较低", "鼻翼较宽"],
  "afterFeatures": ["鼻梁挺拔", "鼻翼精致"],
  "category": "facial_contour",
  "isFeatured": true
}
```

---

## 5. FAQ API

### 5.1 获取 FAQ 分类

**GET** `/faq/categories`

**响应：**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name_zh": "手术相关",
      "name_en": "Surgery Related",
      "display_order": 1
    }
  ]
}
```

---

### 5.2 获取 FAQ 问题

**GET** `/faq/questions`

**查询参数：**
- `categoryId` (可选): 分类 ID

**响应：**
```json
{
  "questions": [
    {
      "id": "uuid",
      "category_id": "uuid",
      "question_zh": "手术需要多长时间？",
      "answer_zh": "根据具体项目，通常需要2-4小时。",
      "display_order": 1
    }
  ]
}
```

---

## 6. 上传 API

### 6.1 上传单个图片

**POST** `/upload/image`

**需要认证：** ✅ (管理员)

**Content-Type**: `multipart/form-data`

**请求体：**
```
image: <file>
```

**响应：**
```json
{
  "message": "图片上传成功",
  "imageUrl": "/uploads/1234567890.jpg"
}
```

---

### 6.2 上传多个图片

**POST** `/upload/images`

**需要认证：** ✅ (管理员)

**Content-Type**: `multipart/form-data`

**请求体：**
```
images: <file[]>
```

**响应：**
```json
{
  "message": "图片上传成功",
  "imageUrls": [
    "/uploads/1234567890.jpg",
    "/uploads/1234567891.jpg"
  ]
}
```

---

## 错误响应

所有错误响应格式：

```json
{
  "error": "错误信息描述"
}
```

**HTTP 状态码：**
- `200` - 成功
- `201` - 创建成功
- `400` - 请求错误
- `401` - 未认证
- `403` - 权限不足
- `404` - 资源未找到
- `500` - 服务器错误

---

## 速率限制

- 普通用户: 100 请求/分钟
- 管理员: 200 请求/分钟

超过限制将返回 `429 Too Many Requests`

---

## 测试示例

### 使用 curl

```bash
# 用户登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# 获取案例（带认证）
curl -X GET http://localhost:3001/api/cases/simple \
  -H "Authorization: Bearer <token>"

# 上传图片
curl -X POST http://localhost:3001/api/upload/image \
  -H "Authorization: Bearer <token>" \
  -F "image=@/path/to/image.jpg"
```

### 使用 JavaScript

```javascript
// 登录
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
const token = data.token;

// 获取数据
const casesResponse = await fetch('http://localhost:3001/api/cases/simple', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const cases = await casesResponse.json();
```

---

**更新日期**: 2024-01-01  
**版本**: 1.0.0

