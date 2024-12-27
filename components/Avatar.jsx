import { useAnimations, useFBX, useGLTF } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const facialExpressions = {
  default: {},
  smile: {
    browInnerUp: 0.17,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.44,
    noseSneerLeft: 0.1700000727403593,
    noseSneerRight: 0.14000002836874015,
    mouthPressLeft: 0.61,
    mouthPressRight: 0.41000000000000003,
  },
  funnyFace: {
    jawLeft: 0.63,
    mouthPucker: 0.53,
    noseSneerLeft: 1,
    noseSneerRight: 0.39,
    mouthLeft: 1,
    eyeLookUpLeft: 1,
    eyeLookUpRight: 1,
    cheekPuff: 0.9999924982764238,
    mouthDimpleLeft: 0.414743888682652,
    mouthRollLower: 0.32,
    mouthSmileLeft: 0.35499733688813034,
    mouthSmileRight: 0.35499733688813034,
  },
  sad: {
    mouthFrownLeft: 1,
    mouthFrownRight: 1,
    mouthShrugLower: 0.78341,
    browInnerUp: 0.452,
    eyeSquintLeft: 0.72,
    eyeSquintRight: 0.75,
    eyeLookDownLeft: 0.5,
    eyeLookDownRight: 0.5,
    jawForward: 1,
  },
  surprised: {
    eyeWideLeft: 0.5,
    eyeWideRight: 0.5,
    jawOpen: 0.351,
    mouthFunnel: 1,
    browInnerUp: 1,
  },
  angry: {
    browDownLeft: 1,
    browDownRight: 1,
    eyeSquintLeft: 1,
    eyeSquintRight: 1,
    jawForward: 1,
    jawLeft: 1,
    mouthShrugLower: 1,
    noseSneerLeft: 1,
    noseSneerRight: 0.42,
    eyeLookDownLeft: 0.16,
    eyeLookDownRight: 0.16,
    cheekSquintLeft: 1,
    cheekSquintRight: 1,
    mouthClose: 0.23,
    mouthFunnel: 0.63,
    mouthDimpleRight: 1,
  },
  crazy: {
    browInnerUp: 0.9,
    jawForward: 1,
    noseSneerLeft: 0.5700000000000001,
    noseSneerRight: 0.51,
    eyeLookDownLeft: 0.39435766259644545,
    eyeLookUpRight: 0.4039761421719682,
    eyeLookInLeft: 0.9618479575523053,
    eyeLookInRight: 0.9618479575523053,
    jawOpen: 0.9618479575523053,
    mouthDimpleLeft: 0.9618479575523053,
    mouthDimpleRight: 0.9618479575523053,
    mouthStretchLeft: 0.27893590769016857,
    mouthStretchRight: 0.2885543872656917,
    mouthSmileLeft: 0.5578718153803371,
    mouthSmileRight: 0.38473918302092225,
    tongueOut: 0.9618479575523053,
  },
};

let setupMode = false;

const corresponding = {
  A: "viseme_aa",
  I: "viseme_I",
  U: "viseme_U",
  E: "viseme_E",
  O: "viseme_O",
  C: "viseme_CH",
  P: "viseme_PP",
  F: "viseme_FF",
  V: "viseme_V",
  T: "viseme_TH",
  D: "viseme_DD",
  N: "viseme_nn",
  K: "viseme_kk",
  R: "viseme_RR",
};

