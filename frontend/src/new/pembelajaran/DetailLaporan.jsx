import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';


export default function DetailLaporan() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (role !== 'peserta') {
      setError('Hanya peserta yang dapat mengakses laporan pembelajaran');
      setLoading(false);
      return;
    }
    
    loadDetailedReport();
  }, [role]);

  const loadDetailedReport = async () => {
    try {
      const res = await api.get('/laporan/detail', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(res.data);
    } catch (err) {
      console.error('Error loading detailed report:', err);
      
      if (err.response?.status === 403) {
        setError('Anda belum memenuhi semua requirements untuk mengakses laporan lengkap. Selesaikan dulu semua materi, latihan, dan simulasi.');
      } else {
        setError(err.response?.data?.message || 'Gagal memuat laporan pembelajaran');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderQuizChart = (moduleData) => {
    if (!moduleData.chart_data || moduleData.chart_data.length === 0) {
      return <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>Tidak ada data quiz</div>;
    }

    const maxScore = 100;
    const chartHeight = 120;
    const barWidth = Math.max(20, 200 / moduleData.chart_data.length);

    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'end', 
        justifyContent: 'center',
        height: chartHeight + 'px',
        gap: '4px',
        marginTop: '1rem'
      }}>
        {moduleData.chart_data.map((data, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: barWidth + 'px',
              height: (data.score / maxScore) * chartHeight + 'px',
              backgroundColor: data.score >= 75 ? '#28a745' : data.score >= 50 ? '#ffc107' : '#dc3545',
              borderRadius: '2px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '0.7rem',
                color: '#495057',
                fontWeight: '500'
              }}>
                {data.score}%
              </div>
            </div>
            <div style={{
              fontSize: '0.7rem',
              color: '#6c757d',
              marginTop: '4px'
            }}>
              U{data.unit}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Memuat Laporan Pembelajaran...</h2>
        <div style={{ 
          width: "40px", 
          height: "40px", 
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #B6252A",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 1rem auto"
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: '#dc3545' }}>Akses Ditolak</h2>
        <p style={{ margin: '1rem 0', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          {error}
        </p>
        <div>
          <button 
            onClick={() => navigate('/laporan-pembelajaran')}
            style={{
              backgroundColor: '#B6252A',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
              marginRight: '1rem'
            }}
          >
            Cek Progress
          </button>
          <button 
            onClick={() => navigate('/materi')}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Lanjut Belajar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: '#f8f9fa',
      paddingBottom: '3rem'
    }}>
      <div style={{ 
        padding: '1.5rem', 
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        
        {/* Header Card */}
        <div style={{
          backgroundColor: '#B6252A',
          color: 'white',
          padding: '2rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontWeight: '700' }}>
            Laporan Pembelajaran TOEFL ITP
          </h1>
          <h2 style={{ margin: '0 0 1rem 0', fontWeight: '500', opacity: 0.9 }}>
            {reportData?.learning_plan_summary?.plan_name}
          </h2>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '1rem',
            borderRadius: '8px',
            display: 'inline-block'
          }}>
            <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              Status Kelulusan: <strong>{reportData?.graduation_status?.status_message}</strong>
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              Target: {reportData?.learning_plan_summary?.target_score} | 
              Pencapaian: {reportData?.learning_plan_summary?.simulation_score} |
              Selisih: {reportData?.learning_plan_summary?.score_difference >= 0 ? '+' : ''}{reportData?.learning_plan_summary?.score_difference}
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          
          {/* Card 1: Rencana Belajar & Skill Focus */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              color: '#B6252A',
              fontWeight: '600',
              fontSize: '1.2rem',
              borderBottom: '2px solid #B6252A',
              paddingBottom: '0.5rem'
            }}>
              Rencana Belajar & Focus Area
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                Nama Rencana:
              </div>
              <div style={{ fontWeight: '600', color: '#495057' }}>
                {reportData?.learning_plan_summary?.plan_name}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                Skill yang Difokuskan:
              </div>
              {reportData?.learning_plan_summary?.focused_skills?.by_category?.map((category, index) => (
                <div key={index} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '0.9rem',
                    marginBottom: '0.25rem'
                  }}>
                    {category.category}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d', lineHeight: '1.4' }}>
                    {category.skills.slice(0, 2).map(skill => skill.name).join(', ')}
                    {category.skills.length > 2 && `, +${category.skills.length - 2} lainnya`}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '0.75rem',
              borderRadius: '4px',
              fontSize: '0.85rem',
              color: '#495057'
            }}>
              Total {reportData?.learning_plan_summary?.focused_skills?.total_skills} skill dari {reportData?.learning_plan_summary?.focused_skills?.categories_covered?.length} kategori
            </div>
          </div>

          {/* Card 2: Target vs Pencapaian Skor */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              color: '#B6252A',
              fontWeight: '600',
              fontSize: '1.2rem',
              borderBottom: '2px solid #B6252A',
              paddingBottom: '0.5rem'
            }}>
              Target vs Pencapaian Skor
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                  Target Skor
                </div>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: '#6c757d'
                }}>
                  {reportData?.learning_plan_summary?.target_score}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                  Pencapaian
                </div>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: reportData?.learning_plan_summary?.score_difference >= 0 ? '#28a745' : '#dc3545'
                }}>
                  {reportData?.learning_plan_summary?.simulation_score}
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: reportData?.learning_plan_summary?.score_difference >= 0 ? '#d4edda' : '#f8d7da',
              color: reportData?.learning_plan_summary?.score_difference >= 0 ? '#155724' : '#721c24',
              padding: '1rem',
              borderRadius: '6px',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                {reportData?.learning_plan_summary?.achievement_status}
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                Selisih: {reportData?.learning_plan_summary?.score_difference >= 0 ? '+' : ''}{reportData?.learning_plan_summary?.score_difference} poin
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
              Breakdown Simulasi:
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr 1fr', 
              gap: '0.5rem',
              fontSize: '0.8rem',
              marginTop: '0.5rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#6c757d' }}>Listening</div>
                <div style={{ fontWeight: '600' }}>{reportData?.simulation_results?.listening_score}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#6c757d' }}>Structure</div>
                <div style={{ fontWeight: '600' }}>{reportData?.simulation_results?.structure_score}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#6c757d' }}>Reading</div>
                <div style={{ fontWeight: '600' }}>{reportData?.simulation_results?.reading_score}</div>
              </div>
            </div>
          </div>

          {/* Card 3: Waktu Pembelajaran */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              color: '#B6252A',
              fontWeight: '600',
              fontSize: '1.2rem',
              borderBottom: '2px solid #B6252A',
              paddingBottom: '0.5rem'
            }}>
              Analisis Waktu Pembelajaran
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Target Durasi</div>
                <div style={{ fontWeight: '600', color: '#495057' }}>
                  {reportData?.study_period_analysis?.planned_duration_days} hari
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Durasi Aktual</div>
                <div style={{ fontWeight: '600', color: '#495057' }}>
                  {reportData?.study_period_analysis?.actual_duration_days} hari
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: Math.abs(reportData?.study_period_analysis?.duration_difference || 0) <= 3 ? '#d4edda' : '#fff3cd',
              color: Math.abs(reportData?.study_period_analysis?.duration_difference || 0) <= 3 ? '#155724' : '#856404',
              padding: '0.75rem',
              borderRadius: '4px',
              fontSize: '0.9rem',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              <strong>{reportData?.study_period_analysis?.completion_status}</strong>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.5rem' }}>
              Jadwal yang Direncanakan:
            </div>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '0.75rem',
              borderRadius: '4px',
              fontSize: '0.8rem'
            }}>
              <div>Hari per minggu: {reportData?.study_period_analysis?.target_schedule?.days_per_week}</div>
              <div>Jam per hari: {reportData?.study_period_analysis?.target_schedule?.hours_per_day}</div>
              <div>Target waktu: {reportData?.study_period_analysis?.target_schedule?.target_time}</div>
            </div>
          </div>

          {/* Card 4: Performance Quiz per Modul dengan Chart */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            gridColumn: 'span 2'
          }}>
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              color: '#B6252A',
              fontWeight: '600',
              fontSize: '1.2rem',
              borderBottom: '2px solid #B6252A',
              paddingBottom: '0.5rem'
            }}>
              Performance Quiz per Modul
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '1rem'
            }}>
              {['listening', 'structure', 'reading'].map((modul) => {
                const moduleData = reportData?.quiz_performance?.by_module?.[modul];
                return (
                  <div key={modul} style={{
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    padding: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.75rem'
                    }}>
                      <h4 style={{ margin: 0, textTransform: 'capitalize', fontSize: '1rem' }}>
                        {modul}
                      </h4>
                      <div style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: (moduleData?.average_score || 0) >= 75 ? '#28a745' : 
                               (moduleData?.average_score || 0) >= 50 ? '#ffc107' : '#dc3545'
                      }}>
                        {moduleData?.average_score || 0}%
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                      {moduleData?.units_completed || 0} unit selesai
                    </div>
                    
                    {renderQuizChart(moduleData || {})}
                  </div>
                );
              })}
            </div>

            <div style={{
              backgroundColor: '#e3f2fd',
              color: '#1565c0',
              padding: '1rem',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <strong>Rata-rata Total Quiz: {reportData?.quiz_performance?.overall_average || 0}%</strong>
              <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Total {reportData?.quiz_performance?.total_quizzes_completed || 0} quiz diselesaikan
              </div>
            </div>
          </div>

          {/* Card 5: Analisis Kesalahan Soal */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              color: '#B6252A',
              fontWeight: '600',
              fontSize: '1.2rem',
              borderBottom: '2px solid #B6252A',
              paddingBottom: '0.5rem'
            }}>
              Analisis Kesalahan Soal
            </h3>

            {Object.entries(reportData?.wrong_answer_analysis || {}).map(([modul, analysis]) => (
              <div key={modul} style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ 
                    textTransform: 'capitalize', 
                    fontWeight: '600',
                    color: '#495057'
                  }}>
                    {modul}
                  </span>
                  <span style={{ 
                    fontSize: '0.9rem',
                    color: analysis.error_rate > 30 ? '#dc3545' : analysis.error_rate > 15 ? '#ffc107' : '#28a745',
                    fontWeight: '600'
                  }}>
                    {analysis.error_rate}% error
                  </span>
                </div>
                
                <div style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                  {analysis.wrong_count} dari {analysis.total_questions} soal salah
                </div>

                {analysis.common_mistakes && analysis.common_mistakes.length > 0 && (
                  <div style={{
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Pola Kesalahan:</div>
                    {analysis.common_mistakes.slice(0, 2).map((mistake, index) => (
                      <div key={index} style={{ marginBottom: '0.25rem' }}>
                        • {mistake.area}: {mistake.wrong_count} kesalahan
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Card 6: Skill Mastery */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              color: '#B6252A',
              fontWeight: '600',
              fontSize: '1.2rem',
              borderBottom: '2px solid #B6252A',
              paddingBottom: '0.5rem'
            }}>
              Penguasaan Skill
            </h3>

            <div style={{
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#28a745',
                marginBottom: '0.25rem'
              }}>
                {reportData?.skill_mastery?.mastery_percentage || 0}%
              </div>
              <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                Tingkat Penguasaan Skill
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#28a745',
                marginBottom: '0.5rem'
              }}>
                Skill yang Dikuasai ({reportData?.skill_mastery?.mastered_skills?.length || 0})
              </div>
              <div style={{
                maxHeight: '100px',
                overflowY: 'auto',
                fontSize: '0.8rem',
                color: '#495057'
              }}>
                {reportData?.skill_mastery?.mastered_skills?.slice(0, 3).map((skill, index) => (
                  <div key={index} style={{ marginBottom: '0.25rem' }}>
                    • {skill.skill} ({skill.performance}%)
                  </div>
                ))}
                {(reportData?.skill_mastery?.mastered_skills?.length || 0) > 3 && (
                  <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
                    +{(reportData?.skill_mastery?.mastered_skills?.length || 0) - 3} skill lainnya
                  </div>
                )}
              </div>
            </div>

            <div>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#dc3545',
                marginBottom: '0.5rem'
              }}>
                Perlu Diperbaiki ({reportData?.skill_mastery?.needs_improvement?.length || 0})
              </div>
              <div style={{
                maxHeight: '100px',
                overflowY: 'auto',
                fontSize: '0.8rem',
                color: '#495057'
              }}>
                {reportData?.skill_mastery?.needs_improvement?.slice(0, 3).map((skill, index) => (
                  <div key={index} style={{ marginBottom: '0.25rem' }}>
                    • {skill.skill} ({skill.performance}%)
                  </div>
                ))}
                {(reportData?.skill_mastery?.needs_improvement?.length || 0) > 3 && (
                  <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
                    +{(reportData?.skill_mastery?.needs_improvement?.length || 0) - 3} skill lainnya
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '3rem',
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#495057' }}>
            Aksi Lanjutan
          </h3>
          <button 
            onClick={() => navigate('/laporan-pembelajaran')}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              fontSize: '16px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginRight: '1rem',
              fontWeight: '500'
            }}
          >
            Kembali ke Progress
          </button>
          
          <button 
            onClick={() => navigate('/simulasi/hasil')}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              fontSize: '16px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginRight: '1rem',
              fontWeight: '500'
            }}
          >
            Lihat Hasil Simulasi
          </button>
          
          <button 
            onClick={() => window.print()}
            style={{
              backgroundColor: '#B6252A',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              fontSize: '16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Print Laporan
          </button>
        </div>

        {/* Footer Note */}
        <div style={{
          backgroundColor: '#e9ecef',
          color: '#495057',
          padding: '1rem',
          borderRadius: '4px',
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          <strong>Catatan:</strong> Laporan ini merupakan analisis pembelajaran dalam sistem LMS. 
          Untuk keperluan resmi, silakan mengikuti tes TOEFL ITP yang diselenggarakan oleh institusi resmi.
        </div>
      </div>
    </div>
  );
}