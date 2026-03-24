# Frontend (React + Vite + TypeScript)

Мобільне меню (QR) для вашого Flask бекенду.

## Вимоги

- Node.js 18+ (рекомендовано 20+)
- Запущений бекенд (за замовчуванням `http://127.0.0.1:5000`)

## Налаштування

1) Перейдіть у папку фронтенду:

```bash
cd frontend
```

2) Встановіть залежності:

```bash
npm install
```

3) Перевірте `.env`:

- `VITE_API_URL=http://127.0.0.1:5000`

## Запуск

```bash
npm run dev
```

Відкрийте:

- Customer меню: `http://localhost:5173/menu/1`
## Ендпоїнти, які використовує UI

- Public:
  - `GET /api/public/categories`
  - `GET /api/public/menu-items`
  - `GET /api/public/categories/<id>/menu-items`

## Білд для деплою (Netlify/Vercel)

```bash
npm run build
```

Артефакти будуть у `frontend/dist`.

