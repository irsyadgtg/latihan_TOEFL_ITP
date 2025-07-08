import { useNavigate } from "react-router-dom";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import axiosInstance from "../../services/axios";
import axios, { AxiosError } from "axios";
import React, { useState, useEffect } from "react";
import Confirm from "../shared/components/Confirm";

const MODULS = ["listening", "structure", "reading"];

export default function KelolaSimulasi() {
  // TAMBAH di dalam component:
  const navigate = useNavigate();
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  const [modulIndex, setModulIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [simulationSet, setSimulationSet] = useState(null); // 🔥 NEW: For simulation set info
  const [formMode, setFormMode] = useState(null);
  const [groupMode, setGroupMode] = useState(false);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const modul = MODULS[modulIndex];

  // TAMBAH di awal component:
  // Di Simulasi.jsx, GANTI getCurrentRole function:
  const getCurrentRole = () => {
    const storedRole = localStorage.getItem("role");
    const pathname = window.location.pathname;

    // IMMEDIATE redirect jika role mismatch
    if (storedRole === "peserta" && pathname.includes("/instructor/")) {
      window.location.replace("/student/simulasi");
      return "peserta";
    }

    if (storedRole === "instruktur" && pathname.includes("/student/")) {
      window.location.replace("/instructor/simulasi");
      return "instruktur";
    }

    // PRIORITASKAN localStorage role, bukan URL
    return storedRole;
  };

  const currentRole = getCurrentRole();
  console.log("Role from localStorage:", localStorage.getItem("role"));
  console.log("Role from URL detection:", currentRole);

  const getBasePath = () => {
    if (currentRole === "instruktur") {
      return "/instructor";
    }
    return "/student";
  };

  const resetForm = () => {
    setForm({});
    setFormMode(null);
    setGroupMode(false);
    setEditingId(null);
    setError("");
    setShowModal(false);
  };

  const fetchQuestions = async () => {
    try {
      setError("");

      // FETCH 1: Current module questions for display
      const res = await axiosInstance.get(
        `/questions?modul=${modul}&simulation_set=1`
      );
      console.log("Fetched questions:", res.data);
      setQuestions(res.data || []);

      // FETCH 2: All simulation questions for global count
      const allRes = await axiosInstance.get(`/questions?simulation_set=1`);
      console.log("Fetched all simulation questions:", allRes.data);
      setAllQuestions(allRes.data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }

      setError(
        "Gagal memuat soal: " + (error.response?.data?.message || error.message)
      );
    }
  };

  // 🔥 NEW: Fetch simulation set info
  const fetchSimulationSet = async () => {
    try {
      const res = await axiosInstance.get("/simulation-sets/1");
      console.log("Fetched simulation set:", res.data);
      setSimulationSet(res.data.set || res.data);
    } catch (error) {
      console.error("Error fetching simulation set:", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }
    }
  };

  // 🔥 NEW: Toggle activation
  const toggleActivation = async () => {
    if (!simulationSet) return;

    setLoading(true);
    try {
      const res = await axiosInstance.post(
        `/simulation-sets/${simulationSet.id}/toggle-active`
      );
      console.log("Toggle response:", res.data);

      setSimulationSet((prev) => ({
        ...prev,
        is_active: res.data.is_active,
      }));

      // Show success message briefly
      setError("");
    } catch (error) {
      console.error("Error toggling activation:", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }

      setError(
        "Gagal mengubah status aktivasi: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTitle("Kelola Simulasi");
    setSubtitle("Kelola soal simulasi TOEFL ITP");
  }, [setTitle, setSubtitle]);

  useEffect(() => {
    if (currentRole !== "instruktur") {
      navigate(getBasePath());
      return;
    }
  }, [currentRole]);

  useEffect(() => {
    if (currentRole === "instruktur") {
      resetForm();
      fetchQuestions();
      fetchSimulationSet(); // 🔥 NEW: Fetch simulation set info
    }
  }, [modul, currentRole]);

  if (currentRole !== "instruktur") {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        <h2 style={{ color: "#dc3545" }}>Akses Ditolak</h2>
        <p>Halaman ini hanya dapat diakses oleh instruktur.</p>
        <button
          onClick={() => navigate(getBasePath())}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const validateFile = (file) => {
    const validations = {
      "image/jpeg": { maxSize: 5 * 1024 * 1024, name: "JPEG" },
      "image/png": { maxSize: 5 * 1024 * 1024, name: "PNG" },
      "image/gif": { maxSize: 5 * 1024 * 1024, name: "GIF" },
      "audio/mpeg": { maxSize: 10 * 1024 * 1024, name: "MP3" },
      "audio/wav": { maxSize: 10 * 1024 * 1024, name: "WAV" },
      "audio/ogg": { maxSize: 10 * 1024 * 1024, name: "OGG" },
      "video/mp4": { maxSize: 20 * 1024 * 1024, name: "MP4" },
      "video/webm": { maxSize: 20 * 1024 * 1024, name: "WebM" },
    };

    const validation = validations[file.type];
    if (!validation) {
      return {
        valid: false,
        error: `Tipe file tidak didukung. Gunakan: JPG, PNG, GIF (≤5MB), MP3, WAV, OGG (≤10MB), MP4, WebM (≤20MB)`,
      };
    }

    if (file.size > validation.maxSize) {
      const maxMB = validation.maxSize / (1024 * 1024);
      return {
        valid: false,
        error: `File ${validation.name} terlalu besar. Maksimal ${maxMB}MB`,
      };
    }

    return { valid: true };
  };

  const validateGroupSize = (childrenCount, currentOrder, isEditing = false) => {
  const { standards } = getTOEFLStandard();
  let currentModulCount = getModulSoalCount(modul);
  const maxForModule = standards[modul];

  // FIXED: Jika sedang edit grup, kurangi jumlah subsoal grup yang lama
  if (isEditing && editingId) {
    const existingChildren = getGroupChildren(editingId);
    currentModulCount -= existingChildren.length;
    console.log("EDIT MODE: Mengurangi subsoal grup lama:", existingChildren.length);
  }

  const available = maxForModule - currentModulCount;
  const wouldExceed = childrenCount > available;

  console.log("Group validation (FIXED):", {
    modul,
    childrenCount,
    currentModulCount: currentModulCount,
    maxForModule,
    available,
    wouldExceed,
    isEditing,
    editingId
  });

  if (wouldExceed) {
    return {
      valid: false,
      error: `Grup dengan ${childrenCount} soal melebihi batas modul ${modul} (${maxForModule} soal). Saat ini ada ${currentModulCount} soal, tersisa ${available} slot.`,
    };
  }

  return { valid: true };
};

  const getModulSoalCount = (targetModul) => {
    const realQuestions = questions.filter(
      (q) =>
        q.modul === targetModul &&
        q.correct_option !== null &&
        q.correct_option !== ""
    );

    console.log(`Count for ${targetModul}:`, {
      allQuestions: questions.filter((q) => q.modul === targetModul).length,
      realQuestions: realQuestions.length,
      realQuestionsIds: realQuestions.map((q) => q.id),
      sampleData: realQuestions.slice(0, 3),
    });

    return realQuestions.length;
  };

  const getGlobalTotalCount = () => {
    const allSimulationQuestions = allQuestions.filter(
      (q) =>
        q.simulation_set_id === 1 &&
        q.correct_option !== null &&
        q.correct_option !== ""
    );

    console.log("Global TOEFL count debug (FIXED):", {
      allQuestionsFromAllModules: allQuestions.length,
      simulationQuestions: allSimulationQuestions.length,
      byModul: {
        listening: allSimulationQuestions.filter((q) => q.modul === "listening")
          .length,
        structure: allSimulationQuestions.filter((q) => q.modul === "structure")
          .length,
        reading: allSimulationQuestions.filter((q) => q.modul === "reading")
          .length,
      },
      currentModulInView: modul,
      sampleData: allSimulationQuestions.slice(0, 3),
    });

    return allSimulationQuestions.length;
  };

  const getTOEFLStandard = () => {
    const standards = {
      listening: 50,
      structure: 40,
      reading: 50,
    };
    const totalStandard = Object.values(standards).reduce(
      (sum, count) => sum + count,
      0
    );
    return { standards, totalStandard };
  };

  const getRecommendedOrderNumber = () => {
    const currentModulQuestions = questions.filter(
      (q) =>
        q.modul === modul &&
        q.correct_option !== null &&
        q.correct_option !== "" &&
        q.order_number
    );

    if (currentModulQuestions.length === 0) {
      return 1;
    }

    const maxOrder = Math.max(
      ...currentModulQuestions.map((q) => q.order_number)
    );
    return maxOrder + 1;
  };

  const getAvailableOrderNumbers = (
    excludeId = null,
    isGroup = false,
    isCreating = false
  ) => {
    const availableOrders = [];

    let currentPosition = null;
    if (excludeId) {
      if (isGroup) {
        const children = getGroupChildren(excludeId);
        if (children.length > 0) {
          currentPosition = children[0].order_number;
        }
      } else {
        const question = questions.find((q) => q.id === excludeId);
        currentPosition = question?.order_number;
      }
    }

    if (isCreating) {
      const realQuestions = questions.filter(
        (q) =>
          q.modul === modul &&
          q.correct_option !== null &&
          q.correct_option !== "" &&
          q.order_number
      );

      const usedOrderNumbers = realQuestions
        .map((q) => q.order_number)
        .sort((a, b) => a - b);

      if (usedOrderNumbers.length > 0) {
        usedOrderNumbers.forEach((orderNum) => {
          availableOrders.push({
            value: orderNum,
            disabled: false,
            label: `${orderNum} (sisipkan di sini)`,
          });
        });

        const nextOrder = Math.max(...usedOrderNumbers) + 1;
        availableOrders.push({
          value: nextOrder,
          disabled: false,
          label: `${nextOrder} (recommended)`,
          isRecommended: true,
        });
      } else {
        availableOrders.push({
          value: 1,
          disabled: false,
          label: `1 (pertama di ${modul})`,
          isRecommended: true,
        });
      }
    } else {
      const realQuestions = questions.filter(
        (q) =>
          q.modul === modul &&
          q.correct_option !== null &&
          q.correct_option !== "" &&
          q.order_number
      );

      const usedOrderNumbers = realQuestions
        .map((q) => q.order_number)
        .sort((a, b) => a - b);

      usedOrderNumbers.forEach((orderNum) => {
        availableOrders.push({
          value: orderNum,
          disabled: orderNum === currentPosition,
          label:
            orderNum === currentPosition
              ? `${orderNum} (posisi saat ini)`
              : `${orderNum}`,
        });
      });
    }

    console.log("Available orders debug:", {
      modul,
      isCreating,
      availableOrders: availableOrders.map((o) => ({
        value: o.value,
        label: o.label,
        isRecommended: o.isRecommended,
      })),
      currentPosition,
    });

    return availableOrders;
  };

  const getAvailableSubsoalOrders = (groupId, excludeChildIndex = null) => {
    if (form.children && form.children.length > 0) {
      const startOrder = form.group_order_number || 1;
      return form.children.map((child, index) => ({
        value: index,
        disabled: index === excludeChildIndex,
        label:
          index === excludeChildIndex
            ? `Soal ${startOrder + index} (Posisi saat ini)`
            : `Soal ${startOrder + index}`,
      }));
    }

    const existingChildren = getGroupChildren(groupId);
    if (existingChildren.length > 0) {
      const availableOrders = [];
      existingChildren.forEach((child, index) => {
        availableOrders.push({
          value: index,
          disabled: index === excludeChildIndex,
          label:
            index === excludeChildIndex
              ? `Soal ${child.order_number} (Posisi saat ini)`
              : `Soal ${child.order_number}`,
        });
      });
      return availableOrders;
    }

    return [];
  };

  const moveSubsoalInGroup = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    const updatedChildren = [...form.children];
    const [movedItem] = updatedChildren.splice(fromIndex, 1);
    updatedChildren.splice(toIndex, 0, movedItem);

    setForm({ ...form, children: updatedChildren });
  };

  const getEditInfo = () => {
    if (formMode === "edit" && form.order_number) {
      return `Edit Soal #${form.order_number}`;
    }
    if ((formMode === "edit-group" || editingId) && form.group_order_number) {
      const childrenCount = form.children?.length || 1;
      const endOrder = form.group_order_number + childrenCount - 1;
      return childrenCount > 1
        ? `Edit Grup Soal #${form.group_order_number}-${endOrder}`
        : `Edit Grup Soal #${form.group_order_number}`;
    }
    return null;
  };

  const handleEdit = (q) => {
    console.log("Editing question:", q);
    setFormMode("edit");
    setEditingId(q.id);
    setGroupMode(false);
    setError("");
    setForm({
      ...q,
      attachment_file: null,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError("");
    try {
      await axiosInstance.delete(`/questions/${id}`);
      await fetchQuestions();
      console.log("Question deleted successfully");
    } catch (error) {
      console.error("Error deleting question:", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }
      setError(
        "Gagal menghapus soal: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      e.target.value = "";
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axiosInstance.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm({ ...form, attachment: res.data.url, attachment_file: null });
      console.log("File uploaded:", res.data.url);
      setError("");
    } catch (error) {
      console.error("Error uploading file:", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }

      setError(
        "Gagal upload file: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const validateIndividualForm = () => {
    const errors = [];

    if (!form.question_text?.trim()) errors.push("Pertanyaan wajib diisi");
    if (!form.option_a?.trim()) errors.push("Option A wajib diisi");
    if (!form.option_b?.trim()) errors.push("Option B wajib diisi");
    if (!form.option_c?.trim()) errors.push("Option C wajib diisi");
    if (!form.option_d?.trim()) errors.push("Option D wajib diisi");
    if (!form.correct_option) errors.push("Jawaban benar wajib dipilih");
    if (!form.order_number) errors.push("Nomor urut wajib diisi");

    return errors;
  };

  const validateGroupForm = () => {
  const errors = [];

  if (!form.children || form.children.length === 0) {
    errors.push("Minimal harus ada 1 subsoal dalam grup");
    return errors;
  }

  if (!form.group_order_number) {
    errors.push("Order number grup wajib diisi");
  }

  // FIXED: Pass isEditing flag
  const isEditMode = formMode === "edit-group";
  const groupValidation = validateGroupSize(
    form.children.length,
    form.group_order_number,
    isEditMode
  );
  if (!groupValidation.valid) {
    errors.push(groupValidation.error);
  }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("=== SUBMIT DEBUG ===", {
      formMode,
      groupMode,
      hasChildren: form.children?.length,
      form: form,
    });

    setError("");
    setLoading(true);

    try {
      if (formMode === "create-group" || formMode === "edit-group") {
        console.log("=== DETECTED AS GROUP SUBMISSION ===");
        await handleGroupSubmit();
      } else {
        console.log("=== DETECTED AS INDIVIDUAL SUBMISSION ===");
        await handleIndividualSubmit();
      }
    } catch (error) {
      console.error("Submit error:", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }

      setError(
        "Gagal menyimpan: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualSubmit = async () => {
    console.log("=== INDIVIDUAL SUBMIT ===");

    const validationErrors = validateIndividualForm();
    if (validationErrors.length > 0) {
      setError("Validasi gagal: " + validationErrors.join(", "));
      return;
    }

    const formData = new FormData();
    formData.append("question_text", form.question_text.trim());
    formData.append("option_a", form.option_a.trim());
    formData.append("option_b", form.option_b.trim());
    formData.append("option_c", form.option_c.trim());
    formData.append("option_d", form.option_d.trim());
    formData.append("correct_option", form.correct_option);
    formData.append("order_number", form.order_number.toString());
    formData.append("explanation", (form.explanation || "").trim());
    formData.append("modul", modul);
    formData.append("simulation_set_id", "1");

    if (form.attachment_file) {
      formData.append("attachment", form.attachment_file);
    } else if (form.attachment) {
      formData.append("attachment", form.attachment);
    }

    console.log("Sending individual data...");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    if (formMode === "edit") {
      await axiosInstance.post(`/questions/${form.id}?_method=PUT`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Individual question updated");
    } else {
      await axiosInstance.post("/questions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Individual question created");
    }

    resetForm();
    await fetchQuestions();
  };

  const handleGroupSubmit = async () => {
    console.log("=== GROUP SUBMIT START ===");
    console.log("Form data:", form);
    console.log("Children:", form.children);

    const validationErrors = validateGroupForm();
    if (validationErrors.length > 0) {
      setError("Validasi gagal: " + validationErrors.join(", "));
      return;
    }

    const formData = new FormData();

    formData.append("question_text", (form.question_text || "").trim());
    formData.append("modul", modul);
    formData.append("simulation_set_id", "1");
    formData.append("order_number", form.group_order_number.toString());

    if (form.attachment_file) {
      formData.append("attachment", form.attachment_file);
    } else if (form.attachment) {
      formData.append("attachment", form.attachment);
    }

    const cleanChildren = form.children.map((child) => ({
      question_text: child.question_text.trim(),
      option_a: child.option_a.trim(),
      option_b: child.option_b.trim(),
      option_c: child.option_c.trim(),
      option_d: child.option_d.trim(),
      correct_option: child.correct_option,
      explanation: (child.explanation || "").trim(),
    }));

    console.log("Clean children before JSON:", cleanChildren);
    const childrenJson = JSON.stringify(cleanChildren);
    console.log("Children JSON string:", childrenJson);

    formData.append("children", childrenJson);

    console.log("=== SENDING FORMDATA ===");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    if (formMode === "edit-group" && form.id) {
      await axiosInstance.post(`/questions/${form.id}?_method=PUT`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Group updated");
    } else {
      await axiosInstance.post("/questions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Group created");
    }

    resetForm();
    await fetchQuestions();
  };

  const createIndividualQuestion = () => {
    console.log("Creating individual question");
    setGroupMode(false);
    setError("");

    const availableOrders = getAvailableOrderNumbers(null, false, true);
    const recommendedOrder =
      availableOrders.find((o) => o.isRecommended)?.value ||
      getRecommendedOrderNumber();

    setForm({
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "a",
      explanation: "",
      order_number: recommendedOrder,
      attachment: "",
      attachment_file: null,
    });
    setFormMode("create");
    setEditingId(null);
    setShowModal(true);
  };

  const createGroupQuestion = () => {
    console.log("Creating group question");

    const availableOrders = getAvailableOrderNumbers(null, true, true);
    const recommendedOrder =
      availableOrders.find((o) => o.isRecommended)?.value ||
      getRecommendedOrderNumber();

    setGroupMode(true);
    setError("");
    setFormMode("create-group");
    setForm({
      question_text: "",
      attachment: "",
      attachment_file: null,
      group_order_number: recommendedOrder,
      children: [
        {
          question_text: "",
          option_a: "",
          option_b: "",
          option_c: "",
          option_d: "",
          correct_option: "a",
          explanation: "",
        },
      ],
    });
    setEditingId(null);
    setShowModal(true);
  };

  const editGroupQuestion = (q) => {
    console.log("Editing group question:", q);
    setGroupMode(true);
    setFormMode("edit-group");
    setError("");

    const childrenQuestions = questions
      .filter(
        (sub) =>
          sub.group_id === q.id &&
          sub.correct_option !== null &&
          sub.id !== q.id
      )
      .sort((a, b) => (a.order_number || 0) - (b.order_number || 0))
      .map((sub) => ({
        id: sub.id,
        question_text: sub.question_text || "",
        option_a: sub.option_a || "",
        option_b: sub.option_b || "",
        option_c: sub.option_c || "",
        option_d: sub.option_d || "",
        correct_option: sub.correct_option || "a",
        explanation: sub.explanation || "",
      }));

    console.log("Found children for edit:", childrenQuestions);

    const existingChildren = getGroupChildren(q.id);
    const groupOrderNumber =
      existingChildren.length > 0
        ? existingChildren[0].order_number
        : getRecommendedOrderNumber();

    setForm({
      id: q.id,
      question_text: q.question_text || "",
      attachment: q.attachment || "",
      attachment_file: null,
      group_order_number: groupOrderNumber,
      children:
        childrenQuestions.length > 0
          ? childrenQuestions
          : [
              {
                question_text: "",
                option_a: "",
                option_b: "",
                option_c: "",
                option_d: "",
                correct_option: "a",
                explanation: "",
              },
            ],
    });
    setEditingId(q.id);
    setShowModal(true);
  };

  const addChildToGroup = () => {
    console.log("Adding child to group");
    setForm({
      ...form,
      children: [
        ...(form.children || []),
        {
          question_text: "",
          option_a: "",
          option_b: "",
          option_c: "",
          option_d: "",
          correct_option: "a",
          explanation: "",
        },
      ],
    });
  };

  const removeChildFromGroup = (index) => {
    console.log("Removing child from group:", index);
    const updatedChildren = form.children.filter((_, i) => i !== index);
    setForm({ ...form, children: updatedChildren });
  };

  const updateChildData = (index, field, value) => {
    const updated = [...form.children];
    updated[index][field] = value;
    setForm({ ...form, children: updated });
  };

  const getIndividualQuestions = () => {
    return questions.filter((q) => !q.group_id && q.correct_option !== null);
  };

  const getGroupQuestions = () => {
    return questions.filter(
      (q) => q.group_id === q.id && q.correct_option === null
    );
  };

  const getGroupChildren = (groupId) => {
    return questions
      .filter(
        (q) =>
          q.group_id === groupId &&
          q.correct_option !== null &&
          q.id !== groupId
      )
      .sort((a, b) => (a.order_number || 0) - (b.order_number || 0));
  };

  const getAllQuestionsSorted = () => {
    const individuals = getIndividualQuestions();
    const groups = getGroupQuestions();

    const combined = [];

    individuals.forEach((q) => {
      combined.push({ ...q, type: "individual", sortOrder: q.order_number });
    });

    groups.forEach((g) => {
      const children = getGroupChildren(g.id);
      if (children.length > 0) {
        const firstChildOrder = children[0].order_number;
        combined.push({ ...g, type: "group", sortOrder: firstChildOrder });
      } else {
        combined.push({ ...g, type: "group", sortOrder: 9999 });
      }
    });

    return combined.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* FIXED HEADER SECTION */}
      <div
        style={{
          flexShrink: 0,
          borderBottom: "1px solid #dee2e6",
          backgroundColor: "white",
          zIndex: 10,
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "1rem",
            border: "1px solid #dee2e6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              margin: "0",
              color: "#495057",
              fontSize: "1.5rem",
              fontWeight: "600",
            }}
          >
            Kelola Soal Simulasi TOEFL ITP
          </h1>
          <div
            style={{
              backgroundColor: "#d1ecf1",
              color: "#0c5460",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              border: "1px solid #bee5eb",
              fontSize: "0.9rem",
              fontWeight: "600",
            }}
          >
            Instructor Panel
          </div>
        </div>

        {/* 🔥 NEW: Activation Status & Toggle */}
        {simulationSet && (
          <div
            style={{
              backgroundColor: simulationSet.is_active ? "#d4edda" : "#f8d7da",
              color: simulationSet.is_active ? "#155724" : "#721c24",
              padding: "1rem",
              margin: "0 1rem",
              marginTop: "1rem",
              borderRadius: "4px",
              border: `1px solid ${
                simulationSet.is_active ? "#c3e6cb" : "#f5c6cb"
              }`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong>Status Simulasi:</strong>{" "}
              {simulationSet.is_active ? "AKTIF" : "TIDAK AKTIF"}
              <br />
              <small>
                {simulationSet.is_active
                  ? "Peserta dapat mengerjakan simulasi"
                  : "Peserta tidak dapat mengerjakan simulasi"}
              </small>
            </div>
            <button
              onClick={toggleActivation}
              disabled={loading}
              style={{
                backgroundColor: simulationSet.is_active
                  ? "#dc3545"
                  : "#28a745",
                color: "white",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "0.9rem",
              }}
            >
              {loading
                ? "Loading..."
                : simulationSet.is_active
                ? "Nonaktifkan"
                : "Aktifkan"}
            </button>
          </div>
        )}

        {/* 🔥 NEW: Warning when simulation is active */}
        {simulationSet && simulationSet.is_active && (
          <div
            style={{
              backgroundColor: "#fff3cd",
              color: "#856404",
              padding: "1rem",
              margin: "0 1rem",
              marginTop: "1rem",
              borderRadius: "4px",
              border: "1px solid #ffeaa7",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>⚠️</span>
            <div>
              <strong>Mode Read-Only:</strong> Simulasi sedang aktif. Semua
              fitur pengelolaan soal dinonaktifkan. Nonaktifkan simulasi
              terlebih dahulu untuk dapat mengelola soal.
            </div>
          </div>
        )}

        {/* Navigation - 3 Module Tabs */}
        <div
          style={{
            padding: "1rem",
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            borderBottom: "1px solid #dee2e6",
          }}
        >
          {MODULS.map((modulName, index) => (
            <button
              key={modulName}
              onClick={() => setModulIndex(index)}
              disabled={loading}
              style={{
                backgroundColor: index === modulIndex ? "#007bff" : "white",
                color: index === modulIndex ? "white" : "#007bff",
                border: "2px solid #007bff",
                padding: "0.75rem 1.5rem",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: index === modulIndex ? "600" : "400",
                textTransform: "uppercase",
                fontSize: "0.9rem",
                transition: "all 0.2s",
              }}
            >
              {modulName}
              {index === modulIndex && (
                <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem" }}>
                  ({getModulSoalCount(modulName)}/
                  {getTOEFLStandard().standards[modulName]})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div
            style={{
              color: "#721c24",
              backgroundColor: "#f8d7da",
              padding: "1rem",
              margin: "1rem",
              border: "1px solid #f5c6cb",
              borderRadius: "4px",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading Display */}
        {loading && (
          <div
            style={{
              color: "#004085",
              backgroundColor: "#cce7ff",
              padding: "1rem",
              margin: "1rem",
              border: "1px solid #b3d7ff",
              borderRadius: "4px",
            }}
          >
            <strong>Loading...</strong>
          </div>
        )}

        {/* 🔥 UPDATED: Action Buttons - Disabled when simulation is active */}
        <div
          style={{
            padding: "1rem",
            display: "flex",
            gap: "0.5rem",
          }}
        >
          <button
            onClick={createIndividualQuestion}
            disabled={loading || (simulationSet && simulationSet.is_active)}
            style={{
              backgroundColor:
                loading || (simulationSet && simulationSet.is_active)
                  ? "#6c757d"
                  : "#007bff",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor:
                loading || (simulationSet && simulationSet.is_active)
                  ? "not-allowed"
                  : "pointer",
              fontWeight: "500",
            }}
            title={
              simulationSet && simulationSet.is_active
                ? "Simulasi sedang aktif - tidak dapat mengelola soal"
                : ""
            }
          >
            Tambah Soal Individual
          </button>
          <button
            onClick={createGroupQuestion}
            disabled={loading || (simulationSet && simulationSet.is_active)}
            style={{
              backgroundColor:
                loading || (simulationSet && simulationSet.is_active)
                  ? "#6c757d"
                  : "#28a745",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor:
                loading || (simulationSet && simulationSet.is_active)
                  ? "not-allowed"
                  : "pointer",
              fontWeight: "500",
            }}
            title={
              simulationSet && simulationSet.is_active
                ? "Simulasi sedang aktif - tidak dapat mengelola soal"
                : ""
            }
          >
            Tambah Soal Grup
          </button>
        </div>

        {/* Stats Display */}
        <div
          style={{
            padding: "0 1rem 1rem 1rem",
            fontSize: "0.9em",
            color: "#6c757d",
            backgroundColor: "#f8f9fa",
            margin: "0 1rem",
            marginBottom: "1rem",
            padding: "0.75rem",
            borderRadius: "4px",
            border: "1px solid #dee2e6",
          }}
        >
          {(() => {
            const { standards, totalStandard } = getTOEFLStandard();
            const currentModulCount = getModulSoalCount(modul);
            const globalTotal = getGlobalTotalCount();
            const standardForThisModul = standards[modul];

            return (
              <>
                <strong>Modul {modul}:</strong> {currentModulCount}/
                {standardForThisModul} soal |<strong> Individual:</strong>{" "}
                {getIndividualQuestions().length} |<strong> Grup:</strong>{" "}
                {getGroupQuestions().length} |<strong> Subsoal:</strong>{" "}
                {getGroupQuestions().reduce(
                  (sum, g) => sum + getGroupChildren(g.id).length,
                  0
                )}{" "}
                <br />
                <strong>Total TOEFL ITP:</strong> {globalTotal}/{totalStandard}{" "}
                soal
                <span
                  style={{
                    color:
                      globalTotal === totalStandard ? "#28a745" : "#dc3545",
                  }}
                >
                  {globalTotal === totalStandard
                    ? " Lengkap"
                    : ` (kurang ${totalStandard - globalTotal})`}
                </span>
              </>
            );
          })()}
        </div>
      </div>

      {/* SCROLLABLE QUESTIONS LIST SECTION */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "1rem",
          backgroundColor: "#ffffff",
        }}
      >
        {getAllQuestionsSorted().length === 0 ? (
          <div
            style={{
              color: "#6c757d",
              fontStyle: "italic",
              textAlign: "center",
              padding: "1.5rem",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px",
              border: "1px solid #dee2e6",
            }}
          >
            Belum ada soal. Silakan tambah soal baru.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {getAllQuestionsSorted().map((item) => (
              <div
                key={item.id}
                style={{
                  border:
                    item.type === "group"
                      ? "2px solid #28a745"
                      : "2px solid #007bff",
                  borderRadius: "4px",
                  padding: "1rem",
                  backgroundColor:
                    item.type === "group" ? "#f8fff9" : "#f0f8ff",
                }}
              >
                {/* Individual Question */}
                {item.type === "individual" && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h4
                          style={{
                            color: "#007bff",
                            margin: "0 0 1rem 0",
                            fontSize: "1.1rem",
                            fontWeight: "600",
                          }}
                        >
                          Soal #{item.order_number} (Individual)
                        </h4>
                        <div style={{ marginBottom: "1rem" }}>
                          <strong>Pertanyaan:</strong> {item.question_text}
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "0.5rem",
                            margin: "1rem 0",
                            padding: "1rem",
                            backgroundColor: "white",
                            borderRadius: "4px",
                            border: "1px solid #dee2e6",
                          }}
                        >
                          <div>
                            <strong>A.</strong> {item.option_a}
                          </div>
                          <div>
                            <strong>B.</strong> {item.option_b}
                          </div>
                          <div>
                            <strong>C.</strong> {item.option_c}
                          </div>
                          <div>
                            <strong>D.</strong> {item.option_d}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr",
                            gap: "1rem",
                            fontSize: "0.9rem",
                          }}
                        >
                          <div>
                            <strong>Jawaban:</strong>{" "}
                            {item.correct_option?.toUpperCase()}
                          </div>
                        </div>
                        {item.explanation && (
                          <div style={{ marginTop: "1rem" }}>
                            <strong>Penjelasan:</strong> {item.explanation}
                          </div>
                        )}
                        {item.attachment && (
                          <div style={{ marginTop: "1rem" }}>
                            <strong>Lampiran:</strong>
                            <div style={{ marginTop: "0.5rem" }}>
                              {item.attachment.match(
                                /\.(jpg|jpeg|png|gif)$/i
                              ) && (
                                <img
                                  src={`http://localhost:8000${item.attachment}`}
                                  style={{
                                    maxWidth: "300px",
                                    maxHeight: "200px",
                                    objectFit: "contain",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                  }}
                                  alt="Attachment"
                                />
                              )}
                              {item.attachment.match(/\.(mp3|wav|ogg)$/i) && (
                                <audio
                                  src={`http://localhost:8000${item.attachment}`}
                                  controls
                                  style={{ width: "100%", maxWidth: "300px" }}
                                />
                              )}
                              {item.attachment.match(/\.(mp4|webm)$/i) && (
                                <video
                                  src={`http://localhost:8000${item.attachment}`}
                                  controls
                                  style={{
                                    maxWidth: "300px",
                                    maxHeight: "200px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      {/* 🔥 UPDATED: Action buttons - disabled when simulation is active */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                          marginLeft: "1rem",
                        }}
                      >
                        {simulationSet && simulationSet.is_active ? (
                          // Show disabled buttons when simulation is active
                          <>
                            <button
                              disabled={true}
                              style={{
                                backgroundColor: "#6c757d",
                                color: "white",
                                border: "none",
                                padding: "0.5rem 1rem",
                                borderRadius: "4px",
                                cursor: "not-allowed",
                              }}
                              title="Simulasi sedang aktif - tidak dapat mengelola soal"
                            >
                              Edit
                            </button>
                            <button
                              disabled={true}
                              style={{
                                backgroundColor: "#6c757d",
                                color: "white",
                                border: "none",
                                padding: "0.5rem 1rem",
                                borderRadius: "4px",
                                cursor: "not-allowed",
                              }}
                              title="Simulasi sedang aktif - tidak dapat mengelola soal"
                            >
                              Hapus
                            </button>
                          </>
                        ) : (
                          // Show normal buttons when simulation is inactive
                          <>
                            <button
                              onClick={() => handleEdit(item)}
                              disabled={loading}
                              style={{
                                backgroundColor: loading
                                  ? "#6c757d"
                                  : "#ffc107",
                                color: "black",
                                border: "none",
                                padding: "0.5rem 1rem",
                                borderRadius: "4px",
                                cursor: loading ? "not-allowed" : "pointer",
                              }}
                            >
                              Edit
                            </button>
                            <Confirm
                              title="HAPUS SOAL?"
                              description="Apakah Anda yakin ingin menghapus soal ini? Tindakan ini tidak dapat dibatalkan."
                              confirmText="HAPUS"
                              confirmButtonType="danger"
                              onConfirm={async () => {
                                await handleDelete(item.id);
                              }}
                            >
                              <button
                                disabled={loading}
                                style={{
                                  backgroundColor: loading
                                    ? "#6c757d"
                                    : "#dc3545",
                                  color: "white",
                                  border: "none",
                                  padding: "0.5rem 1rem",
                                  borderRadius: "4px",
                                  cursor: loading ? "not-allowed" : "pointer",
                                }}
                              >
                                Hapus
                              </button>
                            </Confirm>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Group Question */}
                {item.type === "group" && (
                  <div>
                    <div
                      style={{
                        backgroundColor: "#e8f5e8",
                        padding: "1rem",
                        borderRadius: "4px",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          {(() => {
                            const children = getGroupChildren(item.id);
                            const startOrder =
                              children.length > 0
                                ? children[0].order_number
                                : item.sortOrder;
                            const endOrder =
                              children.length > 0
                                ? children[children.length - 1].order_number
                                : startOrder;
                            return (
                              <h4
                                style={{
                                  color: "#28a745",
                                  margin: "0 0 1rem 0",
                                  fontSize: "1.1rem",
                                  fontWeight: "600",
                                }}
                              >
                                Grup Soal #{startOrder}
                                {children.length > 1 ? `-${endOrder}` : ""}
                              </h4>
                            );
                          })()}
                          <div style={{ marginBottom: "1rem" }}>
                            <strong>Deskripsi:</strong>{" "}
                            {item.question_text || "(Tidak ada deskripsi)"}
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr",
                              gap: "1rem",
                              fontSize: "0.9rem",
                            }}
                          >
                            <div>
                              <strong>Jumlah Subsoal:</strong>{" "}
                              {getGroupChildren(item.id).length}
                            </div>
                          </div>
                          {item.attachment && (
                            <div style={{ marginTop: "1rem" }}>
                              <strong>Lampiran:</strong>
                              <div style={{ marginTop: "0.5rem" }}>
                                {item.attachment.match(
                                  /\.(jpg|jpeg|png|gif)$/i
                                ) && (
                                  <img
                                    src={`http://localhost:8000${item.attachment}`}
                                    style={{
                                      maxWidth: "300px",
                                      maxHeight: "200px",
                                      objectFit: "contain",
                                      border: "1px solid #ddd",
                                      borderRadius: "4px",
                                    }}
                                    alt="Attachment"
                                  />
                                )}
                                {item.attachment.match(/\.(mp3|wav|ogg)$/i) && (
                                  <audio
                                    src={`http://localhost:8000${item.attachment}`}
                                    controls
                                    style={{ width: "100%", maxWidth: "300px" }}
                                  />
                                )}
                                {item.attachment.match(/\.(mp4|webm)$/i) && (
                                  <video
                                    src={`http://localhost:8000${item.attachment}`}
                                    controls
                                    style={{
                                      maxWidth: "300px",
                                      maxHeight: "200px",
                                      border: "1px solid #ddd",
                                      borderRadius: "4px",
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        {/* 🔥 UPDATED: Group action buttons - disabled when simulation is active */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                            marginLeft: "1rem",
                          }}
                        >
                          {simulationSet && simulationSet.is_active ? (
                            // Show disabled buttons when simulation is active
                            <>
                              <button
                                disabled={true}
                                style={{
                                  backgroundColor: "#6c757d",
                                  color: "white",
                                  border: "none",
                                  padding: "0.5rem 1rem",
                                  borderRadius: "4px",
                                  cursor: "not-allowed",
                                }}
                                title="Simulasi sedang aktif - tidak dapat mengelola soal"
                              >
                                Edit Grup
                              </button>
                              <button
                                disabled={true}
                                style={{
                                  backgroundColor: "#6c757d",
                                  color: "white",
                                  border: "none",
                                  padding: "0.5rem 1rem",
                                  borderRadius: "4px",
                                  cursor: "not-allowed",
                                }}
                                title="Simulasi sedang aktif - tidak dapat mengelola soal"
                              >
                                Hapus Grup
                              </button>
                            </>
                          ) : (
                            // Show normal buttons when simulation is inactive
                            <>
                              <button
                                onClick={() => editGroupQuestion(item)}
                                disabled={loading}
                                style={{
                                  backgroundColor: loading
                                    ? "#6c757d"
                                    : "#ffc107",
                                  color: "black",
                                  border: "none",
                                  padding: "0.5rem 1rem",
                                  borderRadius: "4px",
                                  cursor: loading ? "not-allowed" : "pointer",
                                }}
                              >
                                Edit Grup
                              </button>
                              <Confirm
                                title="HAPUS GRUP SOAL?"
                                description="Apakah Anda yakin ingin menghapus grup soal ini beserta semua subsoalnya? Tindakan ini tidak dapat dibatalkan."
                                confirmText="HAPUS"
                                confirmButtonType="danger"
                                onConfirm={async () => {
                                  await handleDelete(item.id);
                                }}
                              >
                                <button
                                  disabled={loading}
                                  style={{
                                    backgroundColor: loading
                                      ? "#6c757d"
                                      : "#dc3545",
                                    color: "white",
                                    border: "none",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "4px",
                                    cursor: loading ? "not-allowed" : "pointer",
                                  }}
                                >
                                  Hapus Grup
                                </button>
                              </Confirm>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Group Children */}
                    <div style={{ paddingLeft: "1rem" }}>
                      <h5
                        style={{
                          color: "#28a745",
                          marginBottom: "1rem",
                          fontWeight: "600",
                        }}
                      >
                        Subsoal dalam Grup:
                      </h5>
                      {getGroupChildren(item.id).map((sub, subIdx) => (
                        <div
                          key={sub.id}
                          style={{
                            border: "1px solid #28a745",
                            borderRadius: "4px",
                            padding: "0.75rem",
                            marginBottom: "0.5rem",
                            backgroundColor: "#ffffff",
                          }}
                        >
                          <h6
                            style={{
                              margin: "0 0 0.5rem 0",
                              color: "#28a745",
                              fontWeight: "600",
                            }}
                          >
                            #{sub.order_number}. {sub.question_text}
                          </h6>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "0.5rem",
                              fontSize: "0.9em",
                              marginBottom: "0.5rem",
                            }}
                          >
                            <div>
                              <strong>A.</strong> {sub.option_a}
                            </div>
                            <div>
                              <strong>B.</strong> {sub.option_b}
                            </div>
                            <div>
                              <strong>C.</strong> {sub.option_c}
                            </div>
                            <div>
                              <strong>D.</strong> {sub.option_d}
                            </div>
                          </div>
                          <div
                            style={{
                              fontSize: "0.9em",
                              display: "flex",
                              gap: "1rem",
                              flexWrap: "wrap",
                            }}
                          >
                            <div>
                              <strong>Jawaban:</strong>{" "}
                              {sub.correct_option?.toUpperCase()}
                            </div>
                          </div>
                          {sub.explanation && (
                            <div
                              style={{ marginTop: "0.5rem", fontSize: "0.9em" }}
                            >
                              <strong>Penjelasan:</strong> {sub.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Overlay - (Form sections same as before, tidak perlu diubah) */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              maxWidth: "800px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              padding: "1.5rem",
              position: "relative",
            }}
          >
            {/* Close Button */}
            <button
              onClick={resetForm}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                cursor: "pointer",
                fontSize: "1.2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>

            {/* Individual Form */}
            {(formMode === "create" || formMode === "edit") && !groupMode && (
              <div>
                <h3
                  style={{
                    color: "#007bff",
                    marginTop: "0",
                    marginBottom: "1rem",
                    fontWeight: "600",
                  }}
                >
                  {getEditInfo() || (formMode === "edit" ? "Edit" : "Tambah")}{" "}
                  Soal Individual
                </h3>

                <form
                  onSubmit={handleSubmit}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontWeight: "600",
                        marginBottom: "0.5rem",
                        display: "block",
                      }}
                    >
                      Upload Lampiran (Opsional):
                      <br />
                      <small style={{ color: "#6c757d", fontWeight: "400" }}>
                        Maksimal: JPG/PNG (5MB), MP3/WAV (10MB), MP4 (20MB)
                      </small>
                    </label>
                    <input
                      type="file"
                      onChange={handleUpload}
                      disabled={loading}
                      accept=".jpg,.jpeg,.png,.gif,.mp3,.wav,.ogg,.mp4,.webm"
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #ced4da",
                        borderRadius: "4px",
                        width: "100%",
                      }}
                    />
                  </div>

                  {form.attachment && (
                    <div
                      style={{
                        border: "1px solid #dee2e6",
                        padding: "1rem",
                        borderRadius: "4px",
                        backgroundColor: "#f8f9fa",
                        marginBottom: "1rem",
                      }}
                    >
                      <p>
                        <strong>Preview Lampiran:</strong>
                      </p>
                      {form.attachment.match(/\.(jpg|jpeg|png|gif)$/i) && (
                        <img
                          src={`http://localhost:8000${form.attachment}`}
                          style={{
                            maxWidth: "400px",
                            maxHeight: "300px",
                            objectFit: "contain",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                          }}
                          alt="Preview"
                        />
                      )}
                      {form.attachment.match(/\.(mp3|wav|ogg)$/i) && (
                        <audio
                          src={`http://localhost:8000${form.attachment}`}
                          controls
                          style={{ width: "100%", maxWidth: "400px" }}
                        />
                      )}
                      {form.attachment.match(/\.(mp4|webm)$/i) && (
                        <video
                          src={`http://localhost:8000${form.attachment}`}
                          controls
                          style={{
                            maxWidth: "400px",
                            maxHeight: "300px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                          }}
                        />
                      )}
                    </div>
                  )}

                  <div>
                    <label
                      style={{
                        fontWeight: "600",
                        marginBottom: "0.5rem",
                        display: "block",
                      }}
                    >
                      Pertanyaan:
                    </label>
                    <textarea
                      value={form.question_text || ""}
                      onChange={(e) =>
                        setForm({ ...form, question_text: e.target.value })
                      }
                      placeholder="Masukkan pertanyaan..."
                      rows={3}
                      required
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #ced4da",
                        borderRadius: "4px",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontWeight: "600",
                          marginBottom: "0.5rem",
                          display: "block",
                        }}
                      >
                        Pilihan A:
                      </label>
                      <input
                        value={form.option_a || ""}
                        onChange={(e) =>
                          setForm({ ...form, option_a: e.target.value })
                        }
                        placeholder="Option A"
                        required
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid #ced4da",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontWeight: "600",
                          marginBottom: "0.5rem",
                          display: "block",
                        }}
                      >
                        Pilihan B:
                      </label>
                      <input
                        value={form.option_b || ""}
                        onChange={(e) =>
                          setForm({ ...form, option_b: e.target.value })
                        }
                        placeholder="Option B"
                        required
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid #ced4da",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontWeight: "600",
                          marginBottom: "0.5rem",
                          display: "block",
                        }}
                      >
                        Pilihan C:
                      </label>
                      <input
                        value={form.option_c || ""}
                        onChange={(e) =>
                          setForm({ ...form, option_c: e.target.value })
                        }
                        placeholder="Option C"
                        required
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid #ced4da",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontWeight: "600",
                          marginBottom: "0.5rem",
                          display: "block",
                        }}
                      >
                        Pilihan D:
                      </label>
                      <input
                        value={form.option_d || ""}
                        onChange={(e) =>
                          setForm({ ...form, option_d: e.target.value })
                        }
                        placeholder="Option D"
                        required
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid #ced4da",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontWeight: "600",
                          marginBottom: "0.5rem",
                          display: "block",
                        }}
                      >
                        Jawaban Benar:
                      </label>
                      <select
                        value={form.correct_option || ""}
                        onChange={(e) =>
                          setForm({ ...form, correct_option: e.target.value })
                        }
                        required
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid #ced4da",
                          borderRadius: "4px",
                        }}
                      >
                        <option value="">Pilih Jawaban Benar</option>
                        <option value="a">A</option>
                        <option value="b">B</option>
                        <option value="c">C</option>
                        <option value="d">D</option>
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          fontWeight: "600",
                          marginBottom: "0.5rem",
                          display: "block",
                        }}
                      >
                        Nomor Urut:
                      </label>
                      <select
                        value={form.order_number || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            order_number: parseInt(e.target.value),
                          })
                        }
                        required
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid #ced4da",
                          borderRadius: "4px",
                        }}
                      >
                        <option value="">Pilih Nomor Urut</option>
                        {getAvailableOrderNumbers(
                          form.id,
                          false,
                          formMode === "create"
                        ).map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                            style={{
                              color: option.disabled ? "#999" : "black",
                              backgroundColor: option.disabled
                                ? "#f5f5f5"
                                : "white",
                            }}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        fontWeight: "600",
                        marginBottom: "0.5rem",
                        display: "block",
                      }}
                    >
                      Penjelasan (Opsional):
                    </label>
                    <textarea
                      value={form.explanation || ""}
                      onChange={(e) =>
                        setForm({ ...form, explanation: e.target.value })
                      }
                      placeholder="Penjelasan jawaban..."
                      rows={2}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #ced4da",
                        borderRadius: "4px",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      padding: "0.75rem 1.5rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      marginTop: "1rem",
                      fontWeight: "600",
                    }}
                  >
                    {loading ? "Menyimpan..." : "Simpan Soal Individual"}
                  </button>
                </form>
              </div>
            )}

            {/* Group Form */}
            {(formMode === "create-group" || formMode === "edit-group") &&
              groupMode && (
                <div style={{ maxHeight: "80vh", overflow: "auto" }}>
                  <h3
                    style={{
                      color: "#28a745",
                      marginTop: "0",
                      marginBottom: "1rem",
                      fontWeight: "600",
                    }}
                  >
                    {getEditInfo() ||
                      (formMode === "edit-group" ? "Edit" : "Tambah")}{" "}
                    Soal Grup
                  </h3>

                  <form
                    onSubmit={handleSubmit}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {/* Parent Group Section */}
                    <div
                      style={{
                        border: "1px solid #28a745",
                        borderRadius: "4px",
                        padding: "1rem",
                        backgroundColor: "#f8fff9",
                        marginBottom: "1rem",
                      }}
                    >
                      <h4
                        style={{
                          color: "#28a745",
                          marginTop: "0",
                          fontWeight: "600",
                        }}
                      >
                        Deskripsi Grup (Opsional)
                      </h4>

                      <div style={{ marginBottom: "1rem" }}>
                        <label
                          style={{
                            fontWeight: "600",
                            marginBottom: "0.5rem",
                            display: "block",
                          }}
                        >
                          Nomor Urut Grup:
                        </label>
                        <select
                          value={form.group_order_number || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              group_order_number: parseInt(e.target.value),
                            })
                          }
                          required
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            border: "1px solid #ced4da",
                            borderRadius: "4px",
                          }}
                        >
                          <option value="">Pilih Nomor Urut Grup</option>
                          {getAvailableOrderNumbers(
                            form.id,
                            true,
                            formMode === "create-group"
                          ).map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                              disabled={option.disabled}
                              style={{
                                color: option.disabled ? "#999" : "black",
                                backgroundColor: option.disabled
                                  ? "#f5f5f5"
                                  : "white",
                              }}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ marginBottom: "1rem" }}>
                        <label
                          style={{
                            fontWeight: "600",
                            marginBottom: "0.5rem",
                            display: "block",
                          }}
                        >
                          Upload Lampiran Grup:
                          <br />
                          <small
                            style={{ color: "#6c757d", fontWeight: "400" }}
                          >
                            Maksimal: JPG/PNG (5MB), MP3/WAV (10MB), MP4 (20MB)
                          </small>
                        </label>
                        <input
                          type="file"
                          onChange={handleUpload}
                          disabled={loading}
                          accept=".jpg,.jpeg,.png,.gif,.mp3,.wav,.ogg,.mp4,.webm"
                          style={{
                            padding: "0.5rem",
                            border: "1px solid #ced4da",
                            borderRadius: "4px",
                            width: "100%",
                          }}
                        />
                      </div>

                      {form.attachment && (
                        <div
                          style={{
                            border: "1px solid #dee2e6",
                            padding: "1rem",
                            borderRadius: "4px",
                            backgroundColor: "#f8f9fa",
                            marginBottom: "1rem",
                          }}
                        >
                          <p>
                            <strong>Preview Lampiran Grup:</strong>
                          </p>
                          {form.attachment.match(/\.(jpg|jpeg|png|gif)$/i) && (
                            <img
                              src={`http://localhost:8000${form.attachment}`}
                              style={{ maxWidth: "300px", maxHeight: "200px" }}
                              alt="Preview"
                            />
                          )}
                          {form.attachment.match(/\.(mp3|wav|ogg)$/i) && (
                            <audio
                              src={`http://localhost:8000${form.attachment}`}
                              controls
                              style={{ width: "100%" }}
                            />
                          )}
                          {form.attachment.match(/\.(mp4|webm)$/i) && (
                            <video
                              src={`http://localhost:8000${form.attachment}`}
                              controls
                              style={{ maxWidth: "300px" }}
                            />
                          )}
                        </div>
                      )}

                      <div>
                        <label
                          style={{
                            fontWeight: "600",
                            marginBottom: "0.5rem",
                            display: "block",
                          }}
                        >
                          Deskripsi Grup:
                        </label>
                        <textarea
                          value={form.question_text || ""}
                          onChange={(e) =>
                            setForm({ ...form, question_text: e.target.value })
                          }
                          placeholder="Deskripsi grup (misalnya: Passage untuk soal 1-3)"
                          rows={3}
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            border: "1px solid #ced4da",
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                    </div>

                    {/* Children Section */}
                    <div>
                      <h4 style={{ color: "#28a745", fontWeight: "600" }}>
                        Daftar Soal dalam Grup ({form.children?.length || 0}{" "}
                        soal)
                      </h4>

                      {form.children &&
                        form.children.map((child, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: "1rem",
                              border: "1px dashed #28a745",
                              borderRadius: "4px",
                              marginBottom: "1rem",
                              position: "relative",
                              backgroundColor: "#ffffff",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => removeChildFromGroup(idx)}
                              style={{
                                position: "absolute",
                                right: "1rem",
                                top: "1rem",
                                background: "#dc3545",
                                color: "white",
                                border: "none",
                                padding: "0.5rem 1rem",
                                cursor: "pointer",
                                borderRadius: "4px",
                              }}
                            >
                              Hapus
                            </button>

                            <h5
                              style={{
                                color: "#28a745",
                                marginTop: "0",
                                marginBottom: "1rem",
                                fontWeight: "600",
                              }}
                            >
                              Soal #{(form.group_order_number || 1) + idx}
                            </h5>

                            {/* Subsoal Order Management */}
                            {form.children.length > 1 && (
                              <div style={{ marginBottom: "1rem" }}>
                                <label
                                  style={{
                                    fontWeight: "600",
                                    marginBottom: "0.5rem",
                                    display: "block",
                                  }}
                                >
                                  Urutan dalam Grup:
                                </label>
                                <select
                                  value={idx}
                                  onChange={(e) =>
                                    moveSubsoalInGroup(
                                      idx,
                                      parseInt(e.target.value)
                                    )
                                  }
                                  style={{
                                    width: "200px",
                                    padding: "0.5rem",
                                    border: "1px solid #ced4da",
                                    borderRadius: "4px",
                                  }}
                                >
                                  {getAvailableSubsoalOrders(form.id, idx).map(
                                    (option) => (
                                      <option
                                        key={option.value}
                                        value={option.value}
                                        disabled={option.disabled}
                                        style={{
                                          color: option.disabled
                                            ? "#999"
                                            : "black",
                                          backgroundColor: option.disabled
                                            ? "#f5f5f5"
                                            : "white",
                                        }}
                                      >
                                        {option.label}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>
                            )}

                            <div style={{ marginBottom: "1rem" }}>
                              <label
                                style={{
                                  fontWeight: "600",
                                  marginBottom: "0.5rem",
                                  display: "block",
                                }}
                              >
                                Pertanyaan:
                              </label>
                              <textarea
                                value={child.question_text || ""}
                                onChange={(e) =>
                                  updateChildData(
                                    idx,
                                    "question_text",
                                    e.target.value
                                  )
                                }
                                placeholder="Pertanyaan..."
                                rows={2}
                                required
                                style={{
                                  width: "100%",
                                  padding: "0.5rem",
                                  border: "1px solid #ced4da",
                                  borderRadius: "4px",
                                }}
                              />
                            </div>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "1rem",
                                marginBottom: "1rem",
                              }}
                            >
                              <div>
                                <label
                                  style={{
                                    fontWeight: "600",
                                    marginBottom: "0.5rem",
                                    display: "block",
                                  }}
                                >
                                  Pilihan A:
                                </label>
                                <input
                                  value={child.option_a || ""}
                                  onChange={(e) =>
                                    updateChildData(
                                      idx,
                                      "option_a",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Option A"
                                  required
                                  style={{
                                    width: "100%",
                                    padding: "0.5rem",
                                    border: "1px solid #ced4da",
                                    borderRadius: "4px",
                                  }}
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    fontWeight: "600",
                                    marginBottom: "0.5rem",
                                    display: "block",
                                  }}
                                >
                                  Pilihan B:
                                </label>
                                <input
                                  value={child.option_b || ""}
                                  onChange={(e) =>
                                    updateChildData(
                                      idx,
                                      "option_b",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Option B"
                                  required
                                  style={{
                                    width: "100%",
                                    padding: "0.5rem",
                                    border: "1px solid #ced4da",
                                    borderRadius: "4px",
                                  }}
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    fontWeight: "600",
                                    marginBottom: "0.5rem",
                                    display: "block",
                                  }}
                                >
                                  Pilihan C:
                                </label>
                                <input
                                  value={child.option_c || ""}
                                  onChange={(e) =>
                                    updateChildData(
                                      idx,
                                      "option_c",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Option C"
                                  required
                                  style={{
                                    width: "100%",
                                    padding: "0.5rem",
                                    border: "1px solid #ced4da",
                                    borderRadius: "4px",
                                  }}
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    fontWeight: "600",
                                    marginBottom: "0.5rem",
                                    display: "block",
                                  }}
                                >
                                  Pilihan D:
                                </label>
                                <input
                                  value={child.option_d || ""}
                                  onChange={(e) =>
                                    updateChildData(
                                      idx,
                                      "option_d",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Option D"
                                  required
                                  style={{
                                    width: "100%",
                                    padding: "0.5rem",
                                    border: "1px solid #ced4da",
                                    borderRadius: "4px",
                                  }}
                                />
                              </div>
                            </div>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "1rem",
                                marginBottom: "1rem",
                              }}
                            >
                              <div>
                                <label
                                  style={{
                                    fontWeight: "600",
                                    marginBottom: "0.5rem",
                                    display: "block",
                                  }}
                                >
                                  Jawaban Benar:
                                </label>
                                <select
                                  value={child.correct_option || ""}
                                  onChange={(e) =>
                                    updateChildData(
                                      idx,
                                      "correct_option",
                                      e.target.value
                                    )
                                  }
                                  required
                                  style={{
                                    width: "100%",
                                    padding: "0.5rem",
                                    border: "1px solid #ced4da",
                                    borderRadius: "4px",
                                  }}
                                >
                                  <option value="">Pilih Jawaban</option>
                                  <option value="a">A</option>
                                  <option value="b">B</option>
                                  <option value="c">C</option>
                                  <option value="d">D</option>
                                </select>
                              </div>
                              <div></div>
                            </div>

                            <div>
                              <label
                                style={{
                                  fontWeight: "600",
                                  marginBottom: "0.5rem",
                                  display: "block",
                                }}
                              >
                                Penjelasan (Opsional):
                              </label>
                              <textarea
                                value={child.explanation || ""}
                                onChange={(e) =>
                                  updateChildData(
                                    idx,
                                    "explanation",
                                    e.target.value
                                  )
                                }
                                placeholder="Penjelasan jawaban..."
                                rows={2}
                                style={{
                                  width: "100%",
                                  padding: "0.5rem",
                                  border: "1px solid #ced4da",
                                  borderRadius: "4px",
                                }}
                              />
                            </div>
                          </div>
                        ))}

                      <button
                        type="button"
                        onClick={addChildToGroup}
                        style={{
                          backgroundColor: "#6f42c1",
                          color: "white",
                          border: "none",
                          padding: "0.5rem 1rem",
                          borderRadius: "4px",
                          cursor: "pointer",
                          marginBottom: "1rem",
                          fontWeight: "500",
                        }}
                      >
                        Tambah Soal ke Grup
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      {loading ? "Menyimpan..." : "Simpan Grup Soal"}
                    </button>
                  </form>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
