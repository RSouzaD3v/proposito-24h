import { ButtonMode } from "../settings/_components/ButtonMode"
import PlaySong from "./PlaySong"

export const PainelControl = () => {
    return (
        <div className="fixed max-w-40 flex items-center justify-center gap-1 bg-gray-100/50 backdrop-blur-sm p-1 md:p-2 rounded-3xl md:top-3 top-16 right-3 z-[999999]">
            <PlaySong />
            <ButtonMode />
        </div>
    )
}