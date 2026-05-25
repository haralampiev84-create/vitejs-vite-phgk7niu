import { useState, useEffect } from "react";

const CATEGORIES = [
  { id: "food", label: "🛒 Храна", color: "#f97316" },
  { id: "transport", label: "🚗 Транспорт", color: "#3b82f6" },
  { id: "bills", label: "💡 Сметки", color: "#8b5cf6" },
  { id: "health", label: "💊 Здраве", color: "#ec4899" },
  { id: "entertainment", label: "🎬 Забавление", color: "#10b981" },
  { id: "clothing", label: "👕 Дрехи", color: "#f59e0b" },
  { id: "cafe", label: "☕ Кафе / Ресторант", color: "#84cc16" },
  { id: "other", label: "📦 Друго", color: "#6b7280" },
];

const MONTH_NAMES = [
  "Януари","Февруари","Март","Април","Май","Юни",
  "Юли","Август","Септември","Октомври","Ноември","Декември"
];

const now = new Date();
const STORAGE_KEY = `budget_${now.getFullYear()}_${now.getMonth()}`;

function fmt(n) {
  return n.toLocaleString("bg-BG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function App() {
  const [income, setIncome] = useState(0);
  const [incomeInput, setIncomeInput] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("food");
  const [filterCat, setFilterCat] = useState("all");
  const [view, setView] = useState("dashboard"); // dashboard | add | history
  const [editingIncome, setEditingIncome] = useState(false);
  const [flash, setFlash] = useState(false);

  // Load
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (saved.income) setIncome(saved.income);
      if (saved.incomeInput) setIncomeInput(saved.incomeInput);
      if (saved.expenses) setExpenses(saved.expenses);
    } catch {}
  }, []);

  // Save
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ income, incomeInput, expenses }));
  }, [income, incomeInput, expenses]);

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const balance = income - totalSpent;
  const pct = income > 0 ? Math.min((totalSpent / income) * 100, 100) : 0;

  function saveIncome() {
    const v = parseFloat(incomeInput.replace(",", "."));
    if (!isNaN(v) && v >= 0) { setIncome(v); setEditingIncome(false); }
  }

  function addExpense() {
    const v = parseFloat(amount.replace(",", "."));
    if (isNaN(v) || v <= 0) return;
    const newExp = {
      id: Date.now(),
      amount: v,
      note: note.trim() || CATEGORIES.find(c => c.id === category).label,
      category,
      date: new Date().toISOString(),
    };
    setExpenses(prev => [newExp, ...prev]);
    setAmount("");
    setNote("");
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
    setView("dashboard");
  }

  function deleteExpense(id) {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }

  const filtered = filterCat === "all" ? expenses : expenses.filter(e => e.category === filterCat);

  // Category totals
  const catTotals = CATEGORIES.map(c => ({
    ...c,
    total: expenses.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const balanceColor = balance < 0 ? "#ef4444" : balance < income * 0.15 ? "#f59e0b" : "#22c55e";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f13",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#e8e4df",
      paddingBottom: 80,
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a24 0%, #12121a 100%)",
        borderBottom: "1px solid #2a2a38",
        padding: "20px 20px 0",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: "#6b6b80", letterSpacing: 2, textTransform: "uppercase" }}>
              {MONTH_NAMES[now.getMonth()]} {now.getFullYear()}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#e8e4df" }}>Моят Бюджет</div>
          </div>
          <div style={{
            background: "#1e1e2e", border: "1px solid #2a2a38",
            borderRadius: 12, padding: "6px 14px", fontSize: 13, color: "#a0a0b8"
          }}>
            💰 {fmt(income)} лв.
            <button onClick={() => setEditingIncome(true)} style={{
              background: "none", border: "none", color: "#6b6b80", cursor: "pointer",
              marginLeft: 6, fontSize: 12
            }}>✏️</button>
          </div>
        </div>

        {/* Nav */}
        <div style={{ display: "flex", gap: 0, borderTop: "1px solid #2a2a38" }}>
          {[["dashboard","📊 Обзор"], ["history","📋 История"], ["add","+ Разход"]].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{
              flex: 1, padding: "12px 0", background: "none",
              border: "none", borderBottom: view === v ? "2px solid #f97316" : "2px solid transparent",
              color: view === v ? "#f97316" : "#6b6b80", fontWeight: view === v ? 700 : 400,
              fontSize: 13, cursor: "pointer", transition: "all .2s",
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 480, margin: "0 auto" }}>

        {/* Income modal */}
        {editingIncome && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
          }}>
            <div style={{
              background: "#1a1a24", borderRadius: 20, padding: 28,
              width: 300, border: "1px solid #2a2a38",
            }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>Месечен приход</div>
              <input
                autoFocus
                value={incomeInput}
                onChange={e => setIncomeInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && saveIncome()}
                placeholder="напр. 2500"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "#12121a", border: "1px solid #2a2a38",
                  borderRadius: 10, padding: "12px 14px",
                  color: "#e8e4df", fontSize: 18, outline: "none",
                }}
              />
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button onClick={() => setEditingIncome(false)} style={{
                  flex: 1, padding: "11px 0", borderRadius: 10,
                  background: "#12121a", border: "1px solid #2a2a38",
                  color: "#6b6b80", cursor: "pointer", fontSize: 14,
                }}>Отказ</button>
                <button onClick={saveIncome} style={{
                  flex: 1, padding: "11px 0", borderRadius: 10,
                  background: "#f97316", border: "none",
                  color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14,
                }}>Запази</button>
              </div>
            </div>
          </div>
        )}

        {/* === DASHBOARD === */}
        {view === "dashboard" && (
          <div>
            {/* Balance card */}
            <div style={{
              background: "linear-gradient(135deg, #1e1e2e, #16161f)",
              borderRadius: 20, padding: 24, marginBottom: 16,
              border: "1px solid #2a2a38",
              boxShadow: flash ? "0 0 0 2px #f97316" : "none",
              transition: "box-shadow .3s",
            }}>
              <div style={{ fontSize: 12, color: "#6b6b80", marginBottom: 6, letterSpacing: 1 }}>ОСТАТЪК ЗА МЕСЕЦА</div>
              <div style={{ fontSize: 42, fontWeight: 800, color: balanceColor, lineHeight: 1 }}>
                {fmt(balance)} <span style={{ fontSize: 18, fontWeight: 400 }}>лв.</span>
              </div>
              <div style={{ marginTop: 14, height: 8, background: "#2a2a38", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 99,
                  width: `${pct}%`,
                  background: pct > 85 ? "#ef4444" : pct > 60 ? "#f59e0b" : "#f97316",
                  transition: "width .6s ease",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "#6b6b80" }}>
                <span>Изразходвано: {fmt(totalSpent)} лв.</span>
                <span>{pct.toFixed(0)}%</span>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                ["Приход", fmt(income), "#22c55e"],
                ["Разходи", fmt(totalSpent), "#ef4444"],
                ["Транзакции", expenses.length, "#3b82f6"],
                ["Дневно ср.", income > 0 ? fmt(totalSpent / Math.max(now.getDate(), 1)) : "—", "#f59e0b"],
              ].map(([label, val, color]) => (
                <div key={label} style={{
                  background: "#1a1a24", borderRadius: 14, padding: "14px 16px",
                  border: "1px solid #2a2a38",
                }}>
                  <div style={{ fontSize: 11, color: "#6b6b80", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Category breakdown */}
            {catTotals.length > 0 && (
              <div style={{
                background: "#1a1a24", borderRadius: 18, padding: "18px 16px",
                border: "1px solid #2a2a38",
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: "#a0a0b8" }}>По категория</div>
                {catTotals.map(c => (
                  <div key={c.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13 }}>{c.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: c.color }}>{fmt(c.total)} лв.</span>
                    </div>
                    <div style={{ height: 4, background: "#2a2a38", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 99,
                        width: `${totalSpent > 0 ? (c.total / totalSpent) * 100 : 0}%`,
                        background: c.color, transition: "width .5s",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {expenses.length === 0 && (
              <div style={{
                textAlign: "center", padding: "40px 20px",
                color: "#4a4a5a", fontSize: 14,
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                Няма добавени разходи.<br />Натисни „+ Разход" за начало.
              </div>
            )}
          </div>
        )}

        {/* === ADD EXPENSE === */}
        {view === "add" && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Нов разход</div>

            {/* Amount */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: "#6b6b80", letterSpacing: 1, display: "block", marginBottom: 8 }}>СУМА (ЛВ.)</label>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "#1a1a24", border: "1px solid #2a2a38",
                  borderRadius: 14, padding: "16px 16px",
                  color: "#e8e4df", fontSize: 28, fontWeight: 700,
                  outline: "none",
                }}
              />
            </div>

            {/* Category */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: "#6b6b80", letterSpacing: 1, display: "block", marginBottom: 8 }}>КАТЕГОРИЯ</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setCategory(c.id)} style={{
                    padding: "11px 12px", borderRadius: 12, fontSize: 13, textAlign: "left",
                    background: category === c.id ? c.color + "22" : "#1a1a24",
                    border: category === c.id ? `1.5px solid ${c.color}` : "1px solid #2a2a38",
                    color: category === c.id ? c.color : "#a0a0b8",
                    cursor: "pointer", fontWeight: category === c.id ? 600 : 400,
                    transition: "all .15s",
                  }}>{c.label}</button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, color: "#6b6b80", letterSpacing: 1, display: "block", marginBottom: 8 }}>БЕЛЕЖКА (по избор)</label>
              <input
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="напр. Лидл, такси, кино..."
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "#1a1a24", border: "1px solid #2a2a38",
                  borderRadius: 12, padding: "13px 14px",
                  color: "#e8e4df", fontSize: 15, outline: "none",
                }}
              />
            </div>

            <button onClick={addExpense} disabled={!amount} style={{
              width: "100%", padding: "16px", borderRadius: 16,
              background: amount ? "#f97316" : "#2a2a38",
              border: "none", color: "#fff",
              fontWeight: 700, fontSize: 16, cursor: amount ? "pointer" : "not-allowed",
              transition: "background .2s",
            }}>
              Добави разход
            </button>
          </div>
        )}

        {/* === HISTORY === */}
        {view === "history" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>История</div>
              <span style={{ fontSize: 12, color: "#6b6b80" }}>{expenses.length} записа</span>
            </div>

            {/* Filter */}
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}>
              {[{ id: "all", label: "Всички" }, ...CATEGORIES].map(c => (
                <button key={c.id} onClick={() => setFilterCat(c.id)} style={{
                  padding: "7px 14px", borderRadius: 99, fontSize: 12, whiteSpace: "nowrap",
                  background: filterCat === c.id ? "#f97316" : "#1a1a24",
                  border: filterCat === c.id ? "none" : "1px solid #2a2a38",
                  color: filterCat === c.id ? "#fff" : "#a0a0b8",
                  cursor: "pointer", transition: "all .15s",
                }}>{c.label || c.id}</button>
              ))}
            </div>

            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#4a4a5a" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
                Няма резултати
              </div>
            )}

            {filtered.map(e => {
              const cat = CATEGORIES.find(c => c.id === e.category) || CATEGORIES.at(-1);
              const d = new Date(e.date);
              return (
                <div key={e.id} style={{
                  background: "#1a1a24", borderRadius: 14, padding: "14px 16px",
                  marginBottom: 10, border: "1px solid #2a2a38",
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: cat.color + "22",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18,
                  }}>
                    {cat.label.split(" ")[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {e.note}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b6b80", marginTop: 2 }}>
                      {d.toLocaleDateString("bg-BG")} · {d.toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: cat.color }}>
                      -{fmt(e.amount)} лв.
                    </div>
                    <button onClick={() => deleteExpense(e.id)} style={{
                      background: "none", border: "none", color: "#4a4a5a",
                      cursor: "pointer", fontSize: 12, marginTop: 2,
                    }}>🗑</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}