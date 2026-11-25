import { Title } from "../components/Title";
import type { SceneProps } from "../timing";

export default function S08({ scene }: SceneProps) {
  return <Title title={scene.title} label={scene.id} />;
}
