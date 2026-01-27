import Image from "next/image";

export default function Home() {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold text-primary">Luvora</h1>
          <p className="py-6">
            The Deterministic Daily Spark.
            <br />
            Current Theme: <span className="font-mono bg-base-300 px-2 py-1 rounded">Auto (Time-based)</span>
          </p>
          <button className="btn btn-primary">Get Started</button>
        </div>
      </div>
    </div>
  );
}
