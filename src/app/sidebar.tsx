import Link from "next/link";

export const Sidebar = () => {
  return (
    <div className="col-span-3 h-full w-full flex justify-center p-2">
      <div className="h-96 w-full p-2 md:p-8 mt-16">
        <Link href="/roulette" className="mt-4">
          <h2 className="text-lg font-semibold">Roulette</h2>
          <p className="text-sm text-gray-500 hidden md:flex">
            European Roulette
          </p>
        </Link>
      </div>
    </div>
  );
};
