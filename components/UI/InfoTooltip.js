export default function InfoTooltip({ text }) {
    return (
        <div className="relative inline-block group ml-2 align-middle">
            <div className="cursor-help w-4 h-4 rounded-full border border-zinc-600 flex items-center justify-center text-[10px] text-zinc-400 hover:text-white hover:border-zinc-400 transition-colors">
                i
            </div>

            {/* Tooltip Popup */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-3 bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <p className="text-xs text-zinc-300 leading-snug text-center">
                    {text}
                </p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-900/90" />
            </div>
        </div>
    );
}
