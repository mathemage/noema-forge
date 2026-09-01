import {
  getCrisisResources,
  NOT_EQUIPPED_STATEMENT,
  type CrisisLocale,
} from "@/lib/safety/crisis-resources";

type CrisisResourcesProps = {
  locale: CrisisLocale;
};

export function CrisisResources({ locale }: CrisisResourcesProps) {
  const { emergency, label, resources } = getCrisisResources(locale);

  return (
    <section aria-labelledby="crisis-resources-heading" className="space-y-4">
      <div className="space-y-2">
        <p className="eyebrow">Crisis resources</p>
        <h2
          className="text-2xl font-semibold tracking-[-0.025em] text-foreground"
          id="crisis-resources-heading"
        >
          If you need help now
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-muted">
          {NOT_EQUIPPED_STATEMENT}
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        <li className="inset-panel p-4">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-accent-strong">
            Emergency services
          </p>
          <p className="mt-1.5 break-words text-base font-semibold text-foreground">
            {emergency}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted">
            Resource set: {label}. Set by CRISIS_RESOURCE_LOCALE and written into
            the app by hand.
          </p>
        </li>

        {resources.map((resource) => (
          <li className="inset-panel p-4" key={resource.name}>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-accent-strong">
              {resource.name}
            </p>
            <p className="mt-1.5 break-words text-base font-semibold text-foreground">
              {resource.url ? (
                <a href={resource.url} rel="noreferrer" target="_blank">
                  {resource.contact}
                </a>
              ) : (
                resource.contact
              )}
            </p>
            <p className="mt-1 text-sm leading-6 text-muted">
              {resource.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
