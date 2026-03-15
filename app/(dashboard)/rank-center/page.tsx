import { RankList } from "@/components/rank-center/RankList";

export const metadata = {
  title: "Rank Center - Polaris Pilot",
};

export default function RankCenterPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <RankList />
    </div>
  );
}
