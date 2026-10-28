export function PendantTile({label, value, unit}: {label: string; value: string | undefined; unit?: string}) {
    return (
        <div className="flex flex-col items-center justify-center rounded border bg-zinc-200 p-4">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-700">{label}:</h2>
            <p className="mt-1 whitespace-pre-line font-bold text-black text-4xl">
                {value ?? '-'}{value !== undefined && unit}
            </p>                   
        </div>
    ) 
}