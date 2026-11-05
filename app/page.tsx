import Image from "next/image";
import Navbar from "./components/Navbar";
import InvitationCard from "./components/InvitationCard";
import Flower from "./components/Flower";

export default function Home() {
  return (
    <main className="bg-amber-50 h-screen">
      <Navbar />
      <div className="flex justify-center">
        <InvitationCard/>
      </div>
        {/* <Flower/> */}
    </main>
  );
}
