import {
  EffectComposer,
  Bloom,
  ToneMapping,
  Vignette,
  BrightnessContrast,
  HueSaturation,
  Outline,
  Selection,
} from "@react-three/postprocessing";
import { ToneMappingMode, BlendFunction } from "postprocessing";
import { useSceneStore, ColorGrade } from "@/state/sceneStore";

// ─── LUT presets — applied as combined Brightness/Contrast/HueSat tuning ──
const GRADES: Record<
  ColorGrade,
  {
    brightness: number;
    contrast: number;
    hue: number;
    saturation: number;
    bloomBoost?: number;
  }
> = {
  none: { brightness: 0, contrast: 0, hue: 0, saturation: 0 },
  sunset: {
    brightness: 0.04,
    contrast: 0.18,
    hue: -0.05,
    saturation: 0.25,
    bloomBoost: 0.2,
  },
  blueHour: {
    brightness: -0.06,
    contrast: 0.12,
    hue: 0.12,
    saturation: -0.12,
    bloomBoost: 0.15,
  },
  cyberpunk: {
    brightness: -0.03,
    contrast: 0.3,
    hue: 0.18,
    saturation: 0.45,
    bloomBoost: 0.5,
  },
  noir: {
    brightness: -0.02,
    contrast: 0.35,
    hue: 0,
    saturation: -1,
  },
  vibrant: {
    brightness: 0.03,
    contrast: 0.15,
    hue: 0,
    saturation: 0.35,
  },
};

export function PostFX() {
  const isNight = useSceneStore((s) => s.timeOfDay) === "night";
  const grade = useSceneStore((s) => s.colorGrade);
  const g = GRADES[grade];

  const bloomIntensity =
    (isNight ? 0.9 : 0.25) + (g.bloomBoost ?? 0);

  return (
    <Selection>
      <EffectComposer multisampling={2}>
        <Outline
          edgeStrength={isNight ? 12 : 6}
          visibleEdgeColor={0x6366f1}
          hiddenEdgeColor={0x4338ca}
          blur
          xRay={false}
        />
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={isNight ? 0.4 : 0.85}
          luminanceSmoothing={0.18}
          mipmapBlur
        />
        {grade !== "none" && (
          <>
            <BrightnessContrast
              brightness={g.brightness}
              contrast={g.contrast}
            />
            <HueSaturation hue={g.hue} saturation={g.saturation} />
          </>
        )}
        <ToneMapping
          mode={isNight ? ToneMappingMode.ACES_FILMIC : ToneMappingMode.NEUTRAL}
        />
        <Vignette
          offset={0.35}
          darkness={isNight ? 0.55 : 0.25}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </Selection>
  );
}
