import type { Metadata } from "next";
import { Page, Unavailable } from "@/components/Page";
import { V } from "@/components/V";
import { catalog } from "@/lib/data";

export const metadata: Metadata = { title: "Catalog" };
const F = "metadata_catalog.json";

export default function CatalogPage() {
  const c = catalog();
  if (!c) {
    return (
      <Page eyebrow="Catalog" title="Catalog">
        <Unavailable file={F} />
      </Page>
    );
  }
  return (
    <Page
      eyebrow="Catalog"
      title="Every dataset, described"
      lede="Owner, classification, freshness and columns for each dataset in the pipeline, from the static metadata export."
    >
      <p className="small muted">
        <V file={F} ptr="/completeness/documented" /> of <V file={F} ptr="/completeness/items" /> items documented (
        <V file={F} ptr="/completeness/documented_pct" as="f1" />
        %) · <V file={F} ptr="/datasets" as="len" /> datasets · generated <V file={F} ptr="/generated_at" as="date" />{" "}
        UTC
      </p>
      {c.datasets.map((d, i) => (
        <div className="card" key={d.name} style={{ marginBottom: 10 }}>
          <h3 style={{ marginTop: 0 }}>
            <V file={F} ptr={`/datasets/${i}/name`} as="raw" />{" "}
            <span className="small muted" style={{ fontWeight: 400 }}>
              <V file={F} ptr={`/datasets/${i}/layer`} as="raw" /> ·{" "}
              <V file={F} ptr={`/datasets/${i}/classification`} as="raw" /> · freshness:{" "}
              <V file={F} ptr={`/datasets/${i}/freshness_sla`} as="raw" />{" "}
              · owner: <V file={F} ptr={`/datasets/${i}/owner`} as="raw" />
            </span>
          </h3>
          <p style={{ marginBottom: 6 }}>
            <V file={F} ptr={`/datasets/${i}/description`} as="raw" />
          </p>
          <p className="small">
            <code>
              <V file={F} ptr={`/datasets/${i}/physical`} as="raw" />
            </code>
          </p>
          {d.columns.length ? (
            <details>
              <summary>
                <V file={F} ptr={`/datasets/${i}/columns`} as="len" /> columns
              </summary>
              <div className="scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Column</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.columns.map((col, j) => (
                      <tr key={col.name}>
                        <td>
                          <code>
                            <V file={F} ptr={`/datasets/${i}/columns/${j}/name`} as="raw" />
                          </code>
                        </td>
                        <td>
                          {col.description ? (
                            <V file={F} ptr={`/datasets/${i}/columns/${j}/description`} as="raw" />
                          ) : (
                            <span className="muted">no description</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ) : null}
        </div>
      ))}
    </Page>
  );
}
