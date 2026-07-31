import { useEffect, useState, useCallback, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";

// Stores each user's flock under: flocks/{uid}  -> { breeders: [...], goalId: "..." }
export function useFlockData(uid) {
  const [breeders, setBreeders] = useState([]);
  const [goalId, setGoalId] = useState("weight");
  const [loaded, setLoaded] = useState(false);
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
          setGoalId(data.goalId || "weight");
        }
      } catch (e) {
        console.error("load failed", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, [uid]);

  const persist = useCallback(
    (nextBreeders, nextGoal) => {
      if (!uid) return;
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          await setDoc(doc(db, "flocks", uid), {
            breeders: nextBreeders,
            goalId: nextGoal,
            updatedAt: new Date().toISOString(),
          });
        } catch (e) {
          console.error("save failed", e);
        }
      }, 400); // debounce writes
    },
    [uid]
  );

  const updateBreeders = useCallback(
    (updater) => {
      setBreeders((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        persist(next, goalId);
        return next;
      });
    },
    [goalId, persist]
  );

  const updateGoal = useCallback(
    (g) => {
      setGoalId(g);
      persist(breeders, g);
    },
    [breeders, persist]
  );

  return { breeders, goalId, loaded, updateBreeders, updateGoal };
}
