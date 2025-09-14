import { Button } from "@/components/ui/button";
import Link from "next/link";

export function FinalCtaSection() {
  return (
    <div className="py-16 bg-white text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Legal problems are stressful.
        </h2>
        <h3 className="text-2xl md:text-3xl font-bold text-blue-600 mb-6">
          Solving them doesn&apos;t have to be.
        </h3>

        <p className="text-lg text-gray-700 mb-8">
          Let Legally Bourne guide you
        </p>
        <Link href="/chat">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full mb-4"
          >
            Start My Case for Free
          </Button>
        </Link>

        <p className="text-sm text-gray-500">
          Free to start - no payment required for basic assistance
        </p>
      </div>
    </div>
  );
}
