import { Title } from "../components/Title";
import type { SceneProps } from "../timing";

export default function S00({ scene }: SceneProps) {
  return <Title title={scene.title} label={scene.id} />;
}
