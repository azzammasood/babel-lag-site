import type { Metadata } from "next";
import { Page, Unavailable } from "@/components/Page";
import { V } from "@/components/V";
import { lineage } from "@/lib/data";

export const metadata: Metadata = { title: "Lineage" };
const F = "metadata_lineage.json";
const ORDER = ["source", "landing", "bronze", "silver", "gold", "dbt", "export", "job"];

export default function LineagePage() {
  const l = lineage();
  if (!l) {
    return (
      <Page eyebrow="Lineage" title="Lineage">
        <Unavailable file={F} />
      </Page>
    );
  }
  const layers = [...new Set(l.nodes.map((n) => n.layer))].sort(
    (a, b) => (ORDER.indexOf(a) + 99) % 99 - ((ORDER.indexOf(b) + 99) % 99),
  );
  return (
    <Page
      eyebrow="Lineage"
      title="From a live event to a published number"
      lede="Every dataset and job between the Wikimedia sources and the exports this site reads, as recorded by the pipeline."
    >
      <p className="small muted">
        <V file={F} ptr="/nodes" as="len" /> nodes · <V file={F} ptr="/edges" as="len" /> edges ·{" "}
        <V file={F} ptr="/columns" as="len" /> column mappings · generated <V file={F} ptr="/generated_at" as="date" />{" "}
        UTC
      </p>
      <div className="layers">
        {layers.map((layer) => (
          <div className="card" key={layer}>
            <h3>{layer}</h3>
            <ul>
              {l.nodes.map((n, i) =>
                n.layer === layer ? (
                  <li key={n.id}>
                    <V file={F} ptr={`/nodes/${i}/id`} as="raw" /> <span className="muted">
                      (<V file={F} ptr={`/nodes/${i}/kind`} as="raw" />)
                    </span>
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        ))}
      </div>

      <h2>Edges</h2>
      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
            </tr>
          </thead>
          <tbody>
            {l.edges.map((e, i) => (
              <tr key={i}>
                <td>
                  <V file={F} ptr={`/edges/${i}/from`} as="raw" />
                </td>
                <td>
                  <V file={F} ptr={`/edges/${i}/to`} as="raw" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Column lineage</h2>
      <details>
        <summary>Show the column mappings</summary>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Column</th>
                <th>Comes from</th>
              </tr>
            </thead>
            <tbody>
              {l.columns.map((c, i) => (
                <tr key={c.to}>
                  <td>
                    <V file={F} ptr={`/columns/${i}/to`} as="raw" />
                  </td>
                  <td>
                    {c.from.map((_, j) => (
                      <span key={j}>
                        {j ? ", " : ""}
                        <V file={F} ptr={`/columns/${i}/from/${j}`} as="raw" />
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Page>
  );
}
