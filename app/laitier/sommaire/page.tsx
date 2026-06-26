import Sidenav from "@/app/components/ui/sidenav";
import SommaireClient from "./SommaireClient";

export default function SommaireTroupeauPage() {
  return (
    <Sidenav>
      <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-8 font-sans pb-20">
        <SommaireClient />
      </div>
    </Sidenav>
  );
}
