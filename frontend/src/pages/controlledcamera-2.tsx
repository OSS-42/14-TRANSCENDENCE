import { ReactThreeFiber, useFrame, useThree } from "@react-three/fiber";
import * as React from "react";
import {
  Box3,
  MathUtils,
  Matrix4,
  MOUSE,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  Sphere,
  Camera,
  Spherical,
  Vector2,
  Vector3,
  Vector4,
  // WebGLRenderer,
  OrthographicCamera
} from "three";

import CameraControlsImpl from "camera-controls";

const subsetOfTHREE = {
  MOUSE: MOUSE,
  Vector2: Vector2,
  Vector3: Vector3,
  Vector4: Vector4,
  Quaternion: Quaternion,
  Matrix4: Matrix4,
  Spherical: Spherical,
  Box3: Box3,
  Sphere: Sphere,
  Raycaster: Raycaster,
  MathUtils: {
    DEG2RAD: MathUtils.DEG2RAD,
    clamp: MathUtils.clamp
  }
};

CameraControlsImpl.install({ THREE: subsetOfTHREE });

export type CameraControlsProps = ReactThreeFiber.Overwrite<
  ReactThreeFiber.Object3DNode<CameraControlsImpl, typeof CameraControlsImpl>,
  {
    target?: ReactThreeFiber.Vector3;
    camera?: Camera;
    domElement?: HTMLElement;
  }
>;

export const ControlledCameras = React.forwardRef<
  CameraControlsImpl,
  CameraControlsProps
>(({ camera, domElement, ...restProps }, ref) => {
  const defaultCamera = useThree(({ camera }) => camera);
  const gl = useThree(({ gl }) => gl);

  const explCamera = (camera || defaultCamera) as
    | PerspectiveCamera
    | OrthographicCamera;

  const controls = React.useMemo(
    () => new CameraControlsImpl(explCamera, gl.domElement),
    [explCamera, gl.domElement]
  );

  useFrame((_, delta) => {
    if (controls.enabled) controls.update(delta);
  });

  return <primitive ref={ref} object={controls} {...restProps} />;
});
