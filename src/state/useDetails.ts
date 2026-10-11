import { useEffect, useRef, useState } from "react";
import type { Details, PatientTheme, Repository, TextSize } from "../storage/repository";

const detailsMatch = (a: Details, b: Details) =>
  (Object.keys(a) as Array<keyof Details>).every((field) => a[field] === b[field]);

const initialsOf = (name: string, fallback: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || fallback;

// Who the patient and carer are, the consent record and every setting. Each
// field is its own piece of state with its own setter, and `details` is the
// record of all of them as they stand.
export function useDetails({
  initial,
  onSaveFailed,
  repository,
}: {
  initial: Details;
  onSaveFailed: () => void;
  repository: Repository;
}) {
  const [patientName, setPatientName] = useState(initial.patientName);
  const [patientAge, setPatientAge] = useState(initial.patientAge);
  const [disabilities, setDisabilities] = useState(initial.disabilities);
  const [medicalNeeds, setMedicalNeeds] = useState(initial.medicalNeeds);
  const [carerName, setCarerName] = useState(initial.carerName);
  const [carerPhone, setCarerPhone] = useState(initial.carerPhone);
  const [carerEmail, setCarerEmail] = useState(initial.carerEmail);
  const [carerRelationship, setCarerRelationship] = useState(initial.carerRelationship);
  const [carerAvailability, setCarerAvailability] = useState(initial.carerAvailability);
  const [consentGiven, setConsentGiven] = useState(initial.consentGiven);
  const [consentMethod, setConsentMethod] = useState(initial.consentMethod);
  const [consentDate, setConsentDate] = useState(initial.consentDate);
  const [allowMedicineChanges, setAllowMedicineChanges] = useState(initial.allowMedicineChanges);
  const [readAloud, setReadAloud] = useState(initial.readAloud);
  const [patientTheme, setPatientTheme] = useState<PatientTheme>(initial.patientTheme);
  const [textSize, setTextSize] = useState<TextSize>(initial.textSize);
  const [colourSafe, setColourSafe] = useState(initial.colourSafe);
  const [reducedMotion, setReducedMotion] = useState(initial.reducedMotion);
  const [simplifiedLayout, setSimplifiedLayout] = useState(initial.simplifiedLayout);
  // Whether the carer's own details are open for editing. Not kept.
  const [editingCarer, setEditingCarer] = useState(false);

  // The details are many small fields edited in place, so they are stored as
  // one record whenever any of them differs from what was last stored.
  const details: Details = {
    patientName,
    patientAge,
    disabilities,
    medicalNeeds,
    carerName,
    carerPhone,
    carerEmail,
    carerRelationship,
    carerAvailability,
    consentGiven,
    consentMethod,
    consentDate,
    allowMedicineChanges,
    readAloud,
    patientTheme,
    textSize,
    colourSafe,
    reducedMotion,
    simplifiedLayout,
    // Only changed by loading or clearing the example, which replaces everything.
    exampleData: initial.exampleData,
  };
  const storedDetails = useRef(initial);
  useEffect(() => {
    if (detailsMatch(storedDetails.current, details)) return;
    storedDetails.current = details;
    // A write that fails must not pass silently, because the screen already
    // shows the change as made.
    repository.saveDetails(details).catch(onSaveFailed);
  });

  useEffect(() => {
    document.documentElement.toggleAttribute("data-reduced-motion", reducedMotion);
  }, [reducedMotion]);

  return {
    carerInitials: initialsOf(carerName, "C"),
    details,
    editingCarer,
    patientInitials: initialsOf(patientName, "P"),
    setAllowMedicineChanges,
    setCarerAvailability,
    setCarerEmail,
    setCarerName,
    setCarerPhone,
    setCarerRelationship,
    setColourSafe,
    setConsentDate,
    setConsentGiven,
    setConsentMethod,
    setDisabilities,
    setEditingCarer,
    setMedicalNeeds,
    setPatientAge,
    setPatientName,
    setPatientTheme,
    setReadAloud,
    setReducedMotion,
    setSimplifiedLayout,
    setTextSize,
  };
}
