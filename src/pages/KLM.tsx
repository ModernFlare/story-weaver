import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus, Calculator, Smartphone, Info } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ── Операторы модели KLM для мобильных устройств ── */
interface Operator {
  code: string;
  name: string;
  nameRu: string;
  description: string;
  time: number | null; // null = user-defined (R(t))
  emoji: string;
}

const OPERATORS: Operator[] = [
  { code: "P", name: "Point", nameRu: "Указание", description: "Перемещение пальца от одной части экрана к элементу", time: 0.34, emoji: "👆" },
  { code: "T", name: "Tap", nameRu: "Касание", description: "Касание элемента на экране", time: 0.25, emoji: "👇" },
  { code: "D", name: "Drag", nameRu: "Перетаскивание", description: "Проведение пальцем по экрану без потери контакта", time: 0.44, emoji: "↔️" },
  { code: "F", name: "Flick", nameRu: "Стряхивание", description: "Резкое быстрое движение пальцем по экрану", time: 0.42, emoji: "⚡" },
  { code: "Z", name: "Zoom", nameRu: "Масштабирование", description: "Сведение / разведение двух пальцев (щипок / расширение)", time: 0.36, emoji: "🔍" },
  { code: "M", name: "Mental", nameRu: "Ментальная подготовка", description: "Время на мысленную подготовку к действию", time: 1.35, emoji: "🧠" },
  { code: "R", name: "Response", nameRu: "Время отклика системы", description: "Ожидание ответа системы (параметр t)", time: null, emoji: "⏳" },
];

type DistractionLevel = "none" | "light" | "heavy";
const DISTRACTION_MULTIPLIER: Record<DistractionLevel, number> = {
  none: 1,
  light: 1.06,
  heavy: 1.21,
};

interface TaskStep {
  id: string;
  operatorCode: string;
  customTime?: number; // for R(t)
  note: string;
}

/* ── Предустановленные задачи для нашего магазина ── */
interface PresetTask {
  name: string;
  steps: Omit<TaskStep, "id">[];
}

const PRESET_TASKS: PresetTask[] = [
  {
    name: "Добавить товар в корзину (Каталог → кнопка «В корзину»)",
    steps: [
      { operatorCode: "M", note: "Решение: какой товар добавить" },
      { operatorCode: "D", note: "Прокрутка каталога до нужного товара" },
      { operatorCode: "P", note: "Перемещение пальца к карточке товара" },
      { operatorCode: "T", note: "Касание кнопки «В корзину»" },
      { operatorCode: "R", customTime: 0.3, note: "Ожидание отклика системы" },
    ],
  },
  {
    name: "Оформить заказ (Корзина → подтверждение)",
    steps: [
      { operatorCode: "M", note: "Решение: перейти в корзину" },
      { operatorCode: "P", note: "Перемещение к иконке корзины в навбаре" },
      { operatorCode: "T", note: "Касание иконки корзины" },
      { operatorCode: "R", customTime: 0.5, note: "Загрузка страницы корзины" },
      { operatorCode: "M", note: "Просмотр содержимого корзины" },
      { operatorCode: "D", note: "Прокрутка до кнопки оформления" },
      { operatorCode: "P", note: "Указание на поле адреса доставки" },
      { operatorCode: "T", note: "Касание поля адреса" },
      { operatorCode: "M", note: "Обдумывание адреса доставки" },
      { operatorCode: "T", note: "Ввод адреса (серия касаний клавиатуры, усреднено)" },
      { operatorCode: "T", note: "Касание кнопки «Оформить заказ»" },
      { operatorCode: "R", customTime: 1.0, note: "Обработка заказа сервером" },
    ],
  },
  {
    name: "Войти в аккаунт (страница авторизации)",
    steps: [
      { operatorCode: "M", note: "Решение: войти в аккаунт" },
      { operatorCode: "P", note: "Перемещение к кнопке «Войти» в навбаре" },
      { operatorCode: "T", note: "Касание кнопки «Войти»" },
      { operatorCode: "R", customTime: 0.4, note: "Загрузка формы авторизации" },
      { operatorCode: "P", note: "Перемещение к полю email" },
      { operatorCode: "T", note: "Касание поля email" },
      { operatorCode: "M", note: "Вспоминание email" },
      { operatorCode: "T", note: "Ввод email (серия касаний)" },
      { operatorCode: "P", note: "Перемещение к полю пароля" },
      { operatorCode: "T", note: "Касание поля пароля" },
      { operatorCode: "M", note: "Вспоминание пароля" },
      { operatorCode: "T", note: "Ввод пароля (серия касаний)" },
      { operatorCode: "P", note: "Перемещение к кнопке входа" },
      { operatorCode: "T", note: "Касание кнопки «Войти»" },
      { operatorCode: "R", customTime: 0.8, note: "Проверка учётных данных" },
    ],
  },
  {
    name: "Отправить отзыв (страница обратной связи)",
    steps: [
      { operatorCode: "M", note: "Решение: оставить отзыв" },
      { operatorCode: "P", note: "Перемещение к навигации" },
      { operatorCode: "T", note: "Касание «Обратная связь»" },
      { operatorCode: "R", customTime: 0.3, note: "Загрузка страницы" },
      { operatorCode: "P", note: "Перемещение к полю имени" },
      { operatorCode: "T", note: "Касание поля имени" },
      { operatorCode: "T", note: "Ввод имени" },
      { operatorCode: "P", note: "Перемещение к полю сообщения" },
      { operatorCode: "T", note: "Касание поля сообщения" },
      { operatorCode: "M", note: "Обдумывание текста отзыва" },
      { operatorCode: "T", note: "Ввод сообщения" },
      { operatorCode: "P", note: "Перемещение к кнопке отправки" },
      { operatorCode: "T", note: "Касание кнопки «Отправить»" },
      { operatorCode: "R", customTime: 0.5, note: "Отправка сообщения" },
    ],
  },
];

