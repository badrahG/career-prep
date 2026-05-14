/*
 * Skeleton loading components.
 *
 * Usage:
 *   import { CardSkeleton, ListSkeleton, DetailSkeleton } from "../components/Skeleton";
 *
 *   if (loading) return <CardSkeleton count={3} />;
 */

// Base pulse utility — all skeletons use this
function Pulse({ className }) {
  return <div className={"animate-pulse bg-gray-200/70 dark:bg-gray-600/70 rounded " + (className || "")}></div>;
}

// Card-shape skeleton (for CV list, scholarship list, advice list)
export function CardSkeleton({ count = 3 }) {
  var items = Array.from({ length: count }, function (_, i) { return i; });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(function (i) {
        return (
          <div key={i} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <Pulse className="w-12 h-12 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Pulse className="h-4 w-3/4" />
                <Pulse className="h-3 w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <Pulse className="h-3 w-full" />
              <Pulse className="h-3 w-5/6" />
              <Pulse className="h-3 w-4/6" />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <Pulse className="h-3 w-20" />
              <Pulse className="h-3 w-12" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// List-row skeleton (for admin lists, interview questions, advice list in category)
export function ListSkeleton({ count = 5 }) {
  var items = Array.from({ length: count }, function (_, i) { return i; });
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl divide-y divide-gray-100 dark:divide-gray-700">
      {items.map(function (i) {
        return (
          <div key={i} className="p-5 flex items-start gap-4">
            <Pulse className="w-10 h-10 rounded flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Pulse className="h-4 w-2/3" />
              <Pulse className="h-3 w-full" />
              <Pulse className="h-3 w-4/5" />
            </div>
            <Pulse className="w-16 h-8 flex-shrink-0" />
          </div>
        );
      })}
    </div>
  );
}

// Stats skeleton (for Dashboard)
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map(function (i) {
        return (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
            <Pulse className="h-3 w-24" />
            <Pulse className="h-8 w-16" />
          </div>
        );
      })}
    </div>
  );
}

// Detail page skeleton (for CV, Scholarship, Advice detail)
export function DetailSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-8 space-y-5">
      <div className="space-y-2">
        <Pulse className="h-4 w-20" />
        <Pulse className="h-8 w-3/4" />
        <Pulse className="h-3 w-1/2" />
      </div>
      <div className="pt-4 border-t border-gray-100 space-y-2">
        <Pulse className="h-3 w-full" />
        <Pulse className="h-3 w-full" />
        <Pulse className="h-3 w-5/6" />
        <Pulse className="h-3 w-4/6" />
      </div>
      <div className="space-y-2">
        <Pulse className="h-3 w-full" />
        <Pulse className="h-3 w-full" />
        <Pulse className="h-3 w-3/4" />
      </div>
    </div>
  );
}

// Single row skeleton (for compact lists)
export function RowSkeleton({ count = 3 }) {
  var items = Array.from({ length: count }, function (_, i) { return i; });
  return (
    <div className="space-y-2">
      {items.map(function (i) {
        return (
          <div key={i} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 flex items-center gap-3">
            <Pulse className="w-8 h-8 rounded flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Pulse className="h-3 w-1/2" />
              <Pulse className="h-2 w-3/4" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Question card skeleton (for interview flashcard/quiz)
export function QuestionSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-8 md:p-10 space-y-6" style={{ minHeight: "420px" }}>
      <div className="flex items-center justify-between">
        <Pulse className="h-5 w-20" />
        <Pulse className="h-5 w-24" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-3">
        <Pulse className="h-3 w-16 mx-auto" />
        <Pulse className="h-6 w-3/4 mx-auto" />
        <Pulse className="h-6 w-2/3 mx-auto" />
      </div>
    </div>
  );
}

// Activity timeline skeleton (for Dashboard activity section)
export function ActivitySkeleton({ count = 5 }) {
  var widths = ["w-2/3", "w-1/2", "w-3/4", "w-1/2", "w-3/5"];
  var subWidths = ["w-1/3", "w-1/4", "w-2/5", "w-1/3", "w-1/4"];
  var items = Array.from({ length: count }, function (_, i) { return i; });
  return (
    <div className="px-6 py-4 space-y-4">
      {items.map(function (i) {
        return (
          <div key={i} className="flex items-start gap-4">
            <Pulse className="w-7 h-7 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5 pt-0.5 min-w-0">
              <Pulse className={"h-3.5 " + widths[i % widths.length]} />
              <Pulse className={"h-3 " + subWidths[i % subWidths.length]} />
            </div>
            <Pulse className="h-3 w-14 flex-shrink-0 mt-0.5" />
          </div>
        );
      })}
    </div>
  );
}

// Default export — inline skeleton for general use
export default function Skeleton({ className }) {
  return <Pulse className={className} />;
}