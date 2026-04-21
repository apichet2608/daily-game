import { useState, useEffect, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";

const API_BASE = "http://127.0.0.1:3000/api/nest-dx/glass-mask/Film";

interface FilmProc {
  id: string;
  create_date: string;
  proc: string;
  update_date: string;
}

type SortKey = keyof FilmProc;
type SortDir = "asc" | "desc";

// ─── Icons ─────────────────────────────────────────────────────────────────────
const IconRefresh = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);
const IconPlus = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconEdit = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const IconSort = ({ active, dir }: { active: boolean; dir: SortDir }) => (
  <span className={`ml-1 text-[10px] ${active ? "text-[#89b4fa]" : "text-[#45475a]"}`}>
    {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
  </span>
);

export default function FilmProcCrud() {
  const [data, setData] = useState<FilmProc[]>([]);
  const [loading, setLoading] = useState(false);
  const [procInput, setProcInput] = useState("");
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/smart_dx_sgmo_film_request_proc_get`);
      if (res.data?.status === "OK") {
        setData(res.data.data ?? []);
      } else {
        setData([]);
      }
    } catch {
      showToast("Failed to fetch data from server", "err");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (showForm) setTimeout(() => inputRef.current?.focus(), 80);
  }, [showForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!procInput.trim()) return;
    try {
      if (editingId) {
        await axios.post(`${API_BASE}/smart_dx_sgmo_film_request_proc_put`, {
          id: Number(editingId),
          proc: procInput,
        });
        showToast(`Updated proc → "${procInput}"`);
      } else {
        await axios.post(`${API_BASE}/smart_dx_sgmo_film_request_proc_post`, {
          proc: procInput,
        });
        showToast(`Inserted proc → "${procInput}"`);
      }
      setProcInput("");
      setEditingId(null);
      setShowForm(false);
      fetchData();
    } catch {
      showToast("Error: Operation failed", "err");
    }
  };

  const handleEdit = (item: FilmProc) => {
    setEditingId(item.id);
    setProcInput(item.proc);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setProcInput("");
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.post(`${API_BASE}/smart_dx_sgmo_film_request_proc_delete`, {
        id: Number(id),
      });
      showToast(`Deleted row ID: ${id}`);
      setDeleteConfirm(null);
      if (selectedId === id) setSelectedId(null);
      fetchData();
    } catch {
      showToast("Error: Delete failed", "err");
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = data
    .filter((row) => row.proc.toLowerCase().includes(search.toLowerCase()) || row.id.includes(search))
    .sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const selectedRow = data.find((d) => d.id === selectedId);

  const thClass = "px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[#6c7086] select-none cursor-pointer hover:text-[#a6adc8] whitespace-nowrap";

  return (
    <div className="flex flex-col h-full p-4 gap-3">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-xs font-semibold shadow-lg border transition-all ${
          toast.type === "ok"
            ? "bg-[#a6e3a1]/15 text-[#a6e3a1] border-[#a6e3a1]/30"
            : "bg-[#f38ba8]/15 text-[#f38ba8] border-[#f38ba8]/30"
        }`}>
          {toast.type === "ok" ? "✔" : "✖"} {toast.msg}
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center">
          <div className="bg-[#1e1e2e] border border-[#f38ba8]/40 rounded-xl p-6 w-80 shadow-2xl">
            <div className="text-sm font-bold text-[#f38ba8] mb-2">Confirm Delete</div>
            <div className="text-xs text-[#a6adc8] mb-5">
              Are you sure you want to delete row <span className="text-[#cdd6f4] font-mono">ID: {deleteConfirm}</span>?
              This action cannot be undone.
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-1.5 text-xs rounded cursor-pointer bg-[#313244] hover:bg-[#45475a] text-[#a6adc8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-1.5 text-xs rounded cursor-pointer bg-[#f38ba8] hover:bg-[#eba0ac] text-[#1e1e2e] font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Table Title */}
        <div className="flex items-center gap-2 mr-2">
          <span className="text-[#89b4fa] text-sm">▶</span>
          <span className="text-xs font-bold text-[#cdd6f4]">film_request_proc</span>
          <span className="text-[10px] text-[#45475a] bg-[#313244] px-2 py-0.5 rounded-full font-mono">
            {data.length} rows
          </span>
        </div>
        <div className="h-4 w-px bg-[#45475a]" />
        {/* Actions */}
        <button
          onClick={() => { setEditingId(null); setProcInput(""); setShowForm((v) => !v); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded cursor-pointer bg-[#89b4fa]/15 hover:bg-[#89b4fa]/25 text-[#89b4fa] border border-[#89b4fa]/30 transition-colors"
        >
          <IconPlus /> New Row
        </button>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded cursor-pointer bg-[#313244] hover:bg-[#45475a] text-[#a6adc8] border border-[#45475a] transition-colors disabled:opacity-50"
        >
          <span className={loading ? "animate-spin" : ""}><IconRefresh /></span>
          Refresh
        </button>
        <div className="ml-auto">
          {/* Search */}
          <input
            type="text"
            placeholder="Search proc or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#181825] border border-[#45475a] rounded px-3 py-1.5 text-xs text-[#cdd6f4] w-48 focus:outline-none focus:border-[#89b4fa] transition-colors placeholder:text-[#45475a]"
          />
        </div>
      </div>

      {/* ── Insert / Edit Form ── */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#181825] border border-[#89b4fa]/30 rounded-lg px-4 py-3 flex flex-wrap items-end gap-3"
        >
          <div className="text-[10px] uppercase tracking-widest text-[#89b4fa] self-center mr-1">
            {editingId ? `✎ Editing ID: ${editingId}` : "＋ Insert Row"}
          </div>
          <div className="flex-1 min-w-[180px]">
            <div className="text-[10px] text-[#6c7086] mb-1">proc <span className="text-[#f38ba8]">*</span></div>
            <input
              ref={inputRef}
              type="text"
              value={procInput}
              onChange={(e) => setProcInput(e.target.value)}
              placeholder="e.g. RXD2"
              className="w-full bg-[#1e1e2e] border border-[#45475a] focus:border-[#89b4fa] rounded px-2.5 py-1.5 text-xs text-[#cdd6f4] focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!procInput.trim()}
              className="px-4 py-1.5 cursor-pointer bg-[#89b4fa] hover:bg-[#b4befe] text-[#1e1e2e] text-xs font-bold rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {editingId ? "Update" : "Insert"}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-1.5 cursor-pointer bg-[#313244] hover:bg-[#45475a] text-[#a6adc8] text-xs font-semibold rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Table + Inspector ── */}
      <div className="flex flex-1 gap-3 min-h-0 overflow-hidden">

        {/* Data Table */}
        <div className="flex-1 bg-[#181825] border border-[#313244] rounded-lg overflow-hidden flex flex-col min-w-0">
          <div className="overflow-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-full py-20 text-xs text-[#45475a] animate-pulse">
                Loading data…
              </div>
            ) : (
              <table className="min-w-full border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#11111b] border-b border-[#313244]">
                    <th className={thClass} onClick={() => handleSort("id")}>
                      ID <IconSort active={sortKey === "id"} dir={sortDir} />
                    </th>
                    <th className={thClass} onClick={() => handleSort("proc")}>
                      Proc <IconSort active={sortKey === "proc"} dir={sortDir} />
                    </th>
                    <th className={thClass} onClick={() => handleSort("create_date")}>
                      Created <IconSort active={sortKey === "create_date"} dir={sortDir} />
                    </th>
                    <th className={thClass} onClick={() => handleSort("update_date")}>
                      Updated <IconSort active={sortKey === "update_date"} dir={sortDir} />
                    </th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#6c7086] text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-xs text-[#45475a]">
                        No rows found
                      </td>
                    </tr>
                  )}
                  {filtered.map((row, idx) => {
                    const isSelected = selectedId === row.id;
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedId(isSelected ? null : row.id)}
                        className={`border-b border-[#313244]/50 cursor-pointer transition-colors text-xs ${
                          isSelected
                            ? "bg-[#89b4fa]/10 border-l-2 border-l-[#89b4fa]"
                            : idx % 2 === 0
                            ? "bg-[#181825] hover:bg-[#313244]/40"
                            : "bg-[#1e1e2e] hover:bg-[#313244]/40"
                        }`}
                      >
                        <td className="px-3 py-2 font-mono text-[#6c7086]">{row.id}</td>
                        <td className="px-3 py-2 font-semibold text-[#cdd6f4]">{row.proc}</td>
                        <td className="px-3 py-2 text-[#a6adc8] whitespace-nowrap">
                          {row.create_date ? dayjs(row.create_date).format("DD MMM YYYY HH:mm:ss") : "—"}
                        </td>
                        <td className="px-3 py-2 text-[#a6adc8] whitespace-nowrap">
                          {row.update_date ? dayjs(row.update_date).format("DD MMM YYYY HH:mm:ss") : "—"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
                              className="p-1.5 rounded cursor-pointer bg-[#fab387]/15 hover:bg-[#fab387]/25 text-[#fab387] border border-[#fab387]/20 transition-colors"
                              title="Edit"
                            >
                              <IconEdit />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirm(row.id); }}
                              className="p-1.5 rounded cursor-pointer bg-[#f38ba8]/15 hover:bg-[#f38ba8]/25 text-[#f38ba8] border border-[#f38ba8]/20 transition-colors"
                              title="Delete"
                            >
                              <IconTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Status bar */}
          <div className="border-t border-[#313244] px-3 py-1.5 flex items-center gap-4 bg-[#11111b]">
            <span className="text-[10px] text-[#6c7086]">
              {filtered.length} of {data.length} rows
              {search && ` · filtered by "${search}"`}
            </span>
            {selectedId && (
              <span className="text-[10px] text-[#89b4fa]">Row {selectedId} selected</span>
            )}
          </div>
        </div>

        {/* Row Inspector Panel (shows when a row is selected) */}
        {selectedRow && (
          <div className="w-56 bg-[#181825] border border-[#313244] rounded-lg flex flex-col shrink-0 overflow-hidden">
            <div className="px-3 py-2 bg-[#11111b] border-b border-[#313244] text-[10px] uppercase tracking-widest text-[#6c7086]">
              Row Inspector
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {(Object.keys(selectedRow) as (keyof FilmProc)[]).map((key) => (
                <div key={key}>
                  <div className="text-[10px] font-semibold text-[#6c7086] uppercase tracking-wider mb-1">{key}</div>
                  <div className="text-xs text-[#cdd6f4] bg-[#1e1e2e] border border-[#313244] rounded px-2 py-1.5 break-all font-mono">
                    {key.includes("date") && selectedRow[key]
                      ? dayjs(selectedRow[key]).format("DD MMM YYYY HH:mm:ss")
                      : selectedRow[key] || <span className="text-[#45475a]">NULL</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#313244] px-3 py-2 flex gap-2">
              <button
                onClick={() => handleEdit(selectedRow)}
                className="flex-1 text-[11px] py-1.5 rounded cursor-pointer bg-[#fab387]/15 hover:bg-[#fab387]/25 text-[#fab387] border border-[#fab387]/30 font-semibold transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setDeleteConfirm(selectedRow.id)}
                className="flex-1 text-[11px] py-1.5 rounded cursor-pointer bg-[#f38ba8]/15 hover:bg-[#f38ba8]/25 text-[#f38ba8] border border-[#f38ba8]/30 font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
