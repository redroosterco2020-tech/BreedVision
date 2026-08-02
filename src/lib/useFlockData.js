import { useEffect, useState, useCallback, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { DEFAULT_GOAL_WEIGHTS } from "./constants.js";

// Stores each user's flock under: flocks/{uid}  -> { breeders: [...], goalWeights: {...} }
export function useFlockData(uid) {
  const [breeders, setBreeders] = useState([]);
  const [goalWeights, setGoalWeights] = useState(DEFAULT_GOAL_WEIGHTS);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const ref = doc(db, "flocks", uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setBreeders(data.breeders || []);
          setGoalWeights(data.goalWeights || DEFAULT_GOAL_WEIGHTS);
        }
      } catch (e) {
        console.error("load failed", e);
        setSaveError("خواندن اطلاعات از سرور با خطا مواجه شد: " + (e.message || e.code || "خطای نامشخص"));
      } finally {
        setLoaded(true);
      }
    })();
  }, [uid]);

  const persist = useCallback(
    (nextBreeders, nextGoalWeights) => {
      if (!uid) return;
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setSaving(true);
        try {
          await setDoc(doc(db, "flocks", uid), {
            breeders: nextBreeders,
            goalWeights: nextGoalWeights,
            updatedAt: new Date().toISOString(),
          });
          setSaveError("");
        } catch (e) {
          console.error("save failed", e);
          setSaveError("ذخیره‌سازی در سرور با خطا مواجه شد: " + (e.message || e.code || "خطای نامشخص"));
        } finally {
          setSaving(false);
        }
      }, 400); // debounce writes
    },
    [uid]
  );

  const updateBreeders = useCallback(
    (updater) => {
      setBreeders((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        persist(next, goalWeights);
        return next;
      });
    },
    [goalWeights, persist]
  );

  const updateGoalWeights = useCallback(
    (updater) => {
      setGoalWeights((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        persist(breeders, next);
        return next;
      });
    },
    [breeders, persist]
  );

  return { breeders, goalWeights, loaded, updateBreeders, updateGoalWeights, saveError, saving };
          }
