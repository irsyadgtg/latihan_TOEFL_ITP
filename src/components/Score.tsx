import { Component } from "react";

type ScoreData = {
  name: string;
  score: string;
  status: string;
  masa_berlaku: string;
  timestamp: string;
  keterangan: string;
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
            <p>{status}</p>
          </div>
          <div className="flex-1 min-w-[150px]">
            <p className="text-gray-500 text-sm">Masa Berlaku</p>
            <p>{masa_berlaku}</p>
          </div>
          <div className="flex-1 min-w-[160px]">
            <p className="text-gray-500 text-sm">Timestamp</p>
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
