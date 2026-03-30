import { BubbleTeaIllustration } from "@/components/illustrations/BubbleTeaIllustration";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <BubbleTeaIllustration />
      <p className="mt-6 max-w-sm font-heading text-lg text-[#5c4a32]">
        I&apos;m just here waiting for your charming notes...
      </p>
    </div>
  );
}
