import { getTheme } from "./actions";
import { Content } from "./content";
export default async function Page() {
  const theme = await getTheme();
  return <Content theme={theme} />;
}
