import Flower from "./Flower";

export default function InvitationCard() {
    return (
        <div className="relative w-[80%] h-40 flex justify-center items-center border border-black rounded-lg bg-white mt-10">
            <div className="w-25 absolute rotate-30 -top-13 -left-10">
                <Flower/>
            </div>
            <p className="tracking-[0.2em] text-gray-800 p-1 text-[3rem] font-island relative w-max 
            
            before:absolute before:inset-0 before:animate-magicTypewriter before:bg-white 
            
            after:absolute after:w-[4em] after:ml-[-4em] after:h-[0.8em] after:mt-4 after:bg-linear-to-r after:from-[#ffffff00] after:to-[#ffffff] after:inset-0 after:animate-magicCaret">Csabi és Nóri</p>
        </div>
    );
};