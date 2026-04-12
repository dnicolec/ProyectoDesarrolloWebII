export default function Loading() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ backgroundColor: "#FDF6F0" }}
    >
      <div className="text-center animate-fade-in">
        <h1 className="font-serif text-3xl font-extrabold">
          <span className="text-coral">La</span>{" "}
          <span className="text-teal">Cuponera</span>
        </h1>
        <div className="flex items-center justify-center gap-2 mt-5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-teal animate-bounce"
              style={{
                animationDelay: `${i * 0.18}s`,
                animationDuration: "0.9s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
