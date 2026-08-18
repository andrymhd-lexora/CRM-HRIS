import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { Attendance, Employee } from '../types/crm';
import { db } from '../lib/firebase';
import {
  subscribeAttendances,
  subscribeEmployees,
  addOrUpdateAttendance,
  updateAttendance
} from '../db/firestoreService';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export interface HRISSyncResult {
  attendances: Attendance[];
  employees: Employee[];
  setAttendances: Dispatch<SetStateAction<Attendance[]>>;
  setEmployees: Dispatch<SetStateAction<Employee[]>>;
  revalidateHRISData: () => Promise<void>;
  syncCheckIn: (data: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string | void>;
  syncCheckOut: (id: string | number, data: Partial<Attendance>) => Promise<void>;
  isSyncing: boolean;
}

/**
 * Custom Unified HRIS Synchronization Hook
 * Ensures local state for 'attendances' and 'employees' is re-validated and
 * optimistically updated immediately after any check-in or check-out operation,
 * making 'Daftar Kehadiran Hari Ini' reflect changes with 0ms delay.
 */
export function useHRISSync(): HRISSyncResult {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Subscribe to real-time updates from Firestore for baseline background sync
  useEffect(() => {
    const unsubEmployees = subscribeEmployees((empData) => {
      setEmployees(empData);
    });
    const unsubAttendances = subscribeAttendances((attData) => {
      setAttendances(attData);
    });

    return () => {
      unsubEmployees();
      unsubAttendances();
    };
  }, []);

  // Immediate Re-validation helper to pull fresh Firestore data on-demand
  const revalidateHRISData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const attCol = collection(db, 'attendances');
      const qAtt = query(attCol, orderBy('date', 'desc'));
      const attSnap = await getDocs(qAtt);
      const freshAttendances: Attendance[] = attSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as Attendance[];

      const empCol = collection(db, 'employees');
      const qEmp = query(empCol, orderBy('createdAt', 'desc'));
      const empSnap = await getDocs(qEmp);
      const freshEmployees: Employee[] = empSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as Employee[];

      setAttendances(freshAttendances);
      setEmployees(freshEmployees);
    } catch (error) {
      console.warn('HRIS revalidation error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Unified Check-In sync: Optimistic update -> Firestore persistence -> Immediate revalidation
  const syncCheckIn = useCallback(
    async (data: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>) => {
      setIsSyncing(true);
      const nowIso = new Date().toISOString();
      const tempId = `temp-${Date.now()}`;

      // 1. Instant Optimistic Local State Update
      setAttendances((prev) => {
        const existingIdx = prev.findIndex(
          (a) => String(a.employeeId) === String(data.employeeId) && a.date === data.date
        );

        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            ...data,
            updatedAt: nowIso
          };
          return updated;
        } else {
          const newRec: Attendance = {
            id: tempId,
            ...data,
            createdAt: nowIso,
            updatedAt: nowIso
          };
          return [newRec, ...prev];
        }
      });

      try {
        // 2. Persist to Cloud Firestore
        const resultId = await addOrUpdateAttendance(data);

        // Replace temp ID if returned
        if (resultId) {
          setAttendances((prev) =>
            prev.map((a) => (a.id === tempId ? { ...a, id: resultId } : a))
          );
        }

        // 3. Immediately re-validate to ensure 100% sync
        await revalidateHRISData();
        return resultId;
      } catch (err) {
        console.error('Error syncing check-in:', err);
        await revalidateHRISData();
        throw err;
      } finally {
        setIsSyncing(false);
      }
    },
    [revalidateHRISData]
  );

  // Unified Check-Out sync: Optimistic update -> Firestore persistence -> Immediate revalidation
  const syncCheckOut = useCallback(
    async (id: string | number, data: Partial<Attendance>) => {
      setIsSyncing(true);
      const nowIso = new Date().toISOString();

      // 1. Instant Optimistic Local State Update
      setAttendances((prev) =>
        prev.map((a) =>
          String(a.id) === String(id)
            ? {
                ...a,
                ...data,
                updatedAt: nowIso
              }
            : a
        )
      );

      try {
        // 2. Persist to Cloud Firestore
        await updateAttendance(String(id), data);

        // 3. Immediately re-validate to ensure 100% sync
        await revalidateHRISData();
      } catch (err) {
        console.error('Error syncing check-out:', err);
        await revalidateHRISData();
        throw err;
      } finally {
        setIsSyncing(false);
      }
    },
    [revalidateHRISData]
  );

  return {
    attendances,
    employees,
    setAttendances,
    setEmployees,
    revalidateHRISData,
    syncCheckIn,
    syncCheckOut,
    isSyncing
  };
}
