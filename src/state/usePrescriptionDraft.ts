import { useState } from "react";
import { isTimeOfDay } from "../model/time";
import type { NewPrescription } from "./useRoutine";

// The add prescription dialog: whether it is open and what has been typed
// into it so far. Not kept, so a refresh clears it.
export function usePrescriptionDraft({
  addPrescription,
}: {
  addPrescription: (prescription: NewPrescription) => void;
}) {
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPurpose, setNewPurpose] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newTimes, setNewTimes] = useState([""]);
  const [medicineImage, setMedicineImage] = useState("");

  const savePrescription = () => {
    const times = [...new Set(newTimes.filter(isTimeOfDay))];
    if (!newName.trim() || !newDosage.trim() || !newQuantity.trim() || times.length === 0) return;
    addPrescription({
      form: newQuantity.trim(),
      imageUrl: medicineImage || undefined,
      name: newName.trim(),
      note: newNote.trim(),
      purpose: newPurpose.trim(),
      strength: newDosage.trim(),
      times,
    });
    setShowAddPrescription(false);
    setNewName("");
    setNewPurpose("");
    setNewNote("");
    setNewDosage("");
    setNewQuantity("");
    setNewTimes([""]);
    setMedicineImage("");
  };

  return {
    medicineImage,
    newDosage,
    newName,
    newNote,
    newPurpose,
    newQuantity,
    newTimes,
    savePrescription,
    setMedicineImage,
    setNewDosage,
    setNewName,
    setNewNote,
    setNewPurpose,
    setNewQuantity,
    setNewTimes,
    setShowAddPrescription,
    showAddPrescription,
  };
}

export type PrescriptionDraft = ReturnType<typeof usePrescriptionDraft>;
