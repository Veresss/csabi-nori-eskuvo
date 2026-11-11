import Navbar from "./components/Navbar";
import InvitationCard from "./components/InvitationCard";
import { ConfettiFireworks } from "@/components/ui/confetti-fireworks";
import FlowerCanvas from "./components/FlowerCanvas";
import FancyMap from "./components/FancyMap";

export default function Home() {
  return (
    <main className="bg-amber-50 h-screen">
      <Navbar />
      <div className="flex justify-center">
        <InvitationCard />
      </div>
      <ConfettiFireworks />
      <FlowerCanvas />
      <div className="flex justify-center gap-5">
        <FancyMap lat={47.447670} lng={19.035726} title={"Lagzi helyszín"} address={"Szent Mihály Közösségi Ház"} />
        <FancyMap lat={47.519386} lng={19.113033} title={"Templom"} address={"Budapesti Páduai Szent Antal templom"} />
      </div>
    </main>
  );
}
