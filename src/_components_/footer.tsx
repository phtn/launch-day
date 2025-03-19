import { Icon } from "@/lib/icons";

export const Footer = () => (
  <footer className="w-full flex gap-6 h-8 border-t-[0.330px] border-dashed border-orange-200/10 items-center px-2 justify-between">
    <button className="bg-background">
      <Icon name="energy" className="text-orange-200 size-4" />
    </button>

    <button className="flex items-center">→</button>
  </footer>
);
