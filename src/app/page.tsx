import { SparkCard } from '@/components/SparkCard';

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col justify-center items-center bg-base-200 p-4 relative overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8">

        {/* Header / Logo Area */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold tracking-tight text-base-content/80 mb-1">Luvora</h1>
          <p className="text-xs uppercase tracking-[0.2em] opacity-40">Daily Spark</p>
        </div>

        {/* The Main Interface */}
        <SparkCard />

      </div>
    </main>
  );
}
