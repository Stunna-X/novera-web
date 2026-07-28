import NoveraLogo from "../brand/NoveraLogo";

export default function LoadingScreen({ message = "Loading" }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-slate-100">
      <div className="flex flex-col items-center gap-6 text-center">
        <NoveraLogo />
        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-emerald-400" />
        </div>
        <p className="text-sm text-slate-400">{message}</p>
      </div>
    </main>
  );
}