export function Avatar(props) {
  const [textAudio, setTextAudio] = useState("");

  // const {
  //   text, // Menambahkan kontrol teks dengan nilai default
  //   play,
  //   playAudio,
  //   script,
  //   headFollow,
  //   smoothMorphTarget,
  //   morphTargetSmoothing,
  // } = useControls({
  //   text: "",
  //   playAudio: false,
  //   headFollow: true,
  //   smoothMorphTarget: true,
  //   morphTargetSmoothing: 0.5,
  //   script: {
  //     value: "welcome",
  //     options: ["welcome", "pizzas"],
  //   },
  // });

  const [dataAudio, setDataAudio] = useState(null);

  const lerpMorphTarget = (target, value, speed = 0.1) => {
    scene.traverse((child) => {
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        const index = child.morphTargetDictionary[target];
        if (
          index === undefined ||
          child.morphTargetInfluences[index] === undefined
        ) {
          return;
        }
        child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          child.morphTargetInfluences[index],
          value,
          speed
        );

        if (!setupMode) {
          try {
            set({
              [target]: value,
            });
          } catch (e) {}
        }
      }
    });
  };
  const [blink, setBlink] = useState(false);
  const [winkLeft, setWinkLeft] = useState(false);
  const [winkRight, setWinkRight] = useState(false);

  const audio = useMemo(
    () => new Audio(`data:audio/mpeg;base64,${dataAudio}`),
    [dataAudio]
  );

  const jsonFile = useLoader(THREE.FileLoader, `audios/welcome.json`);
  const lipsync = JSON.parse(jsonFile);

  useFrame(() => {
    // const currentAudioTime = audio.currentTime;
    // if (audio.paused || audio.ended) {
    //   setAnimation("Idle");
    //   return setAnimation("Idle");
    // }

    // if (!props.isSpeaking) {
    //   setAnimation("Idle");
    //   return setAnimation("Idle");
    // }

    Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
      const mapping = facialExpressions[facialExpressions];
      if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
        return;
      }
      if (mapping && mappping[key]) {
        lerpMorphTarget(key, mapping[key], 0.1);
      } else {
        lerpMorphTarget(key, 0, 0.1);
      }
    });
    lerpMorphTarget("eyeBlinkLeft", blink || winkLeft ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink || winkRight ? 1 : 0, 0.5);

    Object.values(corresponding).forEach((value) => {
      nodes.Wolf3D_Head.morphTargetInfluences[
        nodes.Wolf3D_Head.morphTargetDictionary[value]
      ] = THREE.MathUtils.lerp(
        nodes.Wolf3D_Head.morphTargetInfluences[
          nodes.Wolf3D_Head.morphTargetDictionary[value]
        ],
        0,
        0.5
      );

      nodes.Wolf3D_Teeth.morphTargetInfluences[
        nodes.Wolf3D_Teeth.morphTargetDictionary[value]
      ] = THREE.MathUtils.lerp(
        nodes.Wolf3D_Teeth.morphTargetInfluences[
          nodes.Wolf3D_Teeth.morphTargetDictionary[value]
        ],
        0,
        0.5
      );

      // if (!smoothMorphTarget) {
      //   nodes.Wolf3D_Head.morphTargetInfluences[
      //     nodes.Wolf3D_Head.morphTargetDictionary[value]
      //   ] = 0;
      //   nodes.Wolf3D_Teeth.morphTargetInfluences[
      //     nodes.Wolf3D_Teeth.morphTargetDictionary[value]
      //   ] = 0;
      // } else {
      //   nodes.Wolf3D_Head.morphTargetInfluences[
      //     nodes.Wolf3D_Head.morphTargetDictionary[value]
      //   ] = THREE.MathUtils.lerp(
      //     nodes.Wolf3D_Head.morphTargetInfluences[
      //       nodes.Wolf3D_Head.morphTargetDictionary[value]
      //     ],
      //     0,
      //     morphTargetSmoothing
      //   );

      //   nodes.Wolf3D_Teeth.morphTargetInfluences[
      //     nodes.Wolf3D_Teeth.morphTargetDictionary[value]
      //   ] = THREE.MathUtils.lerp(
      //     nodes.Wolf3D_Teeth.morphTargetInfluences[
      //       nodes.Wolf3D_Teeth.morphTargetDictionary[value]
      //     ],
      //     0,
      //     morphTargetSmoothing
      //   );
      // }
    });

    for (let i = 0; i < lipsync.mouthCues.length; i++) {
      const mouthCue = lipsync.mouthCues[i];
      nodes.Wolf3D_Head.morphTargetInfluences[
        nodes.Wolf3D_Head.morphTargetDictionary[corresponding[mouthCue.value]]
      ] = THREE.MathUtils.lerp(
        nodes.Wolf3D_Head.morphTargetInfluences[
          nodes.Wolf3D_Head.morphTargetDictionary[corresponding[mouthCue.value]]
        ],
        1,
        0.5
      );
      nodes.Wolf3D_Teeth.morphTargetInfluences[
        nodes.Wolf3D_Teeth.morphTargetDictionary[corresponding[mouthCue.value]]
      ] = THREE.MathUtils.lerp(
        nodes.Wolf3D_Teeth.morphTargetInfluences[
          nodes.Wolf3D_Teeth.morphTargetDictionary[
            corresponding[mouthCue.value]
          ]
        ],
        1,
        0.5
      );

      break;
      // if (
      //   currentAudioTime >= mouthCue.start &&
      //   currentAudioTime <= mouthCue.end
      // ) {

      //   // if (!smoothMorphTarget) {
      //   //   nodes.Wolf3D_Head.morphTargetInfluences[
      //   //     nodes.Wolf3D_Head.morphTargetDictionary[
      //   //       corresponding[mouthCue.value]
      //   //     ]
      //   //   ] = 1;
      //   //   nodes.Wolf3D_Teeth.morphTargetInfluences[
      //   //     nodes.Wolf3D_Teeth.morphTargetDictionary[
      //   //       corresponding[mouthCue.value]
      //   //     ]
      //   //   ] = 1;
      //   // } else {
      //   //   nodes.Wolf3D_Head.morphTargetInfluences[
      //   //     nodes.Wolf3D_Head.morphTargetDictionary[
      //   //       corresponding[mouthCue.value]
      //   //     ]
      //   //   ] = THREE.MathUtils.lerp(
      //   //     nodes.Wolf3D_Head.morphTargetInfluences[
      //   //       nodes.Wolf3D_Head.morphTargetDictionary[
      //   //         corresponding[mouthCue.value]
      //   //       ]
      //   //     ],
      //   //     1,
      //   //     morphTargetSmoothing
      //   //   );
      //   //   nodes.Wolf3D_Teeth.morphTargetInfluences[
      //   //     nodes.Wolf3D_Teeth.morphTargetDictionary[
      //   //       corresponding[mouthCue.value]
      //   //     ]
      //   //   ] = THREE.MathUtils.lerp(
      //   //     nodes.Wolf3D_Teeth.morphTargetInfluences[
      //   //       nodes.Wolf3D_Teeth.morphTargetDictionary[
      //   //         corresponding[mouthCue.value]
      //   //       ]
      //   //     ],
      //   //     1,
      //   //     morphTargetSmoothing
      //   //   );
      //   // }

      //   break;
      // }
    }
  });

  useEffect(() => {
    // nodes.Wolf3D_Head.morphTargetInfluences[
    //   nodes.Wolf3D_Head.morphTargetDictionary["viseme_I"]
    // ] = 1;
    // nodes.Wolf3D_Teeth.morphTargetInfluences[
    //   nodes.Wolf3D_Teeth.morphTargetDictionary["viseme_I"]
    // ] = 1;
    if (props.isSpeaking) {
      // audio.play();
      setAnimation("Talking");
      // if (script === "welcome") {
      //   setAnimation("Talking");
      // } else {
      //   setAnimation("Disappointed");
      // }
    } else {
      setAnimation("Idle");
      // audio.pause();
    }
  }, [props.isSpeaking]);

  const { nodes, materials, scene } = useGLTF("/models/model_ali.glb");
  const { animations: idleAnimation } = useGLTF(
    "/models/Extra_Fully_Animated_4.glb"
  );

  idleAnimation[2].name = "Idle";
  idleAnimation[0].name = "Talking";
  idleAnimation[1].name = "Disappointed";

  const [animation, setAnimation] = useState("Idle");

  const group = useRef();
  const { actions } = useAnimations(
    [idleAnimation[2], idleAnimation[0], idleAnimation[1]],
    group
  );

  useEffect(() => {
    console.log("isi nodes", nodes);
    console.log("isi animasi", idleAnimation[1].name);
  }, [nodes]);

  useEffect(() => {
    actions[animation].reset().fadeIn(0.5).play();
    console.log("tes action ", actions[animation]);
    // return () => actions[animation].fadeOut(0.5);
  }, [animation]);

  useEffect(() => {
    console.log("isi nodes after animasi", nodes);
  }, [nodes]);

  useFrame((state) => {
    group.current.getObjectByName("Head").lookAt(state.camera.position);
  });

  useEffect(() => {
    let blinkTimeout;

    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          nextBlink();
        }, 200);
      }, 5000);
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  return (
    <group {...props} dispose={null} ref={group}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Glasses.geometry}
        material={materials.Wolf3D_Glasses}
        skeleton={nodes.Wolf3D_Glasses.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
    </group>
  );
}

useGLTF.preload("/models/model_ali.glb");
