import { useState } from "react";
import { isTimeOfDay, type TimeOfDay } from "../model/time";

// The add prescription dialog: whether it is open and what has been typed
// into it so far. Not kept, so a refresh clears it.
export function usePrescriptionDraft({
  addPrescription,
}: {
  addPrescription: (prescription: {
    form: string;
    imageUrl: string | undefined;
    strength: string;
    times: TimeOfDay[];
  }) => void;
}) {
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [newDosage, setNewDosage] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newTimes, setNewTimes] = useState([""]);
  const [medicineImage, setMedicineImage] = useState("");

  const prescriptionIsComplete =
    Boolean(newDosage) &&
    Boolean(newQuantity) &&
    newTimes.length > 0 &&
    newTimes.every(Boolean);

  const savePrescription = () => {
    const times = [...new Set(newTimes.filter(isTimeOfDay))];
    if (!newDosage || !newQuantity || times.length === 0) return;
    addPrescription({
      form: newQuantity,
      imageUrl: medicineImage || undefined,
      strength: newDosage,
      times,
    });
    setShowAddPrescription(false);
    setNewDosage("");
    setNewQuantity("");
    setNewTimes([""]);
    setMedicineImage("");
  };

  return {
    medicineImage,
    newDosage,
    newQuantity,
    newTimes,
    prescriptionIsComplete,
    savePrescription,
    setMedicineImage,
    setNewDosage,
    setNewQuantity,
    setNewTimes,
    setShowAddPrescription,
    showAddPrescription,
  };
}
