import React, { useState, useEffect } from "react";
import { Library, Search, Barcode, Check, BookOpen, Clock, AlertCircle } from "lucide-react";
import { initialBooks } from "../../data/initialData";
import { LibraryBook } from "../../types";
import { useLiveData, notifyDataChanged } from "../../lib/liveStore";

export const LibraryView: React.FC = () => {
  const live = useLiveData<LibraryBook>("libraryBooks");
  const [books, setBooks] = useState<LibraryBook[]>(initialBooks);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  // Sync the catalogue to the live server store.
  useEffect(() => {
    if (Array.isArray(live.data)) setBooks(live.data);
  }, [live.data]);

  const filtered = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || b.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBarcodeScan = () => {
    if (!barcodeInput.trim()) return;
    const found = (books || []).find((b) => (b?.isbn || "").includes(barcodeInput) || (b?.id || "").includes(barcodeInput));
    if (found) {
      setActionMsg(`Scanned ISBN #${found.isbn}: "${found.title}" located on Shelf [${found.shelf}].`);
    } else {
      setActionMsg(`ISBN #${barcodeInput} not found in library catalogue.`);
    }
    setBarcodeInput("");
  };

  const handleToggleBorrow = (id: string) => {
    setBooks((prev) =>
      (prev || []).map((b) =>
        b?.id === id
          ? {
              ...b,
              copies: b.status === "Available" ? b.copies - 1 : b.copies + 1,
              status: b.copies <= 1 && b.status === "Available" ? "Borrowed" : "Available",
            }
          : b
      )
    );
    const target = (books || []).find((b) => b?.id === id);
    if (!target) return;
    const updated = {
      ...target,
      copies: target.status === "Available" ? target.copies - 1 : target.copies + 1,
      status: target.copies <= 1 && target.status === "Available" ? "Borrowed" : "Available",
    };
    fetch(`/api/library/books/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    })
      .then(() => notifyDataChanged(["libraryBooks"]))
      .catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Library className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Library Resource & Barcode Catalogue
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search textbook inventory, check out books, calculate overdue fines, and scan ISBN barcodes.
          </p>
        </div>

        {/* Barcode Scanner Simulator */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <Barcode className="w-5 h-5 text-slate-500 ml-2" />
          <input
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleBarcodeScan()}
            placeholder="Scan ISBN Barcode..."
            className="w-40 px-2 py-1 text-xs bg-white dark:bg-slate-900 rounded-lg border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200 outline-none"
          />
          <button
            onClick={handleBarcodeScan}
            className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Scan
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books by title, author, or ISBN..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200"
          />
        </div>

        <select
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent text-slate-800 dark:text-slate-200"
        >
          <option value="All">All Categories</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
          <option value="Literature">Literature</option>
          <option value="Chemistry">Chemistry</option>
          <option value="Biology">Biology</option>
        </select>
      </div>

      {/* Books Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
            <tr>
              <th className="p-3.5">Book Title</th>
              <th className="p-3.5">Author</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">ISBN Number</th>
              <th className="p-3.5">Shelf Location</th>
              <th className="p-3.5 text-center">Copies</th>
              <th className="p-3.5 text-right">Circulation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>{b.title}</span>
                </td>
                <td className="p-3.5 text-slate-600 dark:text-slate-400">{b.author}</td>
                <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{b.category}</td>
                <td className="p-3.5 font-mono font-bold text-slate-600 dark:text-slate-400">{b.isbn}</td>
                <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">{b.shelf}</td>
                <td className="p-3.5 text-center font-bold text-slate-900 dark:text-white">{b.copies}</td>
                <td className="p-3.5 text-right">
                  <button
                    onClick={() => handleToggleBorrow(b.id)}
                    className="px-3 py-1 text-[11px] font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100"
                  >
                    {b.copies > 0 ? "Check Out / Borrow" : "Return Book"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
