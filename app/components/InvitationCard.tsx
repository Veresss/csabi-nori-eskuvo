import { ShineBorder } from "@/components/ui/shine-border";
import Flower from "./Flower";
import { DiaTextReveal } from "@/components/ui/dia-text-reveal"

export default function InvitationCard() {
    return (
        <div className="relative w-[80%] h-40 flex justify-center items-center rounded-lg bg-white mt-10">
            <ShineBorder duration={14} shineColor={["#fbbf24", "#f59e0b", "#fbbf24"]} borderWidth={2} className="rounded-lg"/>
                <div className="w-25 absolute rotate-30 -top-13 -left-10">
                    <Flower />
                </div>
                <DiaTextReveal className="text-[4rem] font-island tracking-[0.6rem]" duration={4} text="Csabi és Nóri" colors={["#000000", "#ffffff00"]} />
        </div>
    );
}      