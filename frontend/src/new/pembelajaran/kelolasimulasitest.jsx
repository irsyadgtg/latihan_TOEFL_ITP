import React, { useState, useEffect } from "react";
import api from '../../services/api';


function maxOrderNumber(questions) {
  if (!questions || !questions.length) return 0;
  return Math.max(...questions.map(q => q.order_number || 0));
}


const defaultChild = () => ({
  question_text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: "",
  explanation: "",
  difficulty: "",
  order_number: null,
  group_id: null,
  id: undefined,
  attachment: "",
  attachment_file: null,
});

const KelolaSimulasi = ({ modul }) => {
  const [questions, setQuestions] = useState([]);
  const [formMode, setFormMode] = useState(null); // null | "create" | "edit" | "create-group" | "edit-group"
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);

  // Fetch questions
  const fetchQuestions = async () => {
    try {
      const { data } = await api.get("/questions", {
        params: { simulation_set: 1, modul },
      });
      setQuestions(data);
    } catch (err) {
      alert("Gagal mengambil data soal");
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line
  }, [modul]);

  // ===== Utility
  const getNextOrderNumber = () => {
    const arr = questions
      .filter((q) => !q.group_id || q.group_id === q.id)
      .map((q) => q.order_number)
      .sort((a, b) => a - b);
    return arr.length > 0 ? Math.max(...arr) + 1 : 1;
  };

  // Tambah soal individu
  const handleAddSoal = () => {
    setFormMode("create");
    setForm({
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "",
      explanation: "",
      difficulty: "",
      order_number: getNextOrderNumber(),
      group_id: null,
      id: undefined,
      attachment: "",
      attachment_file: null,
    });
    setEditingId(null);
  };

  // Tambah soal grup
  const handleAddGroup = () => {
    // Cari order_number berikutnya dari list questions
    const nextOrder = getNextOrderNumber();
    setFormMode("create-group");
    setForm({
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "",
      explanation: "",
      difficulty: "",
      order_number: nextOrder,
      group_id: null,
      id: undefined,
      attachment: "",
      attachment_file: null,
      children: [
        {
          ...defaultChild(),
          order_number: nextOrder,
        },
      ],
    });
    setEditingId(null);
  };

  // Handle edit soal individu
  const handleEdit = (q) => {
    if (!q.group_id || q.group_id === q.id) {
      setFormMode("edit");
      setForm({
        ...q,
        attachment_file: null,
      });
      setEditingId(q.id);
    }
  };

  // Handle edit group
  const handleEditGroup = (group) => {
    // Temukan subsoal
    const subsoal = questions.filter(
      (q) => q.group_id === group.id && q.id !== group.id
    );
    setFormMode("edit-group");
    setForm({
      ...group,
      attachment_file: null,
      children: subsoal.map((child) => ({
        ...child,
        attachment_file: null,
      })),
    });
    setEditingId(group.id);
  };

  // Handle hapus soal individu/grup (grup: hapus semua subsoal sekaligus)
  const handleDelete = async (q) => {
    if (window.confirm("Yakin hapus?")) {
      // Hapus soal grup: hapus parent + semua subsoal
      if (q.group_id === q.id) {
        const ids = [q.id].concat(
          questions.filter((sub) => sub.group_id === q.id && sub.id !== q.id).map((s) => s.id)
        );
        for (const id of ids) {
          await api.delete(`/questions/${id}`);
        }
      } else {
        await api.delete(`/questions/${q.id}`);
      }
      fetchQuestions();
    }
  };

  // Tambah subsoal dalam form group
  const handleAddSub = () => {
    const maxOrder =
      form.children && form.children.length > 0
        ? Math.max(...form.children.map((c) => c.order_number))
        : form.order_number;
    setForm({
      ...form,
      children: [
        ...form.children,
        { ...defaultChild(), order_number: maxOrder + 1 },
      ],
    });
  };

  // Hapus subsoal pada form group
  const handleDeleteSub = (idx) => {
    const updated = form.children.filter((_, i) => i !== idx);
    setForm({
      ...form,
      children: updated.map((c, i) => ({
        ...c,
        order_number: form.order_number + i,
      })),
    });
  };

  // ==============================
  // LANJUTKAN DARI SINI ("lanjutkan")
  // ==============================

  // Handle submit form (individu/grup)

  function resetForm() {
  setForm({});
  setFormMode(null);
  setEditingId(null);
}

function handleTambahSoal() {
  setForm({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "",
    explanation: "",
    order_number: (maxOrderNumber(questions) || 0) + 1,
    modul: modul,
    difficulty: "",
    simulation_set_id: 1,
    attachment: "",
    attachment_file: null,
  });
  setFormMode("create");
}

