import { ButtonMode } from "../settings/_components/ButtonMode"
import PlaySong from "./PlaySong"

export const PainelControl = () => {
    return (
        <div className="fixed flex items-center justify-center gap-1 bg-gray-100/50 backdrop-blur-sm p-2 rounded-3xl top-3 right-3 z-[999999]">
            <PlaySong />
            <ButtonMode />
        </div>
    )
}