let stepIdCounter = 0;
const genId = () => `step-${++stepIdCounter}`;

const KLM = () => {
  const [steps, setSteps] = useState<TaskStep[]>([]);
  const [distraction, setDistraction] = useState<DistractionLevel>("none");
  const [taskName, setTaskName] = useState("");

  const addStep = (operatorCode: string) => {
    setSteps(prev => [
      ...prev,
      { id: genId(), operatorCode, customTime: operatorCode === "R" ? 0.5 : undefined, note: "" },
    ]);
  };

  const removeStep = (id: string) => {
    setSteps(prev => prev.filter(s => s.id !== id));
  };

  const updateStep = (id: string, patch: Partial<TaskStep>) => {
    setSteps(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
  };

  const loadPreset = (preset: PresetTask) => {
    setTaskName(preset.name);
    setSteps(
      preset.steps.map(s => ({
        id: genId(),
        ...s,
      }))
    );
  };

  const clearAll = () => {
    setSteps([]);
    setTaskName("");
  };

  /* ── Расчёт ── */
  const { rawTime, totalTime, operatorSummary } = useMemo(() => {
    let raw = 0;
    const summary: Record<string, { count: number; totalTime: number }> = {};

    steps.forEach(step => {
      const op = OPERATORS.find(o => o.code === step.operatorCode)!;
      const t = op.time !== null ? op.time : (step.customTime ?? 0);
      raw += t;
      if (!summary[step.operatorCode]) {
        summary[step.operatorCode] = { count: 0, totalTime: 0 };
      }
      summary[step.operatorCode].count += 1;
      summary[step.operatorCode].totalTime += t;
    });

    const total = raw * DISTRACTION_MULTIPLIER[distraction];
    return { rawTime: raw, totalTime: total, operatorSummary: summary };
  }, [steps, distraction]);

  /* ── Формула ── */
  const formulaString = useMemo(() => {
    if (steps.length === 0) return "";
    const parts = steps.map(s => {
      if (s.operatorCode === "R") return `R(${s.customTime ?? "t"})`;
      return s.operatorCode;
    });
    let formula = parts.join(" + ");
    if (distraction !== "none") {
      formula = `(${formula}) × ${DISTRACTION_MULTIPLIER[distraction]}`;
    }
    return formula;
  }, [steps, distraction]);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* ── Заголовок ── */}
        <div className="text-center space-y-2 animate-fade-slide-up">
          <div className="flex items-center justify-center gap-2">
            <Smartphone className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              KLM-калькулятор
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Gesture-Level Model (Nyström, 2018) — количественный анализ интерфейса
            для мобильных устройств с сенсорным экраном
          </p>
        </div>

        {/* ── Справка по операторам ── */}
        <Accordion type="single" collapsible>
          <AccordionItem value="operators-info">
            <AccordionTrigger className="text-lg font-semibold">
              <span className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Справочник операторов
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {OPERATORS.map(op => (
                  <Card key={op.code} className="border-border/50">
                    <CardContent className="p-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{op.emoji}</span>
                        <Badge variant="outline" className="font-mono text-base">{op.code}</Badge>
                        <span className="font-semibold text-foreground">{op.nameRu}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{op.description}</p>
                      <p className="text-sm font-medium text-primary">
                        {op.time !== null ? `${op.time} сек` : "t (задаётся)"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                {/* Distraction */}
                <Card className="border-border/50">
                  <CardContent className="p-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📱</span>
                      <Badge variant="outline" className="font-mono text-base">X</Badge>
                      <span className="font-semibold text-foreground">Отвлечение</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Мультипликативный оператор: лёгкое +6%, сильное +21%</p>
                  </CardContent>
                </Card>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* ── Пресеты ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Готовые задачи (ФрешМаркет)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {PRESET_TASKS.map((p, i) => (
              <Button key={i} variant="outline" size="sm" onClick={() => loadPreset(p)}>
                {p.name.length > 45 ? p.name.slice(0, 45) + "…" : p.name}
              </Button>
            ))}
            {steps.length > 0 && (
              <Button variant="ghost" size="sm" className="text-destructive" onClick={clearAll}>
                Очистить
              </Button>
            )}
          </CardContent>
        </Card>

        {/* ── Конструктор задачи ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Конструктор задачи
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Название задачи (напр. «Добавить товар в корзину»)"
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              className="max-w-md"
            />

            {/* Добавление оператора */}
            <div className="flex flex-wrap gap-2">
              {OPERATORS.map(op => (
                <Button key={op.code} variant="secondary" size="sm" onClick={() => addStep(op.code)}>
                  <Plus className="h-3 w-3 mr-1" />
                  {op.emoji} {op.code} — {op.nameRu}
                </Button>
              ))}
            </div>

            {/* Таблица шагов */}
            {steps.length > 0 && (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead className="w-20">Код</TableHead>
                      <TableHead>Описание / заметка</TableHead>
                      <TableHead className="w-28 text-right">Время (с)</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {steps.map((step, idx) => {
                      const op = OPERATORS.find(o => o.code === step.operatorCode)!;
                      const time = op.time !== null ? op.time : (step.customTime ?? 0);
                      return (
                        <TableRow key={step.id}>
                          <TableCell className="font-mono text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {op.emoji} {op.code}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={step.note}
                              onChange={e => updateStep(step.id, { note: e.target.value })}
                              placeholder={op.description}
                              className="h-8 text-sm border-none shadow-none px-0 focus-visible:ring-0"
                            />
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {op.time !== null ? (
                              <span className="text-foreground">{op.time.toFixed(2)}</span>
                            ) : (
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                value={step.customTime ?? ""}
                                onChange={e => updateStep(step.id, { customTime: parseFloat(e.target.value) || 0 })}
                                className="h-8 w-20 text-right font-mono ml-auto"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeStep(step.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Отвлечение */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-foreground">Уровень отвлечения (X):</span>
              <Select value={distraction} onValueChange={(v) => setDistraction(v as DistractionLevel)}>
                <SelectTrigger className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без отвлечений (×1.00)</SelectItem>
                  <SelectItem value="light">Лёгкое отвлечение (×1.06)</SelectItem>
                  <SelectItem value="heavy">Сильное отвлечение (×1.21)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* ── Результаты ── */}
        {steps.length > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">
                Результаты анализа{taskName ? `: «${taskName}»` : ""}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Формула */}
              <div className="bg-card rounded-lg p-4 border">
                <p className="text-sm text-muted-foreground mb-1">Формула:</p>
                <p className="font-mono text-sm break-all text-foreground">{formulaString}</p>
              </div>

              {/* Сводка по операторам */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(operatorSummary).map(([code, data]) => {
                  const op = OPERATORS.find(o => o.code === code)!;
                  return (
                    <div key={code} className="bg-card rounded-lg p-3 border flex items-center gap-3">
                      <span className="text-2xl">{op.emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{op.nameRu} ({code})</p>
                        <p className="text-xs text-muted-foreground">
                          ×{data.count} = {data.totalTime.toFixed(2)} с
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Итого */}
              <div className="flex flex-wrap gap-6 items-end">
                <div>
                  <p className="text-sm text-muted-foreground">Базовое время</p>
                  <p className="text-2xl font-bold text-foreground font-mono">{rawTime.toFixed(2)} с</p>
                </div>
                {distraction !== "none" && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      С отвлечением (×{DISTRACTION_MULTIPLIER[distraction]})
                    </p>
                    <p className="text-2xl font-bold text-primary font-mono">{totalTime.toFixed(2)} с</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Итого</p>
                  <p className="text-3xl font-extrabold text-primary font-mono">{totalTime.toFixed(2)} с</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default KLM;
