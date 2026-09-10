import { Heart, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/shared/Button";
import type { DataStatus } from "@/hooks/useCandiMatch";

interface LandingScreenProps {
  onStart: () => void;
  dataStatus: DataStatus;
  onRetry: () => void;
}

export function LandingScreen({ onStart, dataStatus, onRetry }: LandingScreenProps) {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div className="flex animate-[fade-in-up_0.5s_ease-out_both] flex-col items-center gap-3">
        <h1>
          <Image
            src="/candimatch-logo.png"
            alt="CandiMatch"
            width={500}
            height={500}
            priority
            className="h-32 w-32 sm:h-36 sm:w-36"
          />
        </h1>
        <p className="max-w-xs text-lg font-medium text-zinc-600 sm:max-w-sm">
          Descubra qual candidato à presidência 2026 combina com você.
        </p>
      </div>

      <div className="relative h-40 w-full max-w-[220px] animate-[fade-in-up_0.5s_ease-out_both] [animation-delay:120ms]">
        <div className="absolute inset-0 -rotate-[8deg] rounded-3xl bg-gradient-to-br from-orange-200 to-rose-200" />
        <div className="absolute inset-0 rotate-[4deg] rounded-3xl bg-gradient-to-br from-rose-300 to-purple-300" />
        <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/90 shadow-xl backdrop-blur-sm">
          <Heart className="h-10 w-10 text-rose-500" fill="currentColor" strokeWidth={0} />
        </div>
      </div>

      <p className="max-w-xs animate-[fade-in-up_0.5s_ease-out_both] text-sm text-zinc-500 sm:max-w-sm [animation-delay:200ms]">
        Responda a algumas propostas e descubra com quem você mais combina,
        sem saber de qual candidato elas são.
      </p>

      {dataStatus === "error" ? (
        <div className="flex w-full max-w-xs animate-[fade-in-up_0.5s_ease-out_both] flex-col items-center gap-3 [animation-delay:280ms]">
          <p className="text-sm text-rose-500">
            Não foi possível carregar os candidatos agora. Verifique sua conexão e tente de novo.
          </p>
          <Button onClick={onRetry} className="w-full text-lg">
            Tentar novamente
          </Button>
        </div>
      ) : (
        <Button
          onClick={onStart}
          disabled={dataStatus === "loading"}
          className="w-full max-w-xs animate-[fade-in-up_0.5s_ease-out_both] text-lg [animation-delay:280ms]"
        >
          {dataStatus === "loading" && <Loader2 className="h-5 w-5 animate-spin" />}
          {dataStatus === "loading" ? "Carregando candidatos..." : "Descobrir meu match"}
        </Button>
      )}

      <p className="animate-[fade-in-up_0.5s_ease-out_both] text-xs text-zinc-400 [animation-delay:340ms]">
        Sem cadastro. Leva menos de 2 minutos.
      </p>

      <p className="animate-[fade-in-up_0.5s_ease-out_both] text-[10px] text-zinc-300 [animation-delay:380ms]">
        Fotos e propostas são dados públicos do{" "}
        <a
          href="https://divulgacandcontas.tse.jus.br"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-400"
        >
          TSE
        </a>
        .
      </p>
    </div>
  );
}
