import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function QuizViewer({ 
  modul, 
  unit, 
  isVisible, 
  onCloseEditPage,
  onBackToPages,
  pageList,
  currentPageId,
  onPageSelect 
}) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formMode, setFormMode] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [progressData, setProgressData] = useState({
    can_access_quiz: true,
    completed_pages: [],
    next_required_page: null
  });

  const [form, setForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'a',
    explanation: '',
    order_number: 1,
    attachment: '',
    attachment_file: null
  });

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const fetchProgressData = async () => {
    if (role !== 'peserta') {
      setProgressData({ can_access_quiz: true, completed_pages: [], next_required_page: null });
      return;
    }

    try {
      const response = await api.get(`/progress/unit?modul=${modul}&unit_number=${unit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProgressData(response.data);

      if (!response.data.can_access_quiz && response.data.next_required_page) {
        setError(`Complete all pages first. Next required: "${response.data.next_required_page.title}"`);
      }

    } catch (err) {
      console.error('Failed to fetch progress data:', err);
      setProgressData({ can_access_quiz: false, completed_pages: [], next_required_page: null });
      setError("Failed to verify quiz access");
    }
  };

  const validateFile = (file) => {
    const validations = {
      'image/jpeg': { maxSize: 5 * 1024 * 1024, name: 'JPEG' },
      'image/png': { maxSize: 5 * 1024 * 1024, name: 'PNG' },
      'image/gif': { maxSize: 5 * 1024 * 1024, name: 'GIF' },
      'audio/mpeg': { maxSize: 10 * 1024 * 1024, name: 'MP3' },
      'audio/wav': { maxSize: 10 * 1024 * 1024, name: 'WAV' },
      'audio/ogg': { maxSize: 10 * 1024 * 1024, name: 'OGG' },
      'video/mp4': { maxSize: 20 * 1024 * 1024, name: 'MP4' },
      'video/webm': { maxSize: 20 * 1024 * 1024, name: 'WebM' }
    };

    const validation = validations[file.type];
    if (!validation) {
      return { 
        valid: false, 
        error: `Tipe file tidak didukung. Gunakan: JPG, PNG, GIF (≤5MB), MP3, WAV, OGG (≤10MB), MP4, WebM (≤20MB)` 
      };
    }

    if (file.size > validation.maxSize) {
      const maxMB = validation.maxSize / (1024 * 1024);
      return { 
        valid: false, 
        error: `File ${validation.name} terlalu besar. Maksimal ${maxMB}MB` 
      };
    }

    return { valid: true };
  };

  const getNextOrderNumber = () => {
    if (questions.length === 0) return 1;
    const maxOrder = Math.max(...questions.map(q => q.order_number || 0));
    return maxOrder + 1;
  };

  const getAvailableOrderNumbers = (excludeId = null, isCreating = false) => {
    const availableOrders = [];
    
    if (isCreating) {
      const usedOrderNumbers = questions
        .map(q => q.order_number)
        .filter(o => o)
        .sort((a, b) => a - b);
      
      if (usedOrderNumbers.length > 0) {
        for (let i = 1; i <= usedOrderNumbers.length; i++) {
          availableOrders.push({
            value: i,
            disabled: false,
            label: `${i} (sisipkan di posisi ${i})`
          });
        }
        
        const nextOrder = usedOrderNumbers.length + 1;
        availableOrders.push({
          value: nextOrder,
          disabled: false,
          label: `${nextOrder} (tambah di akhir - recommended)`,
          isRecommended: true
        });
      } else {
        availableOrders.push({
          value: 1,
          disabled: false,
          label: `1 (soal pertama di unit ${unit})`,
          isRecommended: true
        });
      }
    } else {
      const currentQuestion = questions.find(q => q.id === excludeId);
      const currentPosition = currentQuestion?.order_number;
      
      const usedOrderNumbers = questions
        .map(q => q.order_number)
        .filter(o => o)
        .sort((a, b) => a - b);
      
      usedOrderNumbers.forEach(orderNum => {
        availableOrders.push({
          value: orderNum,
          disabled: false,
          label: orderNum === currentPosition ? 
            `${orderNum} (posisi saat ini)` : 
            `${orderNum}`
        });
      });
    }

    return availableOrders;
  };

  const resetForm = () => {
    setForm({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'a',
      explanation: '',
      order_number: 1,
      attachment: '',
      attachment_file: null
    });
    setFormMode(null);
    setEditingId(null);
    setError("");
    setShowModal(false);
  };

  const fetchQuestions = async () => {
    try {
      setError("");
      
      const res = await api.get(`/questions?modul=${modul}&unit_number=${unit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Handle new API response format
      let questionsData = [];
      
      if (Array.isArray(res.data)) {
        questionsData = res.data;
      } else if (res.data.questions && Array.isArray(res.data.questions)) {
        questionsData = res.data.questions;
        
        if (res.data.filter) {
          console.log('Quiz access info:', res.data.filter);
        }
        if (res.data.unlocked_units) {
          console.log('Unlocked units:', res.data.unlocked_units);
        }
      }
      
      setQuestions(questionsData);
      setCurrent(0);
      setAnswers({});

      if (role === 'peserta' && questionsData.length > 0) {
        try {
          const jawab = await api.get(`/quiz/answers?modul=${modul}&unit_number=${unit}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setResult(jawab.data.length > 0 ? jawab.data : null);
        } catch (answerError) {
          console.log('No existing answers found');
          setResult(null);
        }
      }
      
    } catch (err) {
      console.error('Fetch questions error:', err);
      
      if (err.response?.status === 403) {
        setError('Akses ditolak ke unit ini. ' + (err.response?.data?.message || 'Unit belum terbuka untuk Anda.'));
        setQuestions([]);
      } else {
        setError('Gagal memuat data: ' + (err.response?.data?.message || err.message));
        setQuestions([]);
      }
    }
  };

  useEffect(() => {
    if (isVisible || role === 'instruktur') {
      fetchQuestions();
      fetchProgressData();
    }
  }, [modul, unit, isVisible, role]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      e.target.value = '';
      return;
    }

    setForm({ ...form, attachment_file: file, attachment: '' });
    setError("");
  };

  const validateForm = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError("Validasi gagal: " + validationErrors.join(", "));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('question_text', form.question_text.trim());
      formData.append('option_a', form.option_a.trim());
      formData.append('option_b', form.option_b.trim());
      formData.append('option_c', form.option_c.trim());
      formData.append('option_d', form.option_d.trim());
      formData.append('correct_option', form.correct_option);
      formData.append('explanation', (form.explanation || '').trim());
      formData.append('order_number', form.order_number.toString());
      formData.append('modul', modul);
      formData.append('unit_number', unit.toString());

      if (form.attachment_file) {
        formData.append('attachment', form.attachment_file);
      } else if (form.attachment) {
        formData.append('attachment', form.attachment);
      }

      if (formMode === 'edit') {
        await api.post(`/questions/${editingId}?_method=PUT`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data' 
          }
        });
      } else {
        await api.post('/questions', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data' 
          }
        });
      }

      resetForm();
      await fetchQuestions();
    } catch (err) {
      setError('Gagal menyimpan: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (q) => {
    onCloseEditPage?.();
    setEditingId(q.id);
    setForm({
      question_text: q.question_text || '',
      option_a: q.option_a || '',
      option_b: q.option_b || '',
      option_c: q.option_c || '',
      option_d: q.option_d || '',
      correct_option: q.correct_option || 'a',
      explanation: q.explanation || '',
      order_number: q.order_number || 1,
      attachment: q.attachment || '',
      attachment_file: null
    });
    setFormMode('edit');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus soal ini?')) return;

    setLoading(true);
    setError("");
    try {
      await api.delete(`/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchQuestions();
    } catch (err) {
      setError('Gagal menghapus: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const createQuestion = () => {
    onCloseEditPage?.();
    const availableOrders = getAvailableOrderNumbers(null, true);
    const recommendedOrder = availableOrders.find(o => o.isRecommended)?.value || getNextOrderNumber();
    
    setForm({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'a',
      explanation: '',
      order_number: recommendedOrder,
      attachment: '',
      attachment_file: null
    });
    setFormMode('create');
    setEditingId(null);
    setShowModal(true);
  };

  const handleSelect = (id, value) => {
    setAnswers({ ...answers, [id]: value });
  };

  const handleFinish = async () => {
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, selected_option]) => ({
          question_id: parseInt(questionId),
          selected_option
        }))
      };

      const res = await api.post('/quiz/submit', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setResult(res.data.results);
    } catch (err) {
      alert('Gagal submit quiz: ' + (err.response?.data?.message || err.message));
    }
  };

  const renderAttachment = (attachment) => {
    if (!attachment) return null;

    const attachmentUrl = attachment.startsWith('http') 
      ? attachment 
      : attachment.startsWith('/storage/') 
        ? `http://localhost:8000${attachment}`
        : `http://localhost:8000/storage/${attachment}`;

    if (attachment.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return (
        <img
          src={attachmentUrl}
          style={{ 
            maxWidth: "300px", 
            maxHeight: "200px", 
            objectFit: "contain",
            border: "1px solid #e9ecef",
            borderRadius: "6px"
          }}
          alt="Attachment"
        />
      );
    }

    if (attachment.match(/\.(mp3|wav|ogg)$/i)) {
      return (
        <audio 
          src={attachmentUrl} 
          controls 
          style={{ width: "100%", maxWidth: "300px" }}
        />
      );
    }

    if (attachment.match(/\.(mp4|webm)$/i)) {
      return (
        <video
          src={attachmentUrl}
          controls
          style={{ 
            maxWidth: "300px", 
            maxHeight: "200px",
            border: "1px solid #e9ecef",
            borderRadius: "6px"
          }}
        />
      );
    }

    return null;
  };

  const renderFilePreview = () => {
    if (form.attachment_file) {
      const file = form.attachment_file;
      const fileType = file.type;
      
      if (fileType.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        return (
          <div>
            <p>File terpilih: {file.name}</p>
            <p>Ukuran: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <img
              src={previewUrl}
              style={{ 
                maxWidth: "300px", 
                maxHeight: "200px", 
                objectFit: "contain",
                border: "1px solid #e9ecef",
                borderRadius: "6px"
              }}
              alt="Preview"
              onLoad={() => URL.revokeObjectURL(previewUrl)}
            />
          </div>
        );
      } else if (fileType.startsWith('audio/')) {
        const previewUrl = URL.createObjectURL(file);
        return (
          <div>
            <p>File terpilih: {file.name}</p>
            <p>Ukuran: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <audio 
              src={previewUrl} 
              controls 
              style={{ width: "100%", maxWidth: "300px" }}
              onLoad={() => URL.revokeObjectURL(previewUrl)}
            />
          </div>
        );
      } else if (fileType.startsWith('video/')) {
        const previewUrl = URL.createObjectURL(file);
        return (
          <div>
            <p>File terpilih: {file.name}</p>
            <p>Ukuran: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <video
              src={previewUrl}
              controls
              style={{ 
                maxWidth: "300px", 
                maxHeight: "200px",
                border: "1px solid #e9ecef",
                borderRadius: "6px"
              }}
              onLoad={() => URL.revokeObjectURL(previewUrl)}
            />
          </div>
        );
      } else {
        return (
          <div>
            <p>File terpilih: {file.name}</p>
            <p>Ukuran: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <p>Tipe: {file.type}</p>
          </div>
        );
      }
    }
    return null;
  };

  if (role === 'peserta' && !progressData.can_access_quiz && questions.length === 0) {
    return (
      <div style={{ 
        display: "flex",
        gap: "1.5rem",
        height: "100%",
        fontFamily: "'Poppins', sans-serif"
      }}>
        
        {pageList && pageList.length > 0 && (
          <div style={{
            width: "80px",
            backgroundColor: "white",
            border: "1px solid #e9ecef",
            borderRadius: "8px",
            padding: "0.75rem",
            height: "fit-content",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem"
            }}>
              <h4 style={{ 
                margin: "0",
                color: "#495057",
                fontSize: "0.8rem",
                fontWeight: "600"
              }}>
                Pages
              </h4>
              {onBackToPages && (
                <button
                  onClick={onBackToPages}
                  style={{
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.7rem"
                  }}
                >
                  ←
                </button>
              )}
            </div>
            <div style={{ marginBottom: "0.5rem", height: "1px", backgroundColor: "#dee2e6" }}></div>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem"
            }}>
              {pageList.map((p, index) => {
                const pageCompleted = role === 'peserta' ? 
                  progressData.completed_pages?.includes(p.id) : true;
                
                return (
                  <button
                    key={p.id}
                    onClick={() => onPageSelect && onPageSelect(p)}
                    style={{
                      backgroundColor: pageCompleted ? "#059669" : "#e9ecef",
                      color: pageCompleted ? "white" : "#495057",
                      border: "none",
                      padding: "0.5rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      textAlign: "center",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      minWidth: "32px"
                    }}
                    title={p.title}
                  >
                    {index + 1}
                  </button>
                );
              })}
              
              <div style={{ margin: "0.5rem 0", height: "1px", backgroundColor: "#dee2e6" }}></div>
              <div style={{
                backgroundColor: "#B6252A",
                color: "white",
                padding: "0.5rem",
                borderRadius: "4px",
                textAlign: "center",
                fontSize: "0.8rem",
                fontWeight: "600"
              }}>
                Quiz
              </div>
            </div>
          </div>
        )}

        <div style={{ 
          flex: 1,
          padding: "2rem",
          textAlign: "center",
          backgroundColor: "#fff3cd",
          border: "1px solid #ffeaa7",
          borderRadius: "8px"
        }}>
          <h3 style={{ 
            margin: "0 0 1rem 0", 
            color: "#856404",
            fontWeight: "600"
          }}>
            Quiz Access Restricted
          </h3>
          <p style={{ 
            margin: "0 0 1.5rem 0", 
            color: "#856404",
            fontSize: "1rem",
            lineHeight: "1.5"
          }}>
            You must complete all pages in this unit before accessing the quiz.
          </p>
          
          {progressData.next_required_page && (
            <div style={{
              backgroundColor: "white",
              border: "1px solid #ffeaa7",
              borderRadius: "6px",
              padding: "1rem",
              marginBottom: "1.5rem"
            }}>
              <strong style={{ color: "#856404" }}>Next Required Page:</strong>
              <div style={{ 
                marginTop: "0.5rem",
                fontSize: "1rem",
                color: "#495057"
              }}>
                "{progressData.next_required_page.title}"
              </div>
            </div>
          )}

          {onBackToPages && (
            <button
              onClick={onBackToPages}
              style={{
                backgroundColor: "#B6252A",
                color: "white",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "600"
              }}
            >
              Go Back to Pages
            </button>
          )}
        </div>
      </div>
    );
  }

  if (role === 'peserta' && questions.length === 0) {
    console.log('QuizViewer debug:', {
      isVisible,
      questionsLength: questions.length,
      canAccessQuiz: progressData.can_access_quiz,
      progressData
    });
    return (
      <div style={{ padding: '1rem', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7' }}>
        <h3>Quiz Debug Info</h3>
        <p>isVisible: {String(isVisible)}</p>
        <p>questions.length: {questions.length}</p>
        <p>can_access_quiz: {String(progressData.can_access_quiz)}</p>
        <pre>{JSON.stringify(progressData, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div style={{ 
      display: "flex",
      gap: "1.5rem",
      height: "100%",
      fontFamily: "'Poppins', sans-serif"
    }}>
      
      {pageList && pageList.length > 0 && (
        <div style={{
          width: "80px",
          backgroundColor: "white",
          border: "1px solid #e9ecef",
          borderRadius: "8px",
          padding: "0.75rem",
          height: "fit-content",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem"
          }}>
            <h4 style={{ 
              margin: "0",
              color: "#495057",
              fontSize: "0.8rem",
              fontWeight: "600"
            }}>
              Pages
            </h4>
            {onBackToPages && (
              <button
                onClick={onBackToPages}
                style={{
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.7rem"
                }}
              >
                ←
              </button>
            )}
          </div>
          <div style={{ marginBottom: "0.5rem", height: "1px", backgroundColor: "#dee2e6" }}></div>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem"
          }}>
            {pageList.map((p, index) => {
              const pageCompleted = role === 'peserta' ? 
                progressData.completed_pages?.includes(p.id) : true;
              
              return (
                <button
                  key={p.id}
                  onClick={() => onPageSelect && onPageSelect(p)}
                  style={{
                    backgroundColor: pageCompleted ? "#059669" : "#e9ecef",
                    color: pageCompleted ? "white" : "#495057",
                    border: "none",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    cursor: "pointer",
                    textAlign: "center",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    minWidth: "32px"
                  }}
                  title={p.title}
                >
                  {index + 1}
                </button>
              );
            })}
            
            <div style={{ margin: "0.5rem 0", height: "1px", backgroundColor: "#dee2e6" }}></div>
            <div style={{
              backgroundColor: "#B6252A",
              color: "white",
              padding: "0.5rem",
              borderRadius: "4px",
              textAlign: "center",
              fontSize: "0.8rem",
              fontWeight: "600"
            }}>
              Quiz
            </div>
          </div>
        </div>
      )}

      <div style={{ 
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        border: "1px solid #e9ecef",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        
        {/* Fixed Header */}
        <div style={{
          flexShrink: 0,
          borderBottom: "1px solid #e9ecef"
        }}>
          {error && (
            <div style={{
              color: "#721c24",
              backgroundColor: "#f8d7da",
              padding: "0.75rem 1rem",
              border: "1px solid #f5c6cb",
              borderBottom: "none"
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {loading && (
            <div style={{
              color: "#004085",
              backgroundColor: "#cce7ff",
              padding: "0.75rem 1rem",
              border: "1px solid #b3d7ff",
              borderBottom: "none"
            }}>
              <strong>Loading...</strong>
            </div>
          )}

          <div style={{
            backgroundColor: "#f8f9fa",
            padding: "1.5rem",
            borderBottom: error || loading ? "1px solid #e9ecef" : "none"
          }}>
            <h3 style={{ 
              margin: "0",
              color: "#B6252A",
              fontSize: "1.25rem",
              fontWeight: "600"
            }}>
              Quiz Unit {unit}
            </h3>
            <div style={{ 
              marginTop: "0.5rem", 
              fontSize: "0.9rem", 
              color: "#6c757d"
            }}>
              {questions.length} soal tersedia
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ 
          flex: 1,
          overflow: "auto",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column"
        }}>
          {role === 'instruktur' ? (
            <>
              <div style={{ 
                marginBottom: "1.5rem",
                display: "flex",
                gap: "0.5rem"
              }}>
                <button 
                  onClick={createQuestion} 
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? "#6c757d" : "#B6252A",
                    color: "white",
                    border: "none",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "6px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: "600"
                  }}
                >
                  + Tambah Soal Quiz
                </button>
              </div>

              {questions.length === 0 ? (
                <div style={{ 
                  color: "#6c757d", 
                  fontStyle: "italic",
                  textAlign: "center",
                  padding: "3rem",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef"
                }}>
                  Belum ada soal quiz. Silakan tambah soal baru.
                </div>
              ) : (
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "1.5rem"
                }}>
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      style={{
                        border: "2px solid #B6252A",
                        borderRadius: "8px",
                        padding: "1.5rem",
                        backgroundColor: "#f8f9ff"
                      }}
                    >
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ 
                            color: "#B6252A", 
                            margin: "0 0 1rem 0",
                            fontSize: "1.1rem",
                            fontWeight: "600"
                          }}>
                            Soal #{q.order_number}
                          </h4>
                          <div style={{ marginBottom: "1rem" }}>
                            <strong>Pertanyaan:</strong> {q.question_text}
                          </div>
                          <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "0.75rem",
                            margin: "1rem 0",
                            padding: "1rem",
                            backgroundColor: "white",
                            borderRadius: "6px",
                            border: "1px solid #e9ecef"
                          }}>
                            <div><strong>A.</strong> {q.option_a}</div>
                            <div><strong>B.</strong> {q.option_b}</div>
                            <div><strong>C.</strong> {q.option_c}</div>
                            <div><strong>D.</strong> {q.option_d}</div>
                          </div>
                          <div style={{ fontSize: "0.9rem" }}>
                            <div><strong>Jawaban:</strong> {q.correct_option?.toUpperCase()}</div>
                          </div>
                          {q.explanation && (
                            <div style={{ marginTop: "1rem" }}>
                              <strong>Penjelasan:</strong> {q.explanation}
                            </div>
                          )}
                          {q.attachment && (
                            <div style={{ marginTop: "1rem" }}>
                              <strong>Lampiran:</strong>
                              <div style={{ marginTop: "0.5rem" }}>
                                {renderAttachment(q.attachment)}
                              </div>
                            </div>
                          )}
                        </div>
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                          marginLeft: "1rem",
                        }}>
                          <button
                            onClick={() => handleEdit(q)}
                            disabled={loading}
                            style={{
                              backgroundColor: loading ? "#6c757d" : "#ffc107",
                              color: "black",
                              border: "none",
                              padding: "0.5rem 1rem",
                              borderRadius: "4px",
                              cursor: loading ? "not-allowed" : "pointer",
                              fontWeight: "500"
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(q.id)}
                            disabled={loading}
                            style={{
                              backgroundColor: loading ? "#6c757d" : "#dc3545",
                              color: "white",
                              border: "none",
                              padding: "0.5rem 1rem",
                              borderRadius: "4px",
                              cursor: loading ? "not-allowed" : "pointer",
                              fontWeight: "500"
                            }}
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0
            }}>
              {questions.length > 0 && !result && (
                <div style={{
                  backgroundColor: "white",
                  border: "1px solid #e9ecef",
                  borderRadius: "8px",
                  padding: "2rem",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                  <div style={{ marginBottom: "2rem" }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1rem"
                    }}>
                      <h4 style={{ 
                        color: "#B6252A", 
                        margin: "0",
                        fontSize: "1.2rem",
                        fontWeight: "600"
                      }}>
                        Soal {current + 1} dari {questions.length}
                      </h4>
                      <div style={{
                        backgroundColor: "#f8f9fa",
                        padding: "0.5rem 1rem",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        color: "#6c757d",
                        fontWeight: "500"
                      }}>
                        Progress: {Object.keys(answers).length}/{questions.length}
                      </div>
                    </div>
                    
                    <div style={{ 
                      marginBottom: "1.5rem",
                      fontSize: "1.1rem",
                      lineHeight: "1.6",
                      color: "#495057"
                    }}>
                      <strong>{questions[current].question_text}</strong>
                    </div>

                    {questions[current].attachment && (
                      <div style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
                        <div style={{ 
                          marginBottom: "0.75rem",
                          fontSize: "0.9rem",
                          fontWeight: "600",
                          color: "#6c757d"
                        }}>
                          Lampiran:
                        </div>
                        <div style={{ 
                          padding: "1rem",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "8px",
                          border: "1px solid #e9ecef"
                        }}>
                          {renderAttachment(questions[current].attachment)}
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: "1.5rem" }}>
                      {['a', 'b', 'c', 'd'].map(opt => {
                        const currentQ = questions[current];
                        const answered = result?.find(r => r.question_id === currentQ.id);
                        const selected = answered ? answered.selected_option : answers[currentQ.id];

                        return (
                          <div key={opt} style={{ marginBottom: "1rem" }}>
                            <label style={{ 
                              display: "flex", 
                              alignItems: "flex-start", 
                              gap: "1rem",
                              padding: "1rem",
                              backgroundColor: selected === opt ? "#e3f2fd" : "#f8f9fa",
                              border: selected === opt ? "2px solid #2196f3" : "1px solid #e9ecef",
                              borderRadius: "8px",
                              cursor: answered ? "default" : "pointer",
                              transition: "all 0.2s ease"
                            }}>
                              <input
                                type="radio"
                                name={`q_${currentQ.id}`}
                                value={opt}
                                checked={selected === opt}
                                disabled={!!answered}
                                onChange={() => handleSelect(currentQ.id, opt)}
                                style={{
                                  width: "18px",
                                  height: "18px",
                                  marginTop: "2px"
                                }}
                              />
                              <span style={{
                                fontSize: "1rem",
                                lineHeight: "1.5",
                                color: "#495057"
                              }}>
                                <strong style={{ marginRight: "0.5rem" }}>
                                  {opt.toUpperCase()}.
                                </strong> 
                                {currentQ[`option_${opt}`]}
                              </span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "auto",
                    paddingTop: "1.5rem",
                    borderTop: "1px solid #e9ecef"
                  }}>
                    <button 
                      onClick={() => setCurrent(current - 1)} 
                      disabled={current === 0}
                      style={{
                        backgroundColor: current === 0 ? "#e9ecef" : "#6c757d",
                        color: current === 0 ? "#6c757d" : "white",
                        border: "none",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "6px",
                        cursor: current === 0 ? "not-allowed" : "pointer",
                        fontWeight: "500"
                      }}
                    >
                      ← Sebelumnya
                    </button>

                    {!result && current === questions.length - 1 ? (
                      <button 
                        onClick={handleFinish}
                        disabled={Object.keys(answers).length < questions.length}
                        style={{
                          backgroundColor: Object.keys(answers).length < questions.length ? "#e9ecef" : "#059669",
                          color: Object.keys(answers).length < questions.length ? "#6c757d" : "white",
                          border: "none",
                          padding: "0.75rem 2rem",
                          borderRadius: "6px",
                          cursor: Object.keys(answers).length < questions.length ? "not-allowed" : "pointer",
                          fontWeight: "600",
                          fontSize: "1rem"
                        }}
                        title={Object.keys(answers).length < questions.length ? 
                          `Jawab semua soal (${Object.keys(answers).length}/${questions.length})` : 
                          "Submit quiz"
                        }
                      >
                        Selesai Quiz
                      </button>
                    ) : (
                      <button 
                        onClick={() => setCurrent(current + 1)} 
                        disabled={current === questions.length - 1}
                        style={{
                          backgroundColor: current === questions.length - 1 ? "#e9ecef" : "#B6252A",
                          color: current === questions.length - 1 ? "#6c757d" : "white",
                          border: "none",
                          padding: "0.75rem 1.5rem",
                          borderRadius: "6px",
                          cursor: current === questions.length - 1 ? "not-allowed" : "pointer",
                          fontWeight: "500"
                        }}
                      >
                        Selanjutnya →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {result && (
                <>
                  {/* Score Header */}
                  <div style={{
                    textAlign: "center",
                    padding: "2rem",
                    backgroundColor: "white",
                    borderRadius: "8px",
                    marginBottom: "1.5rem",
                    flexShrink: 0,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    border: "1px solid #e9ecef"
                  }}>
                    <h3 style={{ 
                      color: "#059669", 
                      margin: "0 0 1.5rem 0",
                      fontSize: "1.5rem",
                      fontWeight: "600"
                    }}>
                      Hasil Quiz
                    </h3>
                    
                    <div style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "3rem"
                    }}>
                      <div style={{
                        fontSize: "4rem",
                        fontWeight: "bold",
                        color: "#059669",
                        lineHeight: "1"
                      }}>
                        {Math.round((result.filter(r => r.is_correct).length / result.length) * 100)}%
                      </div>
                      <div>
                        <div style={{ 
                          fontSize: "1.5rem",
                          fontWeight: "600",
                          color: "#495057",
                          marginBottom: "0.5rem"
                        }}>
                          {result.filter(r => r.is_correct).length}/{result.length}
                        </div>
                        <div style={{ 
                          fontSize: "1rem",
                          color: "#6c757d"
                        }}>
                          soal benar
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Header */}
                  <div style={{
                    padding: "1rem 0",
                    flexShrink: 0
                  }}>
                    <h4 style={{ 
                      margin: "0", 
                      color: "#495057",
                      borderBottom: "2px solid #e9ecef",
                      paddingBottom: "0.75rem",
                      fontSize: "1.2rem",
                      fontWeight: "600"
                    }}>
                      Review Soal ({result.length} soal)
                    </h4>
                  </div>

                  {/* Scrollable Review */}
                  <div style={{
                    flex: 1,
                    overflowY: "auto",
                    minHeight: 0
                  }}>
                    {result.map((r, i) => {
                      const question = questions.find(q => q.id === r.question_id);
                      if (!question) return null;
                      
                      return (
                        <div key={r.question_id} style={{
                          border: `2px solid ${r.is_correct ? "#059669" : "#dc3545"}`,
                          borderRadius: "8px",
                          marginBottom: "1.5rem",
                          padding: "2rem",
                          backgroundColor: "white"
                        }}>
                          <h4 style={{ 
                            color: "#B6252A", 
                            margin: "0 0 1.5rem 0",
                            fontSize: "1.1rem",
                            fontWeight: "600"
                          }}>
                            Soal #{question.order_number}
                          </h4>
                          
                          <div style={{ 
                            marginBottom: "1.5rem",
                            fontSize: "1.1rem",
                            lineHeight: "1.6",
                            color: "#495057"
                          }}>
                            <strong>{question.question_text}</strong>
                          </div>

                          {question.attachment && (
                            <div style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
                              <div style={{ 
                                marginBottom: "0.75rem",
                                fontSize: "0.9rem",
                                fontWeight: "600",
                                color: "#6c757d"
                              }}>
                                Lampiran:
                              </div>
                              <div style={{ 
                                padding: "1rem",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "8px",
                                border: "1px solid #e9ecef"
                              }}>
                                {renderAttachment(question.attachment)}
                              </div>
                            </div>
                          )}

                          <div style={{ marginTop: "1.5rem" }}>
                            {['a', 'b', 'c', 'd'].map(opt => {
                              const isSelected = r.selected_option === opt;
                              const isCorrect = r.correct_option === opt;
                              
                              let backgroundColor = "#f8f9fa";
                              let borderColor = "#e9ecef";
                              let textColor = "#495057";
                              
                              if (isSelected && isCorrect) {
                                backgroundColor = "#d4edda";
                                borderColor = "#c3e6cb";
                                textColor = "#155724";
                              } else if (isSelected && !isCorrect) {
                                backgroundColor = "#f8d7da";
                                borderColor = "#f5c6cb";
                                textColor = "#721c24";
                              } else if (!isSelected && isCorrect) {
                                backgroundColor = "#d1ecf1";
                                borderColor = "#bee5eb";
                                textColor = "#0c5460";
                              }

                              return (
                                <div key={opt} style={{ marginBottom: "1rem" }}>
                                  <div style={{ 
                                    display: "flex", 
                                    alignItems: "flex-start", 
                                    gap: "1rem",
                                    padding: "1rem",
                                    backgroundColor,
                                    border: `2px solid ${borderColor}`,
                                    borderRadius: "8px",
                                    color: textColor,
                                    fontWeight: isSelected || isCorrect ? "600" : "400"
                                  }}>
                                    <span 
                                      style={{
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "50%",
                                        border: `2px solid ${isSelected ? textColor : "#6c757d"}`,
                                        backgroundColor: isSelected ? textColor : "transparent",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginTop: "2px"
                                      }}
                                    >
                                      {isSelected && (
                                        <div style={{
                                          width: "10px",
                                          height: "10px",
                                          borderRadius: "50%",
                                          backgroundColor: "white"
                                        }}></div>
                                      )}
                                    </span>
                                    <span style={{
                                      fontSize: "1rem",
                                      lineHeight: "1.5"
                                    }}>
                                      <strong style={{ marginRight: "0.5rem" }}>
                                        {opt.toUpperCase()}.
                                      </strong> 
                                      {question[`option_${opt}`]}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {r.explanation && (
                            <div style={{ 
                              fontSize: "0.95rem", 
                              color: "#6c757d",
                              fontStyle: "italic",
                              marginTop: "1.5rem",
                              paddingTop: "1.5rem",
                              borderTop: "1px solid #e9ecef",
                              backgroundColor: "#f8f9fa",
                              padding: "1rem",
                              borderRadius: "6px"
                            }}>
                              <strong>Penjelasan:</strong> {r.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Modal for Instructor */}
        {showModal && role === 'instruktur' && (
          <div style={{
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
            padding: "1rem"
          }}>
            <div style={{
              backgroundColor: "white",
              borderRadius: "8px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              padding: "1.5rem",
              position: "relative"
            }}>
              <button
                onClick={resetForm}
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  background: "#B6252A",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ×
              </button>

              <h3 style={{ 
                color: "#B6252A", 
                marginTop: "0",
                marginBottom: "1rem",
                fontWeight: "600"
              }}>
                {formMode === 'edit' ? 'Edit' : 'Tambah'} Soal Quiz
              </h3>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>
                    Upload Lampiran (Opsional):
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
                      width: "100%"
                    }} 
                  />
                </div>

                {(form.attachment || form.attachment_file) && (
                  <div style={{ 
                    border: "1px solid #e9ecef", 
                    padding: "1rem",
                    borderRadius: "4px",
                    backgroundColor: "#f8f9fa"
                  }}>
                    <p><strong>Preview Lampiran:</strong></p>
                    {form.attachment_file ? (
                      renderFilePreview()
                    ) : form.attachment ? (
                      renderAttachment(form.attachment)
                    ) : null}
                  </div>
                )}

                <div>
                  <label style={{ fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>
                    Pertanyaan:
                  </label>
                  <textarea
                    value={form.question_text}
                    onChange={(e) => setForm({ ...form, question_text: e.target.value })}
                    placeholder="Masukkan pertanyaan..."
                    rows={3}
                    required
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #ced4da",
                      borderRadius: "4px"
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>
                      Option A:
                    </label>
                    <input
                      value={form.option_a}
                      onChange={(e) => setForm({ ...form, option_a: e.target.value })}
                      placeholder="Option A"
                      required
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #ced4da",
                        borderRadius: "4px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>
                      Option B:
                    </label>
                    <input
                      value={form.option_b}
                      onChange={(e) => setForm({ ...form, option_b: e.target.value })}
                      placeholder="Option B"
                      required
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #ced4da",
                        borderRadius: "4px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>
                      Option C:
                    </label>
                    <input
                      value={form.option_c}
                      onChange={(e) => setForm({ ...form, option_c: e.target.value })}
                      placeholder="Option C"
                      required
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #ced4da",
                        borderRadius: "4px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>
                      Option D:
                    </label>
                    <input
                      value={form.option_d}
                      onChange={(e) => setForm({ ...form, option_d: e.target.value })}
                      placeholder="Option D"
                      required
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #ced4da",
                        borderRadius: "4px"
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>
                      Jawaban Benar:
                    </label>
                    <select
                      value={form.correct_option}
                      onChange={(e) => setForm({ ...form, correct_option: e.target.value })}
                      required
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #ced4da",
                        borderRadius: "4px"
                      }}
                    >
                      <option value="a">A</option>
                      <option value="b">B</option>
                      <option value="c">C</option>
                      <option value="d">D</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>
                      Nomor Urut:
                    </label>
                    <select
                      value={form.order_number}
                      onChange={(e) => setForm({ ...form, order_number: parseInt(e.target.value) })}
                      required
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #ced4da",
                        borderRadius: "4px"
                      }}
                    >
                      <option value="">Pilih Nomor Urut</option>
                      {getAvailableOrderNumbers(editingId, formMode === 'create').map((option) => (
                        <option 
                          key={option.value} 
                          value={option.value}
                          disabled={option.disabled}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>
                    Penjelasan (Opsional):
                  </label>
                  <textarea
                    value={form.explanation}
                    onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                    placeholder="Penjelasan jawaban..."
                    rows={2}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #ced4da",
                      borderRadius: "4px"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: "#B6252A",
                    color: "white",
                    border: "none",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  {loading ? "Menyimpan..." : "Simpan Soal"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}