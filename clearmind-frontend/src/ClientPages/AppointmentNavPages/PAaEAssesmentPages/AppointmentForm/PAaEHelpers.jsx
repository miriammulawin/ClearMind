export function buildPaymentProps(
  form,
  setForm,
  config,
  consultationFee,
  bookingPolicyAgreed = false,
  onOpenBookingPolicy = () => {},
) {
  const doctorData = form.selectedRpm || { name: form.rpm || "—" };
  const modeMap = { Virtual: "ONLINE", Onsite: "IN-PERSON", Both: "IN-PERSON" };
  const consultationMode = modeMap[form.mode] || "IN-PERSON";

  const profileData = {
    isInformant: form.isInformant || false,
    complainantName: form.complainantName || "",
    complainantRelation: form.complainantRelation || "",
    firstName: form.firstName || "",
    middleName: form.middleName || "",
    lastName: form.lastName || "",
    dateOfBirth: form.dateOfBirth || "",
    age: form.age || "",
    sex: form.sex || "",
    contactNo: form.contactNo || "",
    email: form.email || "",
    address: form.address || "",
    patientType: form.patientType || "",
    classification: form.classification || "",
    reason: form.reason || "",
    employerName: form.employerName || "",
    company: form.company || "",
    assessmentPurpose: form.assessmentPurpose || "",
    travelType: form.travelType || "",
    hasDiagnosis: form.hasDiagnosis,
    diagnosisFile: form.diagnosisFile || "",
    schoolName: form.schoolName || "",
    program: form.program || "",
    extraField: config?.extraField || "",
  };

  const paymentData = {
    paymentMode: form.payMethod || "G-Cash",
    referenceNo: form.referenceNo || "",
    receiptFile: form.proofFile || null,
  };

  const setPaymentData = (updater) => {
    setForm((prev) => {
      const current = {
        paymentMode: prev.payMethod || "G-Cash",
        referenceNo: prev.referenceNo || "",
        receiptFile: prev.proofFile || null,
      };
      const next = typeof updater === "function" ? updater(current) : updater;
      return {
        ...prev,
        payMethod: next.paymentMode ?? prev.payMethod,
        referenceNo: next.referenceNo ?? prev.referenceNo,
        proofFile: next.receiptFile ?? prev.proofFile,
      };
    });
  };

  return {
    doctorData,
    consultationMode,
    consultationFee,
    profileData,
    paymentData,
    setPaymentData,
    bookingPolicyAgreed,
    hideDatetime: true,
    onOpenBookingPolicy,
  };
}
