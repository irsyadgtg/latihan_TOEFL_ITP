import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function MateriList() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  
  const [unitAccess, setUnitAccess] = useState({
    unlockedUnits: null,
    hasActiveFeedback: false,
    feedbackSkills: [],
    loading: true,
    error: null
  });

  const modulList = [
    { 
      id: 'listening', 
      name: 'Listening Comprehension',
      description: 'Pemahaman mendengarkan percakapan dan ceramah',
      color: '#2563EB'
    },
    { 
      id: 'structure', 
      name: 'Structure and Written Expression',
      description: 'Tata bahasa dan ekspresi tertulis',
      color: '#059669'
    },
    { 
      id: 'reading', 
      name: 'Reading Comprehension',
      description: 'Pemahaman membaca teks dan bacaan',
      color: '#B6252A'
    },
  ];

  const fetchUnlockedUnits = async () => {
    if (role !== 'peserta') {
      setUnitAccess({
        unlockedUnits: {
          listening: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          structure: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          reading: [0, 1, 2, 3, 4, 5, 6]
        },
        hasActiveFeedback: true,
        feedbackSkills: [],
        loading: false,
        error: null
      });
      return;
    }

    try {
      const response = await api.get('/units/unlocked', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUnitAccess({
        unlockedUnits: response.data.unlocked_units,
        hasActiveFeedback: response.data.has_active_feedback,
        feedbackSkills: response.data.feedback_skills || [],
        feedbackInfo: response.data.feedback_info,
        loading: false,
        error: null
      });

    } catch (error) {
      setUnitAccess({
        unlockedUnits: {
          listening: [0],
          structure: [0],
          reading: [0]
        },
        hasActiveFeedback: false,
        feedbackSkills: [],
        loading: false,
        error: error.response?.data?.message || 'Gagal memuat akses unit'
      });
    }
  };

  useEffect(() => {
    fetchUnlockedUnits();
  }, [role]);

  const getModulUnitInfo = (modulId) => {
    const totalUnits = modulId === 'reading' ? 7 : 11;
    
    if (role !== 'peserta' || !unitAccess.unlockedUnits) {
      return { unlocked: totalUnits, total: totalUnits };
    }
    
    const unlockedUnits = unitAccess.unlockedUnits[modulId] || [0];
    return { 
      unlocked: unlockedUnits.length, 
      total: totalUnits 
    };
  };

  const getModulSkillCount = (modulId) => {
    if (!unitAccess.feedbackSkills) return 0;
    
    const skillCategories = {
      listening: 'Listening Comprehension',
      structure: 'Structure and Written Expression',
      reading: 'Reading'
    };
    
    return unitAccess.feedbackSkills.filter(skill => 
      skill.kategori === skillCategories[modulId]
    ).length;
  };

  return (
    <div style={{ 
      padding: "1.5rem",
      backgroundColor: "#f9fafb",
      minHeight: "100vh",
      fontFamily: "'Poppins', sans-serif"
    }}>
      <div style={{
        maxWidth: "1000px",
        margin: "0 auto"
      }}>
        
        <div style={{
          textAlign: "center",
          marginBottom: "1.5rem"
        }}>
          <h1 style={{ 
            margin: "0 0 0.5rem 0",
            color: "#B6252A",
            fontSize: "2rem",
            fontWeight: "600"
          }}>
            Materi TOEFL ITP
          </h1>
          <p style={{ 
            margin: "0",
            color: "#6c757d",
            fontSize: "1.1rem",
            fontWeight: "400"
          }}>
            Pilih modul untuk mulai belajar
          </p>
        </div>

        {role === 'peserta' && !unitAccess.loading && (
          <div style={{
            backgroundColor: unitAccess.hasActiveFeedback ? "#d1edff" : "#fff3cd",
            border: `1px solid ${unitAccess.hasActiveFeedback ? "#bee5eb" : "#ffeaa7"}`,
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1.5rem",
            textAlign: "center"
          }}>
            {unitAccess.hasActiveFeedback ? (
              <div>
                <div style={{ 
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#0c5460",
                  marginBottom: "0.5rem"
                }}>
                  Rencana Belajar Aktif
                </div>
                <div style={{ color: "#0c5460", fontSize: "0.9rem" }}>
                  {unitAccess.feedbackInfo && (
                    <div>
                      Paket: {unitAccess.feedbackInfo.plan_name}
                      <br />
                      Keterampilan: {unitAccess.feedbackSkills.length} total
                      <br />
                      Berakhir: {new Date(unitAccess.feedbackInfo.expires_at).toLocaleDateString('id-ID')}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ 
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#856404",
                  marginBottom: "0.5rem"
                }}>
                  Akses Terbatas
                </div>
                <div style={{ color: "#856404", fontSize: "0.9rem" }}>
                  Anda hanya dapat mengakses unit pengenalan. Selesaikan pengajuan rencana belajar untuk membuka lebih banyak unit.
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ 
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
          marginBottom: "1.5rem"
        }}>
          {modulList.map(modul => {
            const unitInfo = getModulUnitInfo(modul.id);
            const skillCount = getModulSkillCount(modul.id);
            
            return (
              <div
                key={modul.id}
                onClick={() => navigate(`/materi/${modul.id}`)}
                style={{
                  backgroundColor: "white",
                  border: `2px solid ${modul.color}`,
                  borderRadius: "8px",
                  padding: "1.5rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                  e.currentTarget.style.backgroundColor = modul.color;
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.color = "inherit";
                }}
              >
                <h3 style={{ 
                  margin: "0 0 1rem 0",
                  fontSize: "1.25rem",
                  color: modul.color,
                  fontWeight: "600"
                }}>
                  {modul.name}
                </h3>
                <p style={{ 
                  margin: "0 0 1rem 0",
                  color: "#6c757d",
                  lineHeight: "1.5",
                  fontWeight: "400"
                }}>
                  {modul.description}
                </p>
                
                {role === 'peserta' && !unitAccess.loading && (
                  <div style={{
                    backgroundColor: "#f8f9fa",
                    padding: "0.75rem",
                    borderRadius: "4px",
                    marginBottom: "1rem",
                    border: "1px solid #dee2e6"
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.85rem",
                      color: "#495057",
                      fontWeight: "500"
                    }}>
                      <div>
                        <strong>Unit:</strong> {unitInfo.unlocked}/{unitInfo.total} terbuka
                      </div>
                      <div>
                        <strong>Keterampilan:</strong> {skillCount}
                      </div>
                    </div>
                    
                    {unitInfo.unlocked < unitInfo.total && (
                      <div style={{
                        marginTop: "0.5rem",
                        fontSize: "0.8rem",
                        color: "#856404",
                        textAlign: "center",
                        fontWeight: "400"
                      }}>
                        {unitInfo.total - unitInfo.unlocked} unit terkunci
                      </div>
                    )}
                  </div>
                )}
                
                <div style={{
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #dee2e6",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <small style={{ 
                    color: "#6c757d",
                    fontWeight: "400"
                  }}>
                    {role === 'peserta' && !unitAccess.loading ? (
                      `${unitInfo.unlocked} Unit • Latihan & Materi`
                    ) : (
                      `${modul.id === 'reading' ? '7' : '11'} Unit • Latihan & Materi`
                    )}
                  </small>
                  <span style={{
                    color: modul.color,
                    fontWeight: "600"
                  }}>
                    Mulai
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          backgroundColor: "white",
          border: "1px solid #e9ecef",
          borderRadius: "8px",
          padding: "1.5rem",
          textAlign: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ 
            margin: "0 0 1rem 0",
            color: "#495057",
            fontWeight: "600"
          }}>
            Tentang TOEFL ITP
          </h3>
          <p style={{ 
            margin: "0",
            color: "#6c757d",
            lineHeight: "1.6",
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
            fontWeight: "400"
          }}>
            Test of English as a Foreign Language Institutional Testing Program (TOEFL ITP) 
            adalah tes kemampuan bahasa Inggris yang mengukur kemampuan listening, structure, 
            dan reading comprehension. Setiap modul dirancang untuk meningkatkan kemampuan 
            bahasa Inggris Anda secara bertahap.
          </p>
          
          {role === 'peserta' && (
            <div style={{
              marginTop: "1.5rem",
              padding: "1rem",
              backgroundColor: "#e3f2fd",
              borderRadius: "4px",
              border: "1px solid #bbdefb"
            }}>
              <div style={{ 
                fontSize: "0.9rem", 
                fontWeight: "600", 
                color: "#1565c0",
                marginBottom: "0.5rem"
              }}>
                Cara Membuka Unit
              </div>
              <div style={{ 
                fontSize: "0.85rem", 
                color: "#1976d2",
                lineHeight: "1.5",
                fontWeight: "400"
              }}>
                Unit dibuka berdasarkan keterampilan yang Anda terima dari feedback rencana belajar. 
                Setiap keterampilan sesuai dengan unit tertentu di setiap modul. Selesaikan pengajuan rencana 
                belajar dan dapatkan feedback instruktur untuk membuka lebih banyak konten.
              </div>
            </div>
          )}
          
          <div style={{
            marginTop: "1rem",
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            flexWrap: "wrap"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                fontSize: "1.5rem", 
                fontWeight: "600", 
                color: "#2563EB" 
              }}>50</div>
              <div style={{ 
                fontSize: "0.9rem", 
                color: "#6c757d",
                fontWeight: "400"
              }}>Soal Listening</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                fontSize: "1.5rem", 
                fontWeight: "600", 
                color: "#059669" 
              }}>40</div>
              <div style={{ 
                fontSize: "0.9rem", 
                color: "#6c757d",
                fontWeight: "400"
              }}>Soal Structure</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                fontSize: "1.5rem", 
                fontWeight: "600", 
                color: "#B6252A" 
              }}>50</div>
              <div style={{ 
                fontSize: "0.9rem", 
                color: "#6c757d",
                fontWeight: "400"
              }}>Soal Reading</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MateriList;