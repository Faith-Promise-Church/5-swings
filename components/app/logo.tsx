/* eslint-disable @next/next/no-img-element */
type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <div className="inline-flex items-center justify-center rounded-2xl bg-white/88 px-4 py-3 shadow-fp ring-1 ring-fp-line/80 backdrop-blur-sm">
      <img
        src="/fp-logo.png"
        alt="Faith Promise"
        className={className ?? "mx-auto h-16 w-auto object-contain"}
      />
    </div>
  );
}
