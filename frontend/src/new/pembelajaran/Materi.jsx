import React, { useEffect, useState } from "react";
import UnitSidebar from "./UnitSidebar";
import PageViewer from "./PageViewer";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import QuizViewer from "./QuizViewer";

import Confirm from "../shared/components/Confirm";

import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import axiosInstance from "../../services/axios";
import axios, { AxiosError } from "axios";

function Materi() {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  const { modul } = useParams();
  const [searchParams] = useSearchParams();
  const [unit, setUnit] = useState(0);
  const [pages, setPages] = useState([]);
  const [page, setPage] = useState(null);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [formMode, setFormMode] = useState(null);
  const [form, setForm] = useState({
    title: "",
    attachment: "",
    description: "",
    order_number: 1,
    attachment_file: null,
  });
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [editingPageId, setEditingPageId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [originalOrderNumber, setOriginalOrderNumber] = useState(null);
  const [showOrderWarning, setShowOrderWarning] = useState(false);

  const [progressData, setProgressData] = useState({
    completed_pages: [],
    can_access_quiz: false,
    next_required_page: null,
  });

  const [unitAccess, setUnitAccess] = useState({
    unlockedUnits: null,
    hasActiveFeedback: false,
    feedbackSkills: [],
    loading: true,
    error: null,
  });

  const [urlNavigationTarget, setUrlNavigationTarget] = useState({
    targetUnit: null,
    targetPageId: null,
    processed: false,
  });

  const navigate = useNavigate();

  // FIXED: Role detection dengan URL protection
  const getCurrentRole = () => {
    const storedRole = localStorage.getItem("role");
    const pathname = window.location.pathname;

    // IMMEDIATE redirect jika role mismatch
    if (storedRole === "peserta" && pathname.includes("/instructor/")) {
      window.location.replace("/student/materi");
      return "peserta";
    }

    if (storedRole === "instruktur" && pathname.includes("/student/")) {
      window.location.replace("/instructor/materi");
      return "instruktur";
    }

    // PRIORITASKAN localStorage role, bukan URL
    return storedRole;
  };

  const getBasePath = () => {
    if (role === "instruktur") {
      return "/instructor";
    }
    return "/student"; // Default untuk peserta
  };

  const role = getCurrentRole();
  const token = localStorage.getItem("token");

  const getSkillName = (modul, unit) => {
    if (unit === 0) return null;

    const skillMap = {
      listening: {
        1: "Identify gist of short and long conversations",
        2: "Explain advice in short conversations",
        3: "Predict what the speaker will probably do next in short conversations",
        4: "Use context to understand meaning in short conversations",
        5: "Infer unstated details of short conversations",
        6: "Identify stated details in longer conversations",
        7: "Identify unstated details in longer conversations",
        8: "Identify gist in lectures",
        9: "Identify stated details in lectures",
        10: "Identify unstated details in lectures",
      },
      structure: {
        1: "Noun questions",
        2: "Verb questions",
        3: "Subject-Verb agreement",
        4: "Adjective and adverb questions",
        5: "Pronoun questions",
        6: "Parallel structure questions",
        7: "Simple and compound sentence questions",
        8: "Complex sentence questions",
        9: "Reduced clause questions",
        10: "Preposition and word-choice questions",
      },
      reading: {
        1: "Identify topic and main idea",
        2: "Explain explicit details",
        3: "Find referential relationship",
        4: "Literal equivalent meaning",
        5: "Explain implicit details",
        6: "Analyze organizational structure",
      },
    };

    return skillMap[modul]?.[unit] || null;
  };
  // UPDATE DI MATERI.JSX - BAGIAN FETCH UNLOCKED UNITS

  const fetchUnlockedUnits = async () => {
    if (role !== "peserta") {
      const allUnits =
        modul === "reading"
          ? [0, 1, 2, 3, 4, 5, 6]
          : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      setUnitAccess({
        unlockedUnits: allUnits,
        hasActiveFeedback: true,
        feedbackSkills: [],
        loading: false,
        error: null,
        breakdown: null, // Admin/instruktur tidak perlu breakdown
      });
      return;
    }

    try {
      console.log("Materi: Fetching unlocked units for", modul);

      const response = await axiosInstance.get("/units/unlocked", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Materi: Unit access response:", response.data);

      // TAMBAHAN DEBUG INI:
      console.log("=== BREAKDOWN DEBUG ===");
      console.log("Raw breakdown:", response.data.breakdown);
      if (response.data.breakdown) {
        console.log(
          "From rencana belajar:",
          response.data.breakdown.from_rencana_belajar?.units
        );
        console.log("From paket:", response.data.breakdown.from_paket?.units);
        console.log(
          "Final unlocked:",
          response.data.final_unlocked_units || response.data.unlocked_units
        );
      }
      console.log("=========================");

      const modulUnits = response.data.unlocked_units[modul] || [0];

      setUnitAccess({
        unlockedUnits: modulUnits,
        hasActiveFeedback: response.data.has_active_feedback,
        feedbackSkills: response.data.feedback_skills || [],
        loading: false,
        error: null,
        breakdown: response.data.breakdown || null, // TAMBAHAN: Breakdown data
      });

      console.log("Materi: Units unlocked for", modul, ":", modulUnits);

      // SCRIPT DEBUG - Tambahkan di Materi.jsx setelah fetchUnlockedUnits berhasil
      // Letakkan setelah baris: console.log("Materi: Units unlocked for", modul, ":", modulUnits);

      console.log("=== FULL DEBUG BREAKDOWN DATA ===");
      console.log("Raw response.data:", JSON.stringify(response.data, null, 2));

      if (response.data.breakdown) {
        console.log("=== BREAKDOWN ANALYSIS ===");

        // Cek struktur from_rencana_belajar
        const fromRencana = response.data.breakdown.from_rencana_belajar;
        console.log(
          "From Rencana Belajar:",
          JSON.stringify(fromRencana, null, 2)
        );
        console.log(
          "From Rencana Units Keys:",
          fromRencana?.units ? Object.keys(fromRencana.units) : "NO UNITS KEY"
        );
        console.log(
          "From Rencana Units Values:",
          fromRencana?.units
            ? Object.values(fromRencana.units)
            : "NO UNITS VALUES"
        );

        // Cek struktur from_paket
        const fromPaket = response.data.breakdown.from_paket;
        console.log("From Paket:", JSON.stringify(fromPaket, null, 2));
        console.log(
          "From Paket Units Keys:",
          fromPaket?.units ? Object.keys(fromPaket.units) : "NO UNITS KEY"
        );
        console.log(
          "From Paket Units Values:",
          fromPaket?.units ? Object.values(fromPaket.units) : "NO UNITS VALUES"
        );

        // Test untuk specific unit
        const testUnit = 1;
        console.log(`=== TEST UNIT ${testUnit} ACCESS ===`);

        // Test rencana belajar
        const rencanaBelajarHasUnit = fromRencana?.units
          ? Object.values(fromRencana.units).some(
              (arr) => Array.isArray(arr) && arr.includes(testUnit)
            )
          : false;
        console.log(
          `Unit ${testUnit} di rencana belajar:`,
          rencanaBelajarHasUnit
        );

        // Test paket
        const paketHasUnit = fromPaket?.units
          ? Object.values(fromPaket.units).some(
              (arr) => Array.isArray(arr) && arr.includes(testUnit)
            )
          : false;
        console.log(`Unit ${testUnit} di paket:`, paketHasUnit);

        // Compare dengan unlocked_units
        console.log("=== COMPARE WITH UNLOCKED UNITS ===");
        console.log("Final unlocked_units:", response.data.unlocked_units);
        console.log(
          "Final unlocked_units for",
          modul,
          ":",
          response.data.unlocked_units[modul]
        );
      }

      console.log("=== EXPECTED vs ACTUAL ===");
      console.log(
        "Expected untuk Reading berdasarkan skill 21,22,26: [0,1,2,6]"
      );
      console.log(
        "Actual unlocked units:",
        response.data.unlocked_units?.reading
      );

      console.log("=== END DEBUG ===");
    } catch (error) {
      console.error("Materi: Failed to fetch unlocked units:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }
      setUnitAccess({
        unlockedUnits: [0],
        hasActiveFeedback: false,
        feedbackSkills: [],
        loading: false,
        error: error.response?.data?.message || "Failed to check unit access",
        breakdown: null,
      });
    }
  };

  const isUnitAccessible = (targetUnit) => {
    if (role !== "peserta") return true;
    if (!unitAccess.unlockedUnits) return false;
    return unitAccess.unlockedUnits.includes(targetUnit);
  };

  useEffect(() => {
    const urlUnit = searchParams.get("unit");
    const urlPageId = searchParams.get("page");

    console.log("Materi: URL params detected", {
      urlUnit,
      urlPageId,
      currentUnit: unit,
      currentModul: modul,
    });

    if (urlUnit !== null || urlPageId !== null) {
      console.log("Materi: URL navigation detected", {
        urlUnit,
        urlPageId,
        currentUnit: unit,
      });

      // 🔧 CRITICAL FIX: UPDATE UNIT IMMEDIATELY jika urlUnit valid
      if (urlUnit !== null && !isNaN(urlUnit)) {
        const targetUnit = parseInt(urlUnit);

        console.log("Materi: URL unit detected, updating immediately", {
          currentUnit: unit,
          targetUnit: targetUnit,
          isAccessible: role !== "peserta" || isUnitAccessible(targetUnit),
        });

        // 🔧 UPDATE STATE UNIT LANGSUNG
        if (targetUnit !== unit) {
          setUnit(targetUnit);
        }
      }

      setUrlNavigationTarget({
        targetUnit: urlUnit ? parseInt(urlUnit) : null,
        targetPageId: urlPageId ? parseInt(urlPageId) : null,
        processed: false,
      });
    }
  }, [searchParams, modul]);

  useEffect(() => {
    const urlUnit = searchParams.get("unit");

    if (urlUnit !== null && !isNaN(urlUnit)) {
      const targetUnit = parseInt(urlUnit);

      console.log("Materi: Direct URL unit update", {
        urlUnit: targetUnit,
        currentUnit: unit,
        shouldUpdate: targetUnit !== unit,
        isAccessible: role !== "peserta" || isUnitAccessible(targetUnit),
      });

      // 🔧 IMMEDIATE UPDATE JIKA UNIT BERBEDA
      if (targetUnit !== unit) {
        // Check accessibility untuk peserta
        if (role === "peserta" && !isUnitAccessible(targetUnit)) {
          console.log(
            "Materi: Access denied to target unit from URL:",
            targetUnit
          );
          setError(
            `Unit ${targetUnit} is locked. Complete your learning plan to unlock it.`
          );
          return;
        }

        // 🔧 UPDATE UNIT STATE
        setUnit(targetUnit);

        // Reset related states
        setPage(null);
        setSelectedPageId(null);
        setShowQuiz(false);
        setFormMode(null);
        setEditingPageId(null);
        setError("");

        console.log("Materi: Unit updated to:", targetUnit);
      }
    }
  }, [searchParams.get("unit"), role, isUnitAccessible]); // 🔧 Specific dependencies

  // ========== DEBUGGING: TAMBAH useEffect UNTUK MONITOR UNIT CHANGES ==========
  // Tambah ini untuk debug:

  useEffect(() => {
    console.log("Materi: Unit state changed to:", unit);
    console.log(
      "Materi: This will trigger fetchPages, checkQuiz, fetchProgressData"
    );
  }, [unit]);

  useEffect(() => {
    if (
      !urlNavigationTarget.processed &&
      (urlNavigationTarget.targetUnit !== null ||
        urlNavigationTarget.targetPageId !== null)
    ) {
      console.log("Materi: Processing URL navigation", {
        targetUnit: urlNavigationTarget.targetUnit,
        targetPageId: urlNavigationTarget.targetPageId,
        pagesLoaded: pages.length > 0,
        currentUnit: unit,
        availablePageIds: pages.map((p) => p.id),
        unitAccessLoaded: !unitAccess.loading,
      });

      if (unitAccess.loading) {
        console.log("Materi: Waiting for unit access data...");
        return;
      }

      if (
        urlNavigationTarget.targetUnit !== null &&
        urlNavigationTarget.targetUnit !== unit
      ) {
        if (!isUnitAccessible(urlNavigationTarget.targetUnit)) {
          console.log(
            "Materi: Access denied to target unit:",
            urlNavigationTarget.targetUnit
          );
          setError(
            `Unit ${urlNavigationTarget.targetUnit} is locked. Complete your learning plan to unlock it.`
          );
          setUrlNavigationTarget((prev) => ({ ...prev, processed: true }));

          if (searchParams.has("unit") || searchParams.has("page")) {
            navigate(`${getBasePath()}/materi/${modul}`, { replace: true });
          }
          return;
        }

        console.log(
          "Materi: Setting unit from URL:",
          urlNavigationTarget.targetUnit
        );
        setUnit(urlNavigationTarget.targetUnit);
        return;
      }

      if (urlNavigationTarget.targetPageId !== null && pages.length > 0) {
        const targetPage = pages.find(
          (p) => p.id === urlNavigationTarget.targetPageId
        );
        console.log("Materi: Looking for target page", {
          targetPageId: urlNavigationTarget.targetPageId,
          foundPage: targetPage ? targetPage.title : "NOT FOUND",
          allPagesInUnit: pages.map((p) => ({ id: p.id, title: p.title })),
        });

        if (targetPage) {
          console.log("Materi: Setting page from URL:", targetPage.title);
          setSelectedPageId(urlNavigationTarget.targetPageId);
          setPage(targetPage);

          setUrlNavigationTarget((prev) => ({ ...prev, processed: true }));

          if (searchParams.has("unit") || searchParams.has("page")) {
            navigate(`${getBasePath()}/materi/${modul}`, { replace: true });
          }
        } else {
          console.log(
            "Materi: Target page not found in current unit:",
            urlNavigationTarget.targetPageId
          );
          console.log(
            "Available pages:",
            pages.map((p) => `ID:${p.id} - ${p.title}`)
          );
          setUrlNavigationTarget((prev) => ({ ...prev, processed: true }));

          if (searchParams.has("unit") || searchParams.has("page")) {
            navigate(`${getBasePath()}/materi/${modul}`, { replace: true });
          }
        }
      } else if (
        urlNavigationTarget.targetUnit !== null &&
        urlNavigationTarget.targetPageId === null
      ) {
        console.log("Materi: URL navigation only for unit, no specific page");
        setUrlNavigationTarget((prev) => ({ ...prev, processed: true }));

        if (searchParams.has("unit") || searchParams.has("page")) {
          navigate(`${getBasePath()}/materi/${modul}`, { replace: true });
        }
      } else if (
        urlNavigationTarget.targetPageId !== null &&
        pages.length === 0
      ) {
        console.log(
          "Materi: Target page specified but pages not loaded yet, waiting..."
        );
      }
    }
  }, [
    urlNavigationTarget,
    pages,
    unit,
    modul,
    navigate,
    searchParams,
    unitAccess.loading,
  ]);

  useEffect(() => {
    fetchUnlockedUnits();
  }, [modul, role]);

  useEffect(() => {
    if (!unitAccess.loading && role === "peserta" && unit > 0) {
      if (!isUnitAccessible(unit)) {
        console.log(
          "Materi: Current unit access lost, redirecting to overview"
        );
        setError(
          `Unit ${unit} is no longer accessible. Redirected to overview.`
        );
        setUnit(0);
      }
    }
  }, [unitAccess.loading, unitAccess.unlockedUnits, unit, role]);

  const fetchProgressData = async () => {
    if (role !== "peserta") return;

    try {
      console.log("Materi: fetchProgressData called");
      const response = await axiosInstance.get(
        `/progress/unit?modul=${modul}&unit_number=${unit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Materi: Progress data received:", response.data);

      if (response.data.next_required_page) {
        console.log("Materi: Next required page analysis:", {
          id: response.data.next_required_page.id,
          title: response.data.next_required_page.title,
          titleValid:
            response.data.next_required_page.title &&
            response.data.next_required_page.title.length > 2,
          order_number: response.data.next_required_page.order_number,
        });

        if (
          !response.data.next_required_page.title ||
          response.data.next_required_page.title.length <= 2
        ) {
          console.warn(
            "Materi: Suspicious next required page title:",
            response.data.next_required_page.title
          );
        }
      }

      setProgressData(response.data);
    } catch (error) {
      console.error("Materi: Failed to fetch progress data:", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }

      setProgressData({
        completed_pages: [],
        can_access_quiz: false,
        next_required_page: null,
      });
    }
  };

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

  const getAvailableOrderNumbers = (excludeId = null, isCreating = false) => {
    const availableOrders = [];

    if (isCreating) {
      const usedOrderNumbers = pages
        .map((p) => p.order_number)
        .filter((o) => o)
        .sort((a, b) => a - b);

      if (usedOrderNumbers.length > 0) {
        for (let i = 1; i <= usedOrderNumbers.length; i++) {
          availableOrders.push({
            value: i,
            disabled: false,
            label: `${i} (sisipkan di posisi ${i})`,
          });
        }

        const nextOrder = usedOrderNumbers.length + 1;
        availableOrders.push({
          value: nextOrder,
          disabled: false,
          label: `${nextOrder} (tambah di akhir - recommended)`,
          isRecommended: true,
        });
      } else {
        availableOrders.push({
          value: 1,
          disabled: false,
          label: `1 (halaman pertama di unit ${unit})`,
          isRecommended: true,
        });
      }
    } else {
      const currentPage = pages.find((p) => p.id === excludeId);
      const currentPosition = currentPage?.order_number;

      const usedOrderNumbers = pages
        .map((p) => p.order_number)
        .filter((o) => o)
        .sort((a, b) => a - b);

      usedOrderNumbers.forEach((orderNum) => {
        availableOrders.push({
          value: orderNum,
          disabled: false,
          label:
            orderNum === currentPosition
              ? `${orderNum} (posisi saat ini)`
              : `${orderNum}`,
        });
      });
    }

    return availableOrders;
  };

  const fetchPages = async () => {
    try {
      setError("");

      console.log("Materi: Fetching pages for", { modul, unit });
      const res = await axiosInstance.get("/pages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const filtered = res.data.filter(
        (p) => p.modul === modul && p.unit_number === unit
      );
      const sorted = filtered.sort((a, b) => a.order_number - b.order_number);

      console.log("Materi: Pages fetched for", { modul, unit });
      console.log("Materi: Data integrity check:", {
        totalPages: sorted.length,
        pageDetails: sorted.map((p) => ({
          id: p.id,
          title: p.title,
          order: p.order_number,
          titleLength: p.title?.length || 0,
          titleValid: p.title && p.title.length > 1,
        })),
        suspiciousPages: sorted.filter((p) => !p.title || p.title.length <= 2),
      });

      if (urlNavigationTarget.targetPageId && !urlNavigationTarget.processed) {
        const targetPage = sorted.find(
          (p) => p.id === urlNavigationTarget.targetPageId
        );
        console.log("Materi: URL navigation check after fetch", {
          targetPageId: urlNavigationTarget.targetPageId,
          targetUnit: urlNavigationTarget.targetUnit,
          currentUnit: unit,
          currentModul: modul,
          foundTargetPage: targetPage
            ? `${targetPage.title} (${targetPage.id})`
            : "NOT FOUND",
          allPagesInUnit: sorted.map((p) => `${p.title} (ID:${p.id})`),
          isCorrectUnit: urlNavigationTarget.targetUnit === unit,
        });
      }

      setPages(sorted);
    } catch (e) {
      console.error("Materi: Fetch pages error:", e);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }
      setError(
        "Gagal mengambil data: " + (e.response?.data?.message || e.message)
      );
    }
  };
  const checkQuiz = async () => {
    // Unit 0 tidak ada quiz
    if (unit === 0) {
      setHasQuiz(false);
      return;
    }

    try {
      console.log("Checking quiz for:", { modul, unit, role });

      const res = await axiosInstance.get(
        `/questions?modul=${modul}&unit_number=${unit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Questions API response:", res.data);

      // PERBAIKAN: Handle response format baru dari controller
      let questionsData = [];

      if (Array.isArray(res.data)) {
        // Response langsung array
        questionsData = res.data;
      } else if (res.data.questions && Array.isArray(res.data.questions)) {
        // Response dengan property questions (FORMAT BARU)
        questionsData = res.data.questions;
      } else if (res.data && typeof res.data === "object") {
        // Fallback: cari array di property manapun
        questionsData = res.data.questions || res.data.data || [];
      }

      const hasQuestions = questionsData.length > 0;
      setHasQuiz(hasQuestions);

      console.log("Quiz check result:", {
        modul,
        unit,
        totalQuestions: res.data.total_questions || questionsData.length,
        hasQuiz: hasQuestions,
        filter: res.data.filter,
        sampleQuestion: questionsData[0]?.question_text?.substring(0, 50),
      });
    } catch (err) {
      console.error("Check quiz error:", err);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }
      console.error("Error details:", {
        status: err.response?.status,
        data: err.response?.data,
      });

      if (err.response?.status === 403) {
        console.log("Quiz access denied (403) for unit", unit);
        setHasQuiz(false);
      } else {
        setHasQuiz(false);
      }
    }
  };

  const handleUnitChange = (newUnit) => {
    if (role === "peserta" && !isUnitAccessible(newUnit)) {
      setError(
        `Unit ${newUnit} is locked. Complete your learning plan to unlock it.`
      );
      return;
    }

    setUnit(newUnit);
    setFormMode(null);
    setEditingPageId(null);
    setShowQuiz(false);
    setPage(null);
    setSelectedPageId(null);
    setError("");
    setProgressData({
      completed_pages: [],
      can_access_quiz: false,
      next_required_page: null,
    });

    setUrlNavigationTarget({
      targetUnit: null,
      targetPageId: null,
      processed: true,
    });
  };

  const handlePageSelection = (selectedPage, freshProgressData = null) => {
    console.log("Materi: handlePageSelection called", {
      selectedPage: selectedPage.title,
      pageId: selectedPage.id,
      role,
      hasFreshData: !!freshProgressData,
    });

    if (role === "peserta") {
      const pageIndex = pages.findIndex((p) => p.id === selectedPage.id);
      const currentProgressData = freshProgressData || progressData;
      const completedPageIds = currentProgressData.completed_pages || [];

      console.log("Materi: Access check for page selection", {
        pageIndex,
        completedPageIds,
        currentPage: selectedPage.title,
      });

      for (let i = 0; i < pageIndex; i++) {
        if (!completedPageIds.includes(pages[i].id)) {
          console.log("Materi: Access denied for page selection:", {
            blockingPage: pages[i].title,
            blockingPageId: pages[i].id,
            position: i,
          });
          setError(
            `You must complete "${pages[i].title}" first before accessing this page.`
          );
          return;
        }
      }
    }

    setShowQuiz(false);
    setPage(selectedPage);
    setSelectedPageId(selectedPage.id);
    setFormMode(null);
    setEditingPageId(null);
    setError("");

    if (freshProgressData) {
      console.log("Materi: Updating progress data with fresh data");
      setProgressData(freshProgressData);
    } else if (role === "peserta") {
      fetchProgressData();
    }
  };

  useEffect(() => {
    fetchPages();
    checkQuiz();
    fetchProgressData();
  }, [unit, modul]);

  useEffect(() => {
    if (showQuiz) {
      return;
    }

    if (pages.length === 0) {
      setPage(null);
      setSelectedPageId(null);
      return;
    }

    console.log("Materi: Page selection logic triggered", {
      pagesCount: pages.length,
      selectedPageId,
      urlNavigationProcessed: urlNavigationTarget.processed,
      urlNavigationTargetPageId: urlNavigationTarget.targetPageId,
      currentPage: page?.id,
    });

    if (
      !urlNavigationTarget.processed &&
      urlNavigationTarget.targetPageId !== null
    ) {
      console.log("Materi: Waiting for URL navigation to be processed");

      const targetPage =
        pages.find((p) => p.id === urlNavigationTarget.targetPageId) ||
        pages.find((p) => p.id == urlNavigationTarget.targetPageId) ||
        pages.find((p) => p.id === String(urlNavigationTarget.targetPageId)) ||
        pages.find((p) => p.id === Number(urlNavigationTarget.targetPageId));

      if (targetPage) {
        console.log(
          "Materi: Force processing URL navigation with loaded pages",
          {
            targetPageId: urlNavigationTarget.targetPageId,
            foundPage: targetPage.title,
            foundPageId: targetPage.id,
          }
        );

        setSelectedPageId(targetPage.id);
        setPage(targetPage);
        setUrlNavigationTarget((prev) => ({ ...prev, processed: true }));

        if (searchParams.has("unit") || searchParams.has("page")) {
          navigate(`${getBasePath()}/materi/${modul}`, { replace: true });
        }
        return;
      } else {
        console.log(
          "Materi: URL target page not found, proceeding with normal flow"
        );
        setUrlNavigationTarget((prev) => ({ ...prev, processed: true }));

        if (searchParams.has("unit") || searchParams.has("page")) {
          navigate(`${getBasePath()}/materi/${modul}`, { replace: true });
        }
      }
    }

    if (
      urlNavigationTarget.processed &&
      urlNavigationTarget.targetPageId !== null &&
      selectedPageId === urlNavigationTarget.targetPageId
    ) {
      console.log("Materi: URL navigation completed, keeping target page");
      return;
    }

    if (selectedPageId) {
      const targetPage = pages.find((p) => p.id === selectedPageId);
      if (targetPage) {
        if (role === "peserta") {
          const pageIndex = pages.findIndex((p) => p.id === targetPage.id);
          const completedPageIds = progressData.completed_pages || [];

          let canAccess = true;
          let blockingPageTitle = "";
          for (let i = 0; i < pageIndex; i++) {
            if (!completedPageIds.includes(pages[i].id)) {
              canAccess = false;
              blockingPageTitle = pages[i].title;
              break;
            }
          }

          if (!canAccess) {
            console.log(
              "Materi: Access denied, blocking page:",
              blockingPageTitle
            );
            const firstIncomplete = pages.find(
              (p) => !completedPageIds.includes(p.id)
            );
            if (firstIncomplete) {
              setPage(firstIncomplete);
              setSelectedPageId(firstIncomplete.id);
              setError(
                `You must complete "${blockingPageTitle}" first before accessing "${targetPage.title}".`
              );
              return;
            }
          }
        }

        setPage(targetPage);
        return;
      } else {
        setSelectedPageId(null);
      }
    }

    if (role === "peserta" && progressData.completed_pages) {
      const firstIncomplete = pages.find(
        (p) => !progressData.completed_pages.includes(p.id)
      );
      if (firstIncomplete) {
        setPage(firstIncomplete);
        setSelectedPageId(firstIncomplete.id);
        return;
      }
    }

    if (!page || !pages.find((p) => p.id === page.id)) {
      const firstPage = pages[0];
      setPage(firstPage);
      setSelectedPageId(firstPage.id);
      return;
    }

    const currentPageStillExists = pages.find((p) => p.id === page.id);
    if (currentPageStillExists) {
      setPage(currentPageStillExists);
      setSelectedPageId(currentPageStillExists.id);
    } else {
      const firstPage = pages[0];
      setPage(firstPage);
      setSelectedPageId(firstPage.id);
    }
  }, [
    pages,
    showQuiz,
    progressData.completed_pages,
    role,
    selectedPageId,
    page,
    urlNavigationTarget.processed,
    urlNavigationTarget.targetPageId,
    searchParams,
    navigate,
    modul,
  ]);

  useEffect(() => {
    if (formMode) {
      setShowQuiz(false);
    }
  }, [formMode]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      e.target.value = "";
      return;
    }

    setForm({
      ...form,
      attachment_file: file,
      attachment: "",
    });
    setError("");
  };

  const validateForm = () => {
    const errors = [];
    if (!form.title?.trim()) errors.push("Judul wajib diisi");
    if (!form.order_number || form.order_number < 1)
      errors.push("Order number harus >= 1");
    return errors;
  };

  const handleOrderNumberChange = (newOrderNumber) => {
    if (
      formMode === "edit" &&
      originalOrderNumber &&
      newOrderNumber !== originalOrderNumber
    ) {
      setShowOrderWarning(true);
    } else {
      setShowOrderWarning(false);
    }
    setForm({ ...form, order_number: newOrderNumber });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError("Validasi gagal: " + validationErrors.join(", "));
      return;
    }


    if (formMode === "edit" && !editingPageId) {
      setError("Tidak ada halaman yang dipilih untuk diedit");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("description", form.description || "");
    formData.append("order_number", form.order_number.toString());
    formData.append("modul", modul);
    formData.append("unit_number", unit.toString());

    if (form.attachment_file) {
      formData.append("attachment", form.attachment_file);
    }

    try {
      let response;
      let savedPage;

      if (formMode === "create") {
        response = await axiosInstance.post("/pages", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        savedPage = response.data;
      } else if (formMode === "edit" && editingPageId) {
        formData.append("_method", "PUT");
        response = await axiosInstance.post(
          `/pages/${editingPageId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        savedPage = response.data;
      }

      resetForm();
      await fetchPages();
      await fetchProgressData();

      if (savedPage) {
        setSelectedPageId(savedPage.id);
      }
    } catch (err) {
      console.error("Submit error:", err);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }
      const errorMessage =
        err.response?.data?.message || err.response?.data?.error || err.message;
      setError("Gagal menyimpan: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const pageToDelete =
      formMode === "edit" && editingPageId
        ? pages.find((p) => p.id === editingPageId)
        : page;

    if (!pageToDelete) {
      setError("Tidak ada halaman yang dipilih untuk dihapus");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axiosInstance.delete(`/pages/${pageToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFormMode(null);
      setEditingPageId(null);
      setForm({
        title: "",
        attachment: "",
        description: "",
        order_number: 1,
        attachment_file: null,
      });

      await fetchPages();
      await fetchProgressData();
    } catch (err) {
      console.error("Delete error:", err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }
      const errorMessage =
        err.response?.data?.message || err.response?.data?.error || err.message;
      setError("Gagal menghapus: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      attachment: "",
      description: "",
      order_number: 1,
      attachment_file: null,
    });
    setFormMode(null);
    setEditingPageId(null);
    setError("");
    setOriginalOrderNumber(null);
    setShowOrderWarning(false);
  };

  const createPage = () => {
    const availableOrders = getAvailableOrderNumbers(null, true);
    const recommendedOrder =
      availableOrders.find((o) => o.isRecommended)?.value || pages.length + 1;

    setForm({
      title: "",
      attachment: "",
      description: "",
      order_number: recommendedOrder,
      attachment_file: null,
    });
    setFormMode("create");
    setEditingPageId(null);
    setError("");
    setOriginalOrderNumber(null);
    setShowOrderWarning(false);
  };

  const editPage = () => {
    if (!page) {
      setError("Tidak ada halaman yang dipilih untuk diedit");
      return;
    }

    setEditingPageId(page.id);

    setForm({
      title: page.title || "",
      attachment: page.attachment || "",
      description: page.description || "",
      order_number: page.order_number || 1,
      attachment_file: null,
    });
    setFormMode("edit");
    setError("");

    setOriginalOrderNumber(page.order_number);
    setShowOrderWarning(false);
  };

  const handlePrev = () => {
    if (showQuiz) {
      setShowQuiz(false);
      if (pages.length > 0) {
        const lastPage = pages[pages.length - 1];
        setPage(lastPage);
        setSelectedPageId(lastPage.id);

        if (role === "peserta") {
          setTimeout(() => {
            fetchProgressData();
          }, 100);
        }
      }
    } else if (page) {
      const index = pages.findIndex((p) => p.id === page.id);
      if (index > 0) {
        const prevPage = pages[index - 1];
        handlePageSelection(prevPage);
      }
    }
  };

  const handleNext = (freshProgressDataOrNull = null) => {
    console.log("Materi: handleNext called", {
      currentPageId: page?.id,
      currentPageTitle: page?.title,
      hasFreshProgressData: !!freshProgressDataOrNull,
      freshData: freshProgressDataOrNull,
    });

    if (!showQuiz && page) {
      const index = pages.findIndex((p) => p.id === page.id);
      console.log("Materi: Current page index:", index, "of", pages.length);

      if (index === pages.length - 1) {
        console.log("Materi: On last page, checking quiz access");

        if (unit === 0) {
          setError("Unit pengenalan tidak memiliki latihan.");
          return;
        }

        if (role === "instruktur") {
          console.log("Materi: Instructor - going to quiz");
          setPage(null);
          setSelectedPageId(null);
          setShowQuiz(true);
        } else if (role === "peserta") {
          let canAccessQuiz;
          let progressDataToUse;

          if (freshProgressDataOrNull) {
            console.log("Materi: Using fresh progress data for quiz access");
            progressDataToUse = freshProgressDataOrNull;
            canAccessQuiz = freshProgressDataOrNull.can_access_quiz;
            setProgressData(freshProgressDataOrNull);
          } else {
            console.log("Materi: Using current progress data for quiz access");
            progressDataToUse = progressData;
            canAccessQuiz = progressData.can_access_quiz;
          }

          console.log("Materi: Quiz access check result:", {
            canAccessQuiz,
            hasQuiz,
            completedPages: progressDataToUse.completed_pages?.length || 0,
            totalPages: pages.length,
          });

          if (canAccessQuiz && hasQuiz) {
            console.log("Materi: Student can access quiz - navigating");
            setPage(null);
            setSelectedPageId(null);
            setShowQuiz(true);
          } else if (!canAccessQuiz) {
            console.log("Materi: Student cannot access quiz yet");
            setError(
              "Complete all pages in this unit before accessing the quiz."
            );
          }
        }
      } else if (index >= 0 && index < pages.length - 1) {
        const nextPage = pages[index + 1];
        console.log("Materi: Moving to next page:", nextPage.title);

        handlePageSelection(nextPage, freshProgressDataOrNull);
      }
    }
  };

  const handleJumpToPage = (targetPage) => {
    handlePageSelection(targetPage);
  };

  const handleJumpToQuiz = () => {
    if (unit === 0) {
      setError("Unit pengenalan tidak memiliki latihan.");
      return;
    }

    if (role === "peserta" && !progressData.can_access_quiz) {
      setError("Complete all pages in this unit before accessing the quiz.");
      return;
    }

    setFormMode(null);
    setEditingPageId(null);
    setPage(null);
    setSelectedPageId(null);
    setShowQuiz(true);
  };

  const handleBackToPages = () => {
    setShowQuiz(false);
    setFormMode(null);
    setEditingPageId(null);
    if (pages.length > 0) {
      if (role === "peserta" && progressData.completed_pages) {
        const firstIncomplete = pages.find(
          (p) => !progressData.completed_pages.includes(p.id)
        );
        const targetPage = firstIncomplete || pages[0];
        setPage(targetPage);
        setSelectedPageId(targetPage.id);
      } else {
        const firstPage = pages[0];
        setPage(firstPage);
        setSelectedPageId(firstPage.id);
      }
    }
  };

  const unitList =
    modul === "reading"
      ? [0, 1, 2, 3, 4, 5, 6]
      : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  if (unitAccess.loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #B6252A",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem auto",
            }}
          ></div>
          <div style={{ color: "#6c757d" }}>Loading unit access...</div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Poppins', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Error/Loading Messages */}
      {(error || loading || unitAccess.error) && (
        <div style={{ flexShrink: 0 }}>
          {(error || unitAccess.error) && (
            <div
              style={{
                color: "#721c24",
                backgroundColor: "#f8d7da",
                padding: "0.75rem 1.5rem",
                border: "1px solid #f5c6cb",
                borderBottom: "none",
                fontSize: "0.9rem",
              }}
            >
              <strong>Error:</strong> {error || unitAccess.error}
            </div>
          )}

          {loading && (
            <div
              style={{
                color: "#004085",
                backgroundColor: "#cce7ff",
                padding: "0.75rem 1.5rem",
                border: "1px solid #b3d7ff",
                borderBottom: "none",
                fontSize: "0.9rem",
              }}
            >
              <strong>Loading...</strong>
            </div>
          )}
        </div>
      )}

      {/* Warning Messages */}
      {role === "peserta" && progressData.next_required_page && (
        <div
          style={{
            color: "#856404",
            backgroundColor: "#fff3cd",
            padding: "0.75rem 1.5rem",
            border: "1px solid #ffeaa7",
            borderBottom: "none",
            textAlign: "center",
            flexShrink: 0,
            fontSize: "0.9rem",
          }}
        >
          <strong>Sequential Learning Active</strong>
          <span style={{ marginLeft: "0.5rem" }}>
            Complete pages in order. Next required: "
            {progressData.next_required_page.title}"
          </span>
        </div>
      )}

      {role === "peserta" && !unitAccess.hasActiveFeedback && (
        <div
          style={{
            color: "#721c24",
            backgroundColor: "#f8d7da",
            padding: "0.75rem 1.5rem",
            border: "1px solid #f5c6cb",
            borderBottom: "none",
            textAlign: "center",
            flexShrink: 0,
            fontSize: "0.9rem",
          }}
        >
          <strong>No Active Learning Plan</strong>
          <span style={{ marginLeft: "0.5rem" }}>
            You can only access unit overview. Complete your learning plan
            application to unlock more units.
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          gap: "1.5rem",
          padding: "1.5rem",
          minHeight: 0,
        }}
      >
        <UnitSidebar
          units={unitList}
          selectedUnit={unit}
          onSelect={handleUnitChange}
          unlockedUnits={unitAccess.unlockedUnits}
          role={role}
          unitAccessBreakdown={unitAccess.breakdown} // TAMBAHAN: Pass breakdown
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          {formMode ? (
            <div
              style={{
                backgroundColor: "white",
                border: "1px solid #e9ecef",
                borderRadius: "8px",
                padding: "1.5rem",
                height: "100%",
                overflow: "auto",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h3
                style={{
                  color: "#B6252A",
                  marginTop: "0",
                  marginBottom: "1.5rem",
                  fontSize: "1.25rem",
                  fontWeight: "600",
                }}
              >
                {formMode === "create"
                  ? "Tambah Halaman Baru"
                  : `Edit Halaman: ${
                      pages.find((p) => p.id === editingPageId)?.title ||
                      "Unknown"
                    }`}
              </h3>


              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                  maxWidth: "600px",
                }}
              >
                <div>
                  <label
                    style={{
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                      display: "block",
                      fontSize: "0.9rem",
                    }}
                  >
                    Judul Halaman:
                  </label>
                  <input
                    type="text"
                    value={form.title || ""}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="Masukkan judul halaman..."
                    required
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ced4da",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                      display: "block",
                      fontSize: "0.9rem",
                    }}
                  >
                    Upload Lampiran (Opsional):
                    <br />
                    <small
                      style={{
                        color: "#6c757d",
                        fontWeight: "400",
                        fontSize: "0.8rem",
                      }}
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
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #ced4da",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>

                {(form.attachment || form.attachment_file) && (
                  <div
                    style={{
                      border: "1px solid #e9ecef",
                      padding: "1rem",
                      borderRadius: "6px",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 0.5rem 0",
                        fontSize: "0.9rem",
                        fontWeight: "600",
                      }}
                    >
                      Preview Lampiran:
                    </p>
                    {form.attachment_file ? (
                      <div>
                        <p style={{ fontSize: "0.8rem" }}>
                          File yang akan diupload: {form.attachment_file.name}
                        </p>
                        <p style={{ fontSize: "0.8rem" }}>
                          Ukuran:{" "}
                          {(form.attachment_file.size / 1024 / 1024).toFixed(2)}{" "}
                          MB
                        </p>
                        {form.attachment_file.type.startsWith("image/") && (
                          <img
                            src={URL.createObjectURL(form.attachment_file)}
                            style={{
                              maxWidth: "300px",
                              maxHeight: "200px",
                              objectFit: "contain",
                              border: "1px solid #e9ecef",
                              borderRadius: "6px",
                            }}
                            alt="Preview"
                            onLoad={(e) => {
                              setTimeout(() => {
                                URL.revokeObjectURL(e.target.src);
                              }, 1000);
                            }}
                          />
                        )}
                        {form.attachment_file.type.startsWith("audio/") && (
                          <audio
                            src={URL.createObjectURL(form.attachment_file)}
                            controls
                            style={{ width: "100%", maxWidth: "300px" }}
                          />
                        )}
                        {form.attachment_file.type.startsWith("video/") && (
                          <video
                            src={URL.createObjectURL(form.attachment_file)}
                            controls
                            style={{
                              maxWidth: "300px",
                              maxHeight: "200px",
                              border: "1px solid #e9ecef",
                              borderRadius: "6px",
                            }}
                          />
                        )}
                      </div>
                    ) : form.attachment ? (
                      <div>
                        <p style={{ fontSize: "0.8rem" }}>
                          Lampiran saat ini: {form.attachment.split("/").pop()}
                        </p>
                        {form.attachment.match(/\.(jpg|jpeg|png|gif)$/i) && (
                          <img
                            src={`http://localhost:8000${form.attachment}`}
                            style={{
                              maxWidth: "300px",
                              maxHeight: "200px",
                              objectFit: "contain",
                              border: "1px solid #e9ecef",
                              borderRadius: "6px",
                            }}
                            alt="Preview"
                          />
                        )}
                        {form.attachment.match(/\.(mp3|wav|ogg)$/i) && (
                          <audio
                            src={`http://localhost:8000${form.attachment}`}
                            controls
                            style={{ width: "100%", maxWidth: "300px" }}
                          />
                        )}
                        {form.attachment.match(/\.(mp4|webm)$/i) && (
                          <video
                            src={`http://localhost:8000${form.attachment}`}
                            controls
                            style={{
                              maxWidth: "300px",
                              maxHeight: "200px",
                              border: "1px solid #e9ecef",
                              borderRadius: "6px",
                            }}
                          />
                        )}
                      </div>
                    ) : null}
                  </div>
                )}

                <div>
                  <label
                    style={{
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                      display: "block",
                      fontSize: "0.9rem",
                    }}
                  >
                    Deskripsi:
                  </label>
                  <textarea
                    value={form.description || ""}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Masukkan deskripsi halaman..."
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ced4da",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                      display: "block",
                      fontSize: "0.9rem",
                    }}
                  >
                    Nomor Urut:
                  </label>
                  <select
                    value={form.order_number || ""}
                    onChange={(e) => {
                      const newOrder = parseInt(e.target.value);
                      handleOrderNumberChange(newOrder);
                    }}
                    required
                    style={{
                      width: "200px",
                      padding: "0.75rem",
                      border: "1px solid #ced4da",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                    }}
                  >
                    <option value="">Pilih Nomor Urut</option>
                    {getAvailableOrderNumbers(
                      formMode === "edit" ? editingPageId : null,
                      formMode === "create"
                    ).map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                        style={{
                          fontWeight: option.isRecommended ? "600" : "400",
                        }}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {formMode === "create" && (
                    <small
                      style={{
                        display: "block",
                        marginTop: "0.5rem",
                        color: "#6c757d",
                        fontSize: "0.8rem",
                      }}
                    >
                      Recommended: posisi di akhir untuk urutan yang rapi
                    </small>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    marginTop: "1rem",
                  }}
                >
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      backgroundColor: loading ? "#6c757d" : "#B6252A",
                      color: "white",
                      border: "none",
                      padding: "0.75rem 1.5rem",
                      borderRadius: "6px",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                    }}
                  >
                    {loading
                      ? "Menyimpan..."
                      : formMode === "create"
                      ? "Simpan Halaman"
                      : "Update Halaman"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    style={{
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      padding: "0.75rem 1.5rem",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                    }}
                  >
                    Batal
                  </button>
                  {formMode === "edit" && (
                    <Confirm
                      title="Konfirmasi Hapus?"
                      description="Data yang dihapus tidak dapat dikembalikan."
                      confirmText="HAPUS"
                      confirmButtonType="danger"
                      onConfirm={async () => {
                        const pageToDelete =
                          formMode === "edit" && editingPageId
                            ? pages.find((p) => p.id === editingPageId)
                            : page;

                        if (!pageToDelete) {
                          setError(
                            "Tidak ada halaman yang dipilih untuk dihapus"
                          );
                          return;
                        }

                        setLoading(true);
                        setError("");

                        try {
                          await axiosInstance.delete(
                            `/pages/${pageToDelete.id}`,
                            {
                              headers: { Authorization: `Bearer ${token}` },
                            }
                          );

                          setFormMode(null);
                          setEditingPageId(null);
                          setForm({
                            title: "",
                            attachment: "",
                            description: "",
                            order_number: 1,
                            attachment_file: null,
                          });

                          await fetchPages();
                          await fetchProgressData();
                        } catch (err) {
                          console.error("Delete error:", err);
                          if (
                            axios.isAxiosError(err) &&
                            err.response?.status === 401
                          ) {
                            localStorage.removeItem("AuthToken");
                            localStorage.removeItem("role");
                            navigate("/login");
                            return;
                          }
                          const errorMessage =
                            err.response?.data?.message ||
                            err.response?.data?.error ||
                            err.message;
                          setError("Gagal menghapus: " + errorMessage);
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      <button
                        type="button"
                        disabled={loading}
                        style={{
                          backgroundColor: loading ? "#6c757d" : "#dc3545",
                          color: "white",
                          border: "none",
                          padding: "0.75rem 1.5rem",
                          borderRadius: "6px",
                          cursor: loading ? "not-allowed" : "pointer",
                          fontSize: "0.9rem",
                          fontWeight: "500",
                        }}
                      >
                        Hapus Halaman
                      </button>
                    </Confirm>
                  )}
                </div>
              </form>
            </div>
          ) : showQuiz ? (
            <QuizViewer
              modul={modul}
              unit={unit}
              isVisible={true}
              onCloseEditPage={() => setFormMode(null)}
              onBackToPages={handleBackToPages}
              pageList={pages}
              currentPageId={page?.id}
              onPageSelect={handleJumpToPage}
            />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div style={{ flex: 1, minHeight: 0 }}>
                <PageViewer
                  page={page}
                  onPrev={handlePrev}
                  onNext={handleNext}
                  pageList={pages}
                  onJump={handleJumpToPage}
                  extraMenu={null}
                  showQuiz={false}
                  currentPageId={page?.id}
                  onPageSelect={handleJumpToPage}
                  onQuizSelect={handleJumpToQuiz}
                  modul={modul}
                  unit={unit}
                  hasQuestions={hasQuiz}
                />
              </div>

              {role === "instruktur" && (
                <div
                  style={{
                    flexShrink: 0,
                    padding: "1rem",
                    backgroundColor: "white",
                    border: "1px solid #e9ecef",
                    borderRadius: "8px",
                    marginTop: "1.5rem",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={createPage}
                      disabled={loading}
                      style={{
                        backgroundColor: loading ? "#6c757d" : "#059669",
                        color: "white",
                        border: "none",
                        padding: "0.5rem 1rem",
                        borderRadius: "6px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                      }}
                    >
                      + Tambah Halaman
                    </button>

                    {page && !formMode && (
                      <button
                        onClick={editPage}
                        disabled={loading}
                        style={{
                          backgroundColor: loading ? "#6c757d" : "#ffc107",
                          color: "black",
                          border: "none",
                          padding: "0.5rem 1rem",
                          borderRadius: "6px",
                          cursor: loading ? "not-allowed" : "pointer",
                          fontSize: "0.85rem",
                          fontWeight: "500",
                        }}
                      >
                        Edit Halaman Ini
                      </button>
                    )}
                  </div>

                  {pages.length === 0 && (
                    <div
                      style={{
                        marginTop: "1rem",
                        padding: "1rem",
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #e9ecef",
                        borderRadius: "6px",
                        color: "#6c757d",
                        fontStyle: "italic",
                        fontSize: "0.85rem",
                        textAlign: "center",
                      }}
                    >
                      Belum ada halaman di unit ini. Silakan tambah halaman
                      pertama.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Materi;
