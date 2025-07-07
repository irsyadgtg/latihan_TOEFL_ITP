import React from "react";

function UnitSidebar({
  units,
  selectedUnit,
  onSelect,
  unlockedUnits = null,
  role = "peserta",
  // PROPS BARU: breakdown akses unit
  unitAccessBreakdown = null,
}) {
  const isUnitUnlocked = (unit) => {
    if (role === "instruktur" || role === "admin") return true;
    if (!unlockedUnits || !Array.isArray(unlockedUnits)) return true;
    return unlockedUnits.includes(unit);
  };

  // FUNGSI DIPERBAIKI TOTAL: Deteksi sumber akses unit dengan logika yang benar
  const getUnitAccessSource = (unit) => {
    if (role !== "peserta") {
      return "admin";
    }

    // FALLBACK: Jika tidak ada breakdown data, anggap dari rencana belajar
    if (!unitAccessBreakdown) {
      console.log(
        "UnitSidebar: No breakdown data, defaulting to rencana belajar"
      );
      return "rencana";
    }

    // EKSTRAK DATA dengan struktur yang benar
    const fromRencana = unitAccessBreakdown.from_rencana_belajar?.units || {};
    const fromPaket = unitAccessBreakdown.from_paket?.units || {};

    // DEBUG
    console.log("UnitSidebar: Checking unit", unit, {
      fromRencanaKeys: Object.keys(fromRencana),
      fromPaketKeys: Object.keys(fromPaket),
    });

    // PERBAIKAN TOTAL: Cek apakah unit ada di rencana belajar secara spesifik
    // Harus cek modul yang sedang dibuka (reading, listening, structure)
    let isFromRencana = false;
    let isFromPaket = false;

    // Deteksi modul saat ini berdasarkan URL atau context
    // Gunakan window.location.pathname untuk deteksi modul
    const currentPath = window.location.pathname;
    let currentModule = null;
    
    if (currentPath.includes('/materi/reading')) {
      currentModule = 'reading';
    } else if (currentPath.includes('/materi/listening')) {
      currentModule = 'listening';
    } else if (currentPath.includes('/materi/structure')) {
      currentModule = 'structure';
    }

    if (currentModule) {
      // Cek di rencana belajar untuk modul yang tepat
      const rencanaUnits = fromRencana[currentModule] || [];
      isFromRencana = Array.isArray(rencanaUnits) && rencanaUnits.includes(unit);

      // Cek di paket untuk modul yang tepat
      const paketUnits = fromPaket[currentModule] || [];
      isFromPaket = Array.isArray(paketUnits) && paketUnits.includes(unit);

      console.log(`UnitSidebar: Unit ${unit} in ${currentModule}:`, {
        rencanaUnits,
        paketUnits,
        isFromRencana,
        isFromPaket,
      });
    } else {
      // Fallback: cek di semua modul jika tidak bisa deteksi
      isFromRencana = Object.values(fromRencana).some(
        (unitArray) => Array.isArray(unitArray) && unitArray.includes(unit)
      );
      isFromPaket = Object.values(fromPaket).some(
        (unitArray) => Array.isArray(unitArray) && unitArray.includes(unit)
      );
      
      console.log("UnitSidebar: Fallback check for unit", unit, {
        isFromRencana,
        isFromPaket,
      });
    }

    // LOGIC PRIORITAS: Rencana belajar ALWAYS win
    if (isFromRencana && isFromPaket) {
      return "both"; // Ada di keduanya, tapi prioritas rencana belajar
    } else if (isFromRencana) {
      return "rencana"; // Hanya di rencana belajar
    } else if (isFromPaket) {
      return "paket"; // Hanya di paket
    }

    return "none";
  };

  const getUnitStyle = (unit) => {
    const isSelected = unit === selectedUnit;
    const isUnlocked = isUnitUnlocked(unit);
    const accessSource = getUnitAccessSource(unit);

    if (isSelected) {
      return {
        backgroundColor: "#495057",
        color: "white",
        fontWeight: "600",
        border: "none",
      };
    }

    if (isUnlocked) {
      // WARNA BERDASARKAN SUMBER AKSES - PRIORITAS RENCANA BELAJAR
      if (accessSource === "rencana" || accessSource === "both") {
        // Dari rencana belajar (dengan atau tanpa paket): Merah normal
        return {
          backgroundColor: "#dc3545",
          color: "white",
          fontWeight: "500",
          border: "none",
        };
      } else if (accessSource === "paket") {
        // HANYA dari paket: Merah lebih terang/pudar
        return {
          backgroundColor: "#f8b8bd", // Merah terang/pudar
          color: "#495057", // Text gelap untuk kontras
          fontWeight: "500",
          border: "1px solid #f5c6cb",
        };
      } else {
        // Fallback - tidak diketahui sumbernya, anggap dari rencana
        return {
          backgroundColor: "#dc3545",
          color: "white",
          fontWeight: "500",
          border: "none",
        };
      }
    }

    return {
      backgroundColor: "#e9ecef",
      color: "#6c757d",
      cursor: "not-allowed",
      fontWeight: "400",
      border: "none",
    };
  };

  const getUnitHoverStyle = (unit) => {
    const isSelected = unit === selectedUnit;
    const isUnlocked = isUnitUnlocked(unit);
    const accessSource = getUnitAccessSource(unit);

    // Jangan ada hover jika selected atau locked
    if (isSelected || !isUnlocked) return {};

    // Hover berdasarkan sumber akses
    if (accessSource === "paket") {
      return {
        backgroundColor: "#f1a7ab", // Hover lebih gelap untuk paket
        color: "#495057",
      };
    } else {
      return {
        backgroundColor: "#c82333", // Hover normal untuk rencana belajar
        color: "white",
      };
    }
  };

  const getUnitLabel = (unit) => {
    const baseLabel = unit === 0 ? "Pengenalan" : `Unit ${unit}`;
    return baseLabel;
  };

  const getUnitTitle = (unit) => {
    const isUnlocked = isUnitUnlocked(unit);
    const accessSource = getUnitAccessSource(unit);
    const baseTitle = unit === 0 ? "Unit Pengenalan" : `Unit ${unit}`;

    if (role === "peserta" && !isUnlocked) {
      return `${baseTitle} - Terkunci: Selesaikan rencana belajar untuk membuka unit ini`;
    }

    // TOOLTIP BERDASARKAN SUMBER AKSES
    if (role === "peserta" && isUnlocked) {
      if (accessSource === "paket") {
        return `${baseTitle} - Terbuka dari Paket Kursus`;
      } else if (accessSource === "rencana") {
        return `${baseTitle} - Terbuka dari Rencana Belajar`;
      } else if (accessSource === "both") {
        return `${baseTitle} - Terbuka dari Rencana Belajar + Paket`;
      } else {
        return `${baseTitle} - Terbuka`;
      }
    }

    return baseTitle;
  };

  // Hitung unit real (tanpa unit 0)
  const realUnits = units.filter((u) => u !== 0);
  const realUnlockedUnits = unlockedUnits
    ? unlockedUnits.filter((u) => u !== 0)
    : [];

  // HITUNG UNIT BERDASARKAN SUMBER AKSES - DIPERBAIKI
  const countUnitsBySource = () => {
    if (role !== "peserta" || !unitAccessBreakdown) {
      return { fromRencana: 0, fromPaket: 0, total: realUnlockedUnits.length };
    }

    let fromRencana = 0;
    let fromPaket = 0;

    realUnits.forEach((unit) => {
      const source = getUnitAccessSource(unit);
      if (source === "rencana" || source === "both") {
        fromRencana++;
      }
      if (source === "paket") {
        fromPaket++;
      }
    });

    return { fromRencana, fromPaket, total: realUnlockedUnits.length };
  };

  const unitCounts = countUnitsBySource();

  return (
    <div
      style={{
        width: "220px",
        backgroundColor: "white",
        border: "1px solid #dee2e6",
        borderRadius: "4px",
        overflow: "hidden",
        flexShrink: 0,
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "1rem",
          borderBottom: "1px solid #dee2e6",
        }}
      >
        <h4
          style={{
            margin: "0",
            color: "#495057",
            fontSize: "1rem",
            fontWeight: "600",
          }}
        >
          Daftar Unit
        </h4>
        {role === "peserta" && unlockedUnits && (
          <div
            style={{
              fontSize: "0.75rem",
              color: "#6c757d",
              marginTop: "0.25rem",
            }}
          >
            {unitCounts.total}/{realUnits.length} unit terbuka
            {unitAccessBreakdown && (
              <div style={{ marginTop: "0.25rem" }}>
                {unitCounts.fromRencana > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        backgroundColor: "#dc3545",
                        borderRadius: "2px",
                      }}
                    ></div>
                    <span>{unitCounts.fromRencana} dari rencana</span>
                  </div>
                )}
                {unitCounts.fromPaket > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        backgroundColor: "#f8b8bd",
                        border: "1px solid #f5c6cb",
                        borderRadius: "2px",
                      }}
                    ></div>
                    <span>{unitCounts.fromPaket} dari paket</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: "0.5rem" }}>
        <ul
          style={{
            listStyle: "none",
            padding: "0",
            margin: "0",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          {units.map((unit) => {
            const isUnlocked = isUnitUnlocked(unit);
            const unitStyle = getUnitStyle(unit);
            const hoverStyle = getUnitHoverStyle(unit);

            return (
              <li
                key={unit}
                onClick={() => {
                  if (isUnlocked) {
                    onSelect(unit);
                  }
                }}
                style={{
                  padding: "0.75rem",
                  cursor: isUnlocked ? "pointer" : "not-allowed",
                  borderRadius: "4px",
                  transition: "all 0.2s ease",
                  position: "relative",
                  ...unitStyle,
                }}
                title={getUnitTitle(unit)}
                onMouseEnter={(e) => {
                  if (isUnlocked && unit !== selectedUnit) {
                    const hover = getUnitHoverStyle(unit);
                    e.currentTarget.style.backgroundColor =
                      hover.backgroundColor;
                    e.currentTarget.style.color = hover.color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (isUnlocked && unit !== selectedUnit) {
                    const originalStyle = getUnitStyle(unit);
                    e.currentTarget.style.backgroundColor =
                      originalStyle.backgroundColor;
                    e.currentTarget.style.color = originalStyle.color;
                  }
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span>{getUnitLabel(unit)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default UnitSidebar;