// src/components/Score.tsx
import { Component } from "react"; // Anda juga bisa menggunakan React.Component secara langsung

type ScoreData = {
  name: string;
  score: string;
  status: string;
  masa_berlaku: string; // Seharusnya string yang merepresentasikan periode validitas
  timestamp: string;    // Seharusnya string tanggal yang sudah diformat seperti "Kamis, 03 Juli 2025, 10:30"
  keterangan: string;   // Bisa string seperti "Tidak ada" atau komentar aktual
};

type ScoreProps = {
  data: ScoreData;
};

export class Score extends Component<ScoreProps> {
  render() {
    const { name, score, status, masa_berlaku, timestamp, keterangan } =
      this.props.data;

    return (
      <div className="border border-gray-300 px-3 py-2 rounded">
        <div className="flex justify-between flex-wrap font-medium gap-4">
          <div className="flex-1 min-w-[150px]">
            <p className="text-gray-500 text-sm">Nama Tes</p>
            <p>{name}</p>
          </div>
          <div className="flex-1 min-w-[120px]">
            <p className="text-gray-500 text-sm">Skor Tes</p>
            <p>{score}</p>
          </div>
          <div className="flex-1 min-w-[150px]">
            <p className="text-gray-500 text-sm">Status Pengajuan</p>
            {/* Menambahkan styling warna dasar untuk status */}
            <p className={`
              ${status === 'approved' ? 'text-green-600' : 
                status === 'pending' ? 'text-yellow-600' : 
                status === 'rejected' ? 'text-red-600' : 'text-gray-800'
              }
            `}>{status}</p>
          </div>
          <div className="flex-1 min-w-[150px]">
            <p className="text-gray-500 text-sm">Masa Berlaku</p>
            <p>{masa_berlaku}</p>
          </div>
          <div className="flex-1 min-w-[160px]">
            <p className="text-gray-500 text-sm">Timestamp Pengajuan</p> 
            <p>{timestamp}</p>
          </div>
          <div className="flex-1 min-w-[120px]">
            <p className="text-gray-500 text-sm">Keterangan</p>
            <p>{keterangan}</p>
          </div>
        </div>
      </div>
    );
  }
}

export default Score;