import { AppCard, AppCardBody } from "@/components/app/primitives";
import type { SaveSwingsResponse, SearchResultPerson, SwingItem } from "@/lib/types";

type SwingsDisplayProps = {
  person:
    | SearchResultPerson
    | Pick<
        SaveSwingsResponse,
        "firstName" | "lastName" | "campus" | "area" | "swings"
      >;
  labels: {
    name: string;
    campus: string;
    area: string;
    weeklyWins: string;
  };
};

export function SwingsDisplay({ person, labels }: SwingsDisplayProps) {
  return (
    <AppCard className="w-full overflow-hidden">
      <div className="border-b border-fp-line px-5 py-5">
        <h2 className="font-h1 text-fp-slate">
          {person.firstName} {person.lastName}
        </h2>
        <div className="font-small space-y-1 text-fp-slate/72">
          <p>
            {labels.campus}: {person.campus}
          </p>
          <p>
            {labels.area}: {person.area}
          </p>
        </div>
      </div>
      <AppCardBody className="px-5 py-5">
        <ol className="space-y-4">
          {person.swings.map((swing: SwingItem, index: number) => (
            <li key={`${person.lastName}-${index}`} className="space-y-2">
              <p className="font-body font-semibold text-fp-slate">
                {index + 1}. {swing.category}
              </p>
              {swing.wins.length ? (
                <div className="pl-5">
                  <p className="font-small mb-1 text-fp-slate/62">{labels.weeklyWins}</p>
                  <ul className="space-y-1 text-sm text-fp-slate/82">
                    {swing.wins.map((win) => (
                      <li key={win}>• {win}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </AppCardBody>
    </AppCard>
  );
}
