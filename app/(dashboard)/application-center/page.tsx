import { ApplicationList } from "@/components/applications/ApplicationList";

export const metadata = {
  title: "Application Center - Polaris Pilot",
};

export default function ApplicationCenterPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <ApplicationList />
    </div>
  );
}
