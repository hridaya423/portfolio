import { DATA } from "@/data/resume";

export function SiteName() {
  const [first, ...rest] = DATA.name.split(" ");
  return (
    <>
      {first}
      {rest.length > 0 && <span className="site-header-rest"> {rest.join(" ")}</span>}
    </>
  );
}
