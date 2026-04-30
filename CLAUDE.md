# CLAUDE.md — EDV Time Calculator

## Проект

Внутренний инструмент создания заявок на выполнение работ и отчетов выполненных работ.  
Деплой: https://lutsdm.github.io/rechner/

---

## Технологии

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React hooks** — логика вынесена в `hooks/`
- PDF-генерация — см. `report/`

---

## Команды

```bash
npm run dev       # локальный дев-сервер
npm run build     # production-сборка
npm run lint      # ESLint проверка
```

---

## Структура проекта

```
app/
  components/
    time/
      blocks/           # крупные блоки UI (один блок = одна секция формы)
        ActionsBlock        # кнопки действий
        ArbeitszeitBlock    # рабочее время (Von / Bis)
        CustomerModal       # данные клиента
        EmployeesBlock      # выбор сотрудников
        HeaderBlock         # шапка
        LineItemsModal      # позиции заказа
        OrderDetailsBlock   # детали заказа
        OrderDetailsModal   # модалка деталей
        PasswordModal       # защита паролем
        ReportSummaryBlock  # итоговый отчёт
        TravelTimeBlock     # время в дороге (Abfahrt / Ankunft)
      hooks/            # вся бизнес-логика — только здесь
        useEmployeesSelection
        useOrderFormPdfDownload
        usePdfDownload
        usePriceCalculation   # расчёт стоимости
        useTimeCalculation    # расчёт времени
        useTimeRange
      lib/              # вспомогательные утилиты
      report/           # генерация PDF и отчётов
        DocumentPreview
        orderFormAgbContent
        OrderFormPdf
        OrderFormReport
        ServiceReport
        ServiceReportPdf
      Signature/        # подпись клиента
        SignatureModal
        SignaturePad
      ui/               # мелкие переиспользуемые компоненты
        ReportRow
        TimeBlock
        TimeRow
      TimeCalculator.tsx  # корневой компонент
  types/                # TypeScript типы
  globals.css
  layout.tsx
  page.tsx
```

---

## Архитектурные правила

- **Вся бизнес-логика — только в `hooks/`**, не в компонентах
- **Компоненты** — только отображение и вызов хуков
- **`blocks/`** — крупные секции формы, каждый отвечает за свою область
- **`ui/`** — мелкие переиспользуемые элементы без логики
- **`report/`** — не трогать без явной задачи на PDF/отчёты
- **`types/`** — все TypeScript интерфейсы и типы централизованно

---

## Бизнес-логика (не нарушать!)

### Расчёт оплаты (`usePriceCalculation`)
- Единый почасовой тариф для рабочего времени и времени в дороге
- Расчёт **поминутный**, без округления промежуточных значений
- Формула: `(рабочие минуты + минуты в дороге) × (тариф / 60)`
- Округление **только итоговой суммы** до 2 знаков

### Валидация времени (`useTimeCalculation`, `useTimeRange`)
- Начало работы < Конец работы
- Отправление ≤ Прибытие
- Начало работы не раньше Прибытия
- Отправление не позже Конца работы
- Поездка **опциональна** — валидировать только если поля заполнены

### UI
- Секунды не отображаются (только часы:минуты)
- Одна дата на весь рабочий день
- Mobile-first layout

---

## Требования к коду

- **TypeScript строго** — без `any`, типы в `types/`
- **Минимальные изменения** — трогай только то, что нужно для задачи
- **Без side effects** — изменение одного блока не ломает другие
- Tailwind-классы предпочтительнее кастомного CSS
- Немецкий язык в UI — существующие тексты не менять без задачи

---

## Частые ошибки (дополняй по мере работы)

- Не округлять промежуточные минуты — только итог
- Валидацию поездки проверять только если поля заполнены
- Логику не писать внутри компонентов — выносить в хуки
- При изменении типов — проверить все места использования через TypeScript