function handleTambahSoalGrup() {
  // Cari order_number berikutnya
  const nextOrder = (maxOrderNumber(questions) || 0) + 1;
  setForm({
    question_text: "",
    explanation: "",
    order_number: nextOrder,
    modul: modul,
    simulation_set_id: 1,
    difficulty: "",
    attachment: "",
    attachment_file: null,
    children: [
      {
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_option: "",
        explanation: "",
        order_number: nextOrder,
        modul: modul,
        difficulty: "",
        simulation_set_id: 1,
        attachment: "",
        attachment_file: null,
      },
    ],
  });
  setFormMode("create-group");
}


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formMode === "create-group") {
        // 1. Simpan deskripsi grup
        const formData = new FormData();
        formData.append("question_text", form.question_text);
        formData.append("explanation", form.explanation || "");
        formData.append("modul", modul);
        formData.append("difficulty", form.difficulty || "");
        formData.append("simulation_set_id", 1);
        formData.append("order_number", form.order_number);
        if (form.attachment_file) {
          formData.append("attachment", form.attachment_file);
        } else if (form.attachment) {
          formData.append("attachment", form.attachment);
        }

        // Kirim parent (deskripsi grup, akan dapat id baru)
        const { data: parent } = await api.post("/questions", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // 2. Simpan semua subsoal di bawah grup
        for (const sub of form.children) {
          const subData = new FormData();
          subData.append("question_text", sub.question_text);
          subData.append("option_a", sub.option_a);
          subData.append("option_b", sub.option_b);
          subData.append("option_c", sub.option_c);
          subData.append("option_d", sub.option_d);
          subData.append("correct_option", sub.correct_option);
          subData.append("explanation", sub.explanation || "");
          subData.append("order_number", sub.order_number);
          subData.append("modul", modul);
          subData.append("difficulty", sub.difficulty || "");
          subData.append("simulation_set_id", 1);
          subData.append("group_id", parent.id);

          if (sub.attachment_file) {
            subData.append("attachment", sub.attachment_file);
          } else if (sub.attachment) {
            subData.append("attachment", sub.attachment);
          }

          await api.post("/questions", subData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      } else if (formMode === "edit-group" && form.id) {
        // Edit parent (deskripsi grup)
        const formData = new FormData();
        formData.append("question_text", form.question_text);
        formData.append("explanation", form.explanation || "");
        formData.append("modul", modul);
        formData.append("difficulty", form.difficulty || "");
        formData.append("simulation_set_id", 1);
        formData.append("order_number", form.order_number);
        if (form.attachment_file) {
          formData.append("attachment", form.attachment_file);
        } else if (form.attachment) {
          formData.append("attachment", form.attachment);
        }

        await api.post(`/questions/${form.id}?_method=PUT`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // Edit/insert semua subsoal (PUT/POST tergantung ada id/tidak)
        for (const sub of form.children) {
          const subData = new FormData();
          subData.append("question_text", sub.question_text);
          subData.append("option_a", sub.option_a);
          subData.append("option_b", sub.option_b);
          subData.append("option_c", sub.option_c);
          subData.append("option_d", sub.option_d);
          subData.append("correct_option", sub.correct_option);
          subData.append("explanation", sub.explanation || "");
          subData.append("order_number", sub.order_number);
          subData.append("modul", modul);
          subData.append("difficulty", sub.difficulty || "");
          subData.append("simulation_set_id", 1);
          subData.append("group_id", form.id);

          if (sub.attachment_file) {
            subData.append("attachment", sub.attachment_file);
          } else if (sub.attachment) {
            subData.append("attachment", sub.attachment);
          }

          if (sub.id) {
            await api.post(`/questions/${sub.id}?_method=PUT`, subData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          } else {
            await api.post("/questions", subData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          }
        }
      } else if (formMode === "edit") {
        // Edit soal individu
        const formData = new FormData();
        formData.append("question_text", form.question_text);
        formData.append("option_a", form.option_a);
        formData.append("option_b", form.option_b);
        formData.append("option_c", form.option_c);
        formData.append("option_d", form.option_d);
        formData.append("correct_option", form.correct_option);
        formData.append("explanation", form.explanation || "");
        formData.append("order_number", form.order_number);
        formData.append("modul", modul);
        formData.append("difficulty", form.difficulty || "");
        formData.append("simulation_set_id", 1);

        if (form.attachment_file) {
          formData.append("attachment", form.attachment_file);
        } else if (form.attachment) {
          formData.append("attachment", form.attachment);
        }

        await api.post(`/questions/${form.id}?_method=PUT`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (formMode === "create") {
        // Create soal individu
        const formData = new FormData();
        formData.append("question_text", form.question_text);
        formData.append("option_a", form.option_a);
        formData.append("option_b", form.option_b);
        formData.append("option_c", form.option_c);
        formData.append("option_d", form.option_d);
        formData.append("correct_option", form.correct_option);
        formData.append("explanation", form.explanation || "");
        formData.append("order_number", form.order_number);
        formData.append("modul", modul);
        formData.append("difficulty", form.difficulty || "");
        formData.append("simulation_set_id", 1);

        if (form.attachment_file) {
          formData.append("attachment", form.attachment_file);
        } else if (form.attachment) {
          formData.append("attachment", form.attachment);
        }

        await api.post("/questions", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setForm({});
      setFormMode(null);
      setEditingId(null);
      fetchQuestions();
    } catch (err) {
      alert("Gagal menyimpan soal");
      console.error(err);
    }
  };

  // === Fungsi shifting order_number saat tambah/hapus/edit
  const shiftOrderNumbers = (soals, start, end, excludeId = null) => {
    // Untuk shifting saat insert/hapus soal, atau saat mengedit urutan
    // soals: array semua soal (individu & subsoal)
    // start: order_number awal
    // end: order_number akhir
    // excludeId: id soal yang tidak ikut di-shift (biasanya yang sedang diedit)
    if (start < end) {
      // Geser turun
      soals.forEach(q => {
        if (
          q.order_number > start &&
          q.order_number <= end &&
          (!excludeId || q.id !== excludeId)
        ) {
          q.order_number -= 1;
        }
      });
    } else if (start > end) {
      // Geser naik
      soals.forEach(q => {
        if (
          q.order_number >= end &&
          q.order_number < start &&
          (!excludeId || q.id !== excludeId)
        ) {
          q.order_number += 1;
        }
      });
    }
  };

  // === Fungsi render form input (baik individu/grup)
  const renderForm = () => {
    if (!formMode) return null;
    // Form individu
    if (formMode === "create" || formMode === "edit") {
      return (
        <form onSubmit={handleSubmit}>
          <h3>{formMode === "create" ? "Tambah Soal" : "Edit Soal"}</h3>
          <input
            value={form.question_text || ""}
            onChange={e =>
              setForm({ ...form, question_text: e.target.value })
            }
            placeholder="Pertanyaan"
            required
          />
          {/* Input option a-d, correct_option, explanation, difficulty, attachment */}
          {/* ... (kode input lainnya, tetap seperti versi kamu yang sudah jalan) ... */}
          {/* Dropdown order_number */}
          <select
            value={form.order_number}
            onChange={e =>
              setForm({ ...form, order_number: parseInt(e.target.value) })
            }
            required
          >
            {Array.from(
              { length: maxOrderNumber }, // maxOrderNumber: state/order terakhir
              (_, i) => i + 1
            ).map(no => (
              <option key={no} value={no}>
                {no}
              </option>
            ))}
          </select>
          <button type="submit">Simpan</button>
          <button type="button" onClick={resetForm}>
            Batal
          </button>
        </form>
      );
    }
    // Form grup
    if (formMode === "create-group" || formMode === "edit-group") {
      return (
        <form onSubmit={handleSubmit}>
          <h3>{formMode === "create-group" ? "Tambah Grup Soal" : "Edit Grup Soal"}</h3>
          <input
            value={form.question_text || ""}
            onChange={e =>
              setForm({ ...form, question_text: e.target.value })
            }
            placeholder="Deskripsi Grup Soal"
            required
          />
          {/* Input group attachment, explanation, difficulty */}
          {/* ... */}
          {/* Dropdown order_number (untuk grup) */}
          <select
            value={form.order_number}
            onChange={e =>
              setForm({ ...form, order_number: parseInt(e.target.value) })
            }
            required
          >
            {Array.from(
              { length: maxOrderNumber },
              (_, i) => i + 1
            ).map(no => (
              <option key={no} value={no}>
                {no}
              </option>
            ))}
          </select>
          {/* Subsoal */}
          {form.children &&
            form.children.map((child, idx) => (
              <div key={idx} style={{ border: "1px solid #eee", marginBottom: 8, padding: 8 }}>
                {/* Semua input subsoal: question_text, option a-d, correct_option, explanation, attachment, dll */}
                {/* Dropdown order_number subsoal hanya dalam range urutan subsoal dalam grup */}
                <select
                  value={child.order_number}
                  onChange={e => {
                    const updated = [...form.children];
                    updated[idx].order_number = parseInt(e.target.value);
                    setForm({ ...form, children: updated });
                  }}
                  required
                >
                  {Array.from(
                    { length: form.children.length },
                    (_, i) => form.order_number + i
                  ).map(no => (
                    <option key={no} value={no}>
                      {no}
                    </option>
                  ))}
                </select>
                {/* ... (input lainnya) ... */}
              </div>
            ))}
          <button type="submit">Simpan Grup</button>
          <button type="button" onClick={resetForm}>
            Batal
          </button>
        </form>
      );
    }
  };

  // === Render utama
  return (
    <div>
      <h2>Kelola Soal Simulasi – Modul: {modul?.toUpperCase()}</h2>
      <button onClick={handleTambahSoal}>+ Tambah Soal</button>
      <button onClick={handleTambahSoalGrup}>+ Tambah Soal Grup</button>
      {/* ... render daftar soal & grup di sini ... */}
      {renderForm()}
    </div>
  );
};

export default KelolaSimulasi;
