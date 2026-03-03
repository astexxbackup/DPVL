"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
// @ts-ignore
import { load } from "@cashfreepayments/cashfree-js";

const INDIAN_REGIONS: readonly string[] = [
  // States
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",

  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "", // Full Name
    lastName: "",
    fatherName: "",
    dob: "",
    age: "",
    height: "",
    leadingHand: "Right Hand",
    playingPosition: [] as string[],
    experience: "",
    leaguesPlayed: "",
    achievements: "",
    departmentRepresentation: "Not associated",
    departmentName: "",
    injuryHistory: "No major injury",
    injurySpecification: "",
    address: "",
    district: "",
    state: "",
    aadharNumber: "",
    aadharFront: null as File | null,
    aadharBack: null as File | null,
    photo: null as File | null,
    email: "",
    phone: "",
    whatsappNumber: "",
    basePriceAgreement: false,
    declarationAgreement: false,
    terms: false,
  });

  // OTP related states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccessMessage, setOtpSuccessMessage] = useState("");
  const [formSubmitMessage, setFormSubmitMessage] = useState("");
  const [isSubmitError, setIsSubmitError] = useState(false);
  const [otpToken, setOtpToken] = useState<string | null>(null); // JWT from verify
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [persistedOrderId, setPersistedOrderId] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "phone" ||
              name === "whatsappNumber" ||
              name === "aadharNumber"
            ? value
                .replace(/\D/g, "")
                .slice(0, name === "aadharNumber" ? 12 : 10)
            : value,
    }));

    // Reset OTP verification if email changes
    if (name === "email" && otpSent) {
      setOtpSent(false);
      setOtpVerified(false);
      setOtp("");
      setOtpError("");
      setOtpSuccessMessage("");
      setOtpToken(null);
    }

    // Clear form submit message when form is edited
    if (formSubmitMessage) {
      setFormSubmitMessage("");
    }
  };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, files } = e.target;
  //   if (files?.[0]) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       [name]: files[0],
  //     }));
  //   }
  // };


const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, files } = e.target;

  if (!files?.[0]) return;

  const file = files[0];

  // 🔴 1MB Validation
  if (file.size > 1 * 1024 * 1024) {
    alert("Image size must be under 1MB");
    e.target.value = ""; // reset input
    return;
  }

  setFormData((prev) => ({
    ...prev,
    [name]: file,
  }));
};



  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const positions = [...prev.playingPosition];
      if (checked) {
        positions.push(value);
      } else {
        const index = positions.indexOf(value);
        if (index > -1) positions.splice(index, 1);
      }
      return { ...prev, playingPosition: positions };
    });
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    if (otpError) setOtpError("");
  };

  // call backend to send OTP
  const sendOtp = async () => {
    if (!formData.email) {
      setOtpError("Please enter email address first");
      return;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setOtpError("Please enter a valid email address");
      return;
    }

    setIsSendingOtp(true);
    setOtpError("");
    setOtpSuccessMessage("");

    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to send OTP");
      }
      setOtpSent(true);
      setOtpSuccessMessage(data?.message || `OTP sent to ${formData.email}`);
      setTimeout(() => setOtpSuccessMessage(""), 5000);
    } catch (err: any) {
      setOtpError(err?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // call backend to verify OTP — receives token on success
  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError("");
    setOtpSuccessMessage("");

    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          otp: otp,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "OTP verification failed");
      }

      // server returns token
      const token = data?.token;
      if (!token) throw new Error("No token returned from server");
      setOtpToken(token);
      setOtpVerified(true);
      setOtpSuccessMessage("✓ Email verified successfully!");
      setTimeout(() => setOtpSuccessMessage(""), 3000);
    } catch (err: any) {
      setOtpError(err?.message || "Verification failed. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const resendOtp = () => {
    setOtpError("");
    setOtpSuccessMessage("");
    sendOtp();
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!otpVerified || !otpToken) {
    setIsSubmitError(true);
    setFormSubmitMessage("Please verify your email before submitting");
    return;
  }

  if (!formData.aadharFront || !formData.aadharBack || !formData.photo) {
    setIsSubmitError(true);
    setFormSubmitMessage("Please upload all required documents");
    return;
  }

  if (!formData.basePriceAgreement || !formData.declarationAgreement) {
    setIsSubmitError(true);
    setFormSubmitMessage("Please accept all declarations");
    return;
  }

  try {
    setIsProcessingPayment(true);
    setIsSubmitError(false);
    setFormSubmitMessage("Saving registration...");

    // 🔹 STEP 1 — REGISTER FIRST
    const fd = new FormData();
    fd.append("token", otpToken);
    fd.append("email", formData.email.trim().toLowerCase());
    fd.append("firstName", formData.firstName);
    fd.append("lastName", formData.lastName);
    fd.append("fatherName", formData.fatherName);
    fd.append("dob", formData.dob);
    fd.append("age", formData.age);
    fd.append("height", formData.height);
    fd.append("leadingHand", formData.leadingHand);
    formData.playingPosition.forEach((p) =>
      fd.append("playingPosition", p)
    );
    fd.append("experience", formData.experience);
    fd.append("leaguesPlayed", formData.leaguesPlayed);
    fd.append("achievements", formData.achievements);
    fd.append(
      "departmentRepresentation",
      formData.departmentRepresentation
    );
    fd.append("departmentName", formData.departmentName);
    fd.append("injuryHistory", formData.injuryHistory);
    fd.append("injurySpecification", formData.injurySpecification);
    fd.append("address", formData.address);
    fd.append("district", formData.district);
    fd.append("state", formData.state);
    fd.append("aadharNumber", formData.aadharNumber);
    fd.append("aadharFront", formData.aadharFront);
    fd.append("aadharBack", formData.aadharBack);
    fd.append("photo", formData.photo);
    fd.append("phone", formData.phone);
    fd.append("whatsappNumber", formData.whatsappNumber);
    fd.append("basePriceAgreement", String(formData.basePriceAgreement));
    fd.append("declarationAgreement", String(formData.declarationAgreement));

    const regRes = await fetch("/api/register", {
      method: "POST",
      body: fd,
    });

    const regData = await regRes.json();

    if (!regRes.ok) {
      throw new Error(regData.error || "Registration failed");
    }

    const candidateId = regData.candidateId;

    if (!candidateId) {
      throw new Error("Registration ID missing");
    }

    // 🔹 STEP 2 — CREATE ORDER USING candidateId
    setFormSubmitMessage("Initializing payment...");

    const orderRes = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId }),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      throw new Error(orderData.error || "Payment initialization failed");
    }

    // 🔹 STEP 3 — OPEN CASHFREE
    const cashfree = await load({
      mode:
        process.env.NEXT_PUBLIC_CASHFREE_ENV === "PRODUCTION"
          ? "production"
          : "sandbox",
    });

    if (!cashfree) {
      throw new Error("Cashfree SDK failed to load");
    }

    setFormSubmitMessage("Opening payment window...");

   const result = await cashfree.checkout({
  paymentSessionId: orderData.payment_session_id,
  redirectTarget: "_modal",
});

if (result?.paymentDetails) {
  // ✅ CALL VERIFY API AFTER SUCCESS
  await fetch("/api/payment/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: orderData.order_id,
    }),
  });

  setIsPaid(true);
  setIsSubmitError(false);
  setFormSubmitMessage("Payment successful! Registration completed.");

  setShowSuccessModal(true);
  resetForm();
}

    setIsSubmitError(false);
    setFormSubmitMessage(
      "Payment completed. Your application is being processed."
    );

    setShowSuccessModal(true);
    resetForm();
    setIsProcessingPayment(false);

  } catch (err: any) {
    console.error("Submit error:", err);
    setIsSubmitError(true);
    setFormSubmitMessage(
      err?.message || "Something went wrong. Please try again."
    );
    setIsProcessingPayment(false);
  }
};

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      fatherName: "",
      dob: "",
      age: "",
      height: "",
      leadingHand: "Right Hand",
      playingPosition: [],
      experience: "",
      leaguesPlayed: "",
      achievements: "",
      departmentRepresentation: "Not associated",
      departmentName: "",
      injuryHistory: "No major injury",
      injurySpecification: "",
      address: "",
      district: "",
      state: "",
      aadharNumber: "",
      aadharFront: null,
      aadharBack: null,
      photo: null,
      email: "",
      phone: "",
      whatsappNumber: "",
      basePriceAgreement: false,
      declarationAgreement: false,
      terms: false,
    });
    setOtpSent(false);
    setOtp("");
    setOtpVerified(false);
    setOtpToken(null);
    setIsPaid(false);
    setPaymentError("");
    setPersistedOrderId("");
    setTimeout(() => setFormSubmitMessage(""), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-3 md:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-3xl md:text-6xl font-norch uppercase text-[#3B3BB7] mb-2 tracking-wide text-center">
            Delhi Pro Volleyball League (DPVL) 2026 – Men’s Player Registration Form
          </h2>
          <div className="md:w-60 w-20 h-1 bg-[#D159A3]" />
          <p className="text-gray-600 mt-4 text-center max-w-2xl text-sm md:text-base">
            This registration form is for Men’s players (Open Age category) for
            participation in the Delhi Pro Volleyball League (DPVL) 2026.
            Submission of this form does not guarantee selection.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-6 md:p-10">
          <h2 className="text-2xl font-bold text-[#3B3BB7] mb-8 border-b pb-4">
            Registration Form
          </h2>

          {/* Form Submission Message */}
          {/* {formSubmitMessage && (
            <div
              className={`mb-6 p-4 rounded-xl ${
                formSubmitMessage.includes("Please verify") ||
                formSubmitMessage.includes("failed")
                  ? "bg-red-50 border border-red-200 text-red-800"
                  : "bg-green-50 border border-green-200 text-green-800"
              }`}
            >
              <p className="text-sm font-medium">{formSubmitMessage}</p>
            </div>
          )} */}

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Section 1: Player Basic Details */}
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-[#3B3BB7] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  1
                </span>
                Player Basic Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Full Name of Player (As per Aadhar Card) *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Enter full name"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#3b3bb7] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Date of Birth (DOB) *
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#3b3bb7] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Age *
                  </label>
                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    placeholder="Enter current age"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#3b3bb7] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Physical, Playing & Experience Details */}
    <section className="space-y-6">
  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
    <span className="bg-[#3B3BB7] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
      2
    </span>
    Physical, Playing & Experience Details
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        Player Height (in cm) *
      </label>
      <input
        type="number"
        name="height"
        value={formData.height}
        onChange={handleChange}
        required
        placeholder="Example: 185"
        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#3b3bb7] focus:outline-none transition-colors"
      />
    </div>
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        Leading Hand *
      </label>
      <select
        name="leadingHand"
        value={formData.leadingHand}
        onChange={handleChange}
        required
        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#3b3bb7] focus:outline-none transition-colors"
      >
        <option value="Right Hand">Right Hand</option>
        <option value="Left Hand">Left Hand</option>
      </select>
    </div>
    <div className="md:col-span-2">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Playing Position *
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          "Setter",
          "Outside Hitter",
          "Opposite",
          "Middle Blocker",
          "Libero",
        ].map((pos) => (
          <label
            key={pos}
            className="flex items-center gap-2 p-3 border-2 border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <input
              type="checkbox"
              value={pos}
              checked={formData.playingPosition.includes(pos)}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-[#3B3BB7] rounded focus:ring-0"
            />
            <span className="text-sm font-medium text-gray-700">
              {pos}
            </span>
          </label>
        ))}
      </div>
    </div>
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        Total Playing Experience (in Years) *
      </label>
      <input
        type="text"
        name="experience"
        value={formData.experience}
        onChange={handleChange}
        required
        placeholder="Example: 5 Years"
        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#3b3bb7] focus:outline-none transition-colors"
      />
    </div>
    <div className="md:col-span-2">
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        Leagues / Tournaments Played (if any)
      </label>
      <textarea
        name="leaguesPlayed"
        value={formData.leaguesPlayed}
        onChange={(e: any) =>
          setFormData((p) => ({
            ...p,
            leaguesPlayed: e.target.value,
          }))
        }
        placeholder="List major leagues or tournaments"
        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#3b3bb7] focus:outline-none transition-colors h-24"
      />
    </div>
    <div className="md:col-span-2">
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        Achievements (Mention with Year)
      </label>
      <textarea
        name="achievements"
        value={formData.achievements}
        onChange={(e: any) =>
          setFormData((p) => ({
            ...p,
            achievements: e.target.value,
          }))
        }
        placeholder="List your achievements"
        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#3b3bb7] focus:outline-none transition-colors h-24"
      />
    </div>
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        Department Representation *
      </label>
      <select
        name="departmentRepresentation"
        value={formData.departmentRepresentation}
        onChange={handleChange}
        required
        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#3b3bb7] focus:outline-none transition-colors"
      >
        <option value="Not associated">
          Not associated with any department
        </option>
        <option value="Yes, currently playing">
          Yes, currently playing for a department
        </option>
      </select>
      {formData.departmentRepresentation === "Yes, currently playing" && (
        <p className="mt-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
          <span className="font-semibold">NOTE:</span> Players associated with departments may be required to submit NOC at a later stage, if selected.
        </p>
      )}
    </div>
    {formData.departmentRepresentation ===
      "Yes, currently playing" && (
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Department Name *
        </label>
        <input
          type="text"
          name="departmentName"
          value={formData.departmentName}
          onChange={handleChange}
          required
          placeholder="Example: Indian Railways / Services / ONGC / BPCL / Police / Army / PSU etc."
          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#3b3bb7] focus:outline-none transition-colors"
        />
      </div>
    )}
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        Injury History *
      </label>
      <select
        name="injuryHistory"
        value={formData.injuryHistory}
        onChange={handleChange}
        required
        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#3b3bb7] focus:outline-none transition-colors"
      >
        <option value="No major injury">
          No major injury till date
        </option>
        <option value="Had injury earlier">
          Had injury earlier (fully recovered)
        </option>
        <option value="Currently injured">Currently injured</option>
      </select>
    </div>
    {formData.injuryHistory !== "No major injury" && (
      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Specify Injury Details (Type, Year, Recovery Status) *
        </label>
        <textarea
          name="injurySpecification"
          value={formData.injurySpecification}
          onChange={(e: any) =>
            setFormData((p) => ({
              ...p,
              injurySpecification: e.target.value,
            }))
          }
          required
          placeholder="Enter injury details..."
          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#3b3bb7] focus:outline-none transition-colors h-24"
        />
        <p className="mt-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
          <span className="font-semibold">NOTE:</span> Disclosure of injury history will not automatically disqualify a player. This information is required for medical assessment and player safety.
        </p>
      </div>
    )}
  </div>
</section>

            {/* Section 3: Address Details */}
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-[#3B3BB7] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  3
                </span>
                Address Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Complete Residential Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={(e: any) =>
                      setFormData((p) => ({ ...p, address: e.target.value }))
                    }
                    required
                    placeholder="Enter full address"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#3b3bb7] focus:outline-none transition-colors h-20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    State *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#3b3bb7] focus:outline-none transition-colors"
                  >
                    <option value="" disabled>
                      Choose your state
                    </option>
                    {INDIAN_REGIONS.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    placeholder="Enter district"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#3b3bb7] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* Section 4: Identity Verification */}
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-[#3B3BB7] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  4
                </span>
                Identity Verification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Aadhar Card Number *
                  </label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={(e) => {
                      const val = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 12);
                      setFormData((p) => ({ ...p, aadharNumber: val }));
                    }}
                    required
                    placeholder="12 digit aadhar number"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#3b3bb7] focus:outline-none transition-colors"
                  />
                </div>

                {/* File Uploads */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Aadhar Card - Front Side * ( max image size 1 MB)
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                    <input
                      type="file"
                      name="aadharFront"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      className="hidden"
                      id="aadharFrontUpload"
                    />
                    <label
                      htmlFor="aadharFrontUpload"
                      className="cursor-pointer text-[#3b3bb7] font-semibold text-sm"
                    >
                      {formData.aadharFront
                        ? "Change File"
                        : "Click to Upload Front"}
                    </label>
                    {formData.aadharFront && (
                      <p className="text-xs text-green-600 mt-2 line-clamp-1">
                        ✓ {formData.aadharFront.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Aadhar Card - Back Side * ( max image size 1 MB)
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                    <input
                      type="file"
                      name="aadharBack"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      className="hidden"
                      id="aadharBackUpload"
                    />
                    <label
                      htmlFor="aadharBackUpload"
                      className="cursor-pointer text-[#3b3bb7] font-semibold text-sm"
                    >
                      {formData.aadharBack
                        ? "Change File"
                        : "Click to Upload Back"}
                    </label>
                    {formData.aadharBack && (
                      <p className="text-xs text-green-600 mt-2 line-clamp-1">
                        ✓ {formData.aadharBack.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Recent Passport Size Photograph * ( max image size 1 MB)
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      className="hidden"
                      id="photoUpload"
                    />
                    <label
                      htmlFor="photoUpload"
                      className="cursor-pointer text-[#3b3bb7] font-semibold"
                    >
                      {formData.photo
                        ? "Change Photo"
                        : "Upload Passport Size Photo"}
                    </label>
                    {formData.photo && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {formData.photo.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-lg p-3">
  <p className="text-xs md:text-sm text-red-700 font-semibold leading-relaxed">
    महत्वपूर्ण सूचना: प्रत्येक अपलोड की जाने वाली फोटो/दस्तावेज़ की साइज 1 MB से कम होना अनिवार्य है। 
    अधिक साइज होने पर फॉर्म सबमिट नहीं होगा।
  </p>
</div>
              </div>
            </section>

            {/* Section 5: Contact Information */}
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-[#3B3BB7] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  5
                </span>
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Mobile Number (Calling) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="10 digit number"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#3b3bb7] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={(e) => {
                      const val = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setFormData((p) => ({ ...p, whatsappNumber: val }));
                    }}
                    required
                    placeholder="10 digit number"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#3b3bb7] focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-semibold text-gray-700">
                      Email ID *
                    </label>
                    {otpVerified && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={otpVerified}
                      placeholder="Enter active email address"
                      className={`w-full sm:flex-1 px-4 py-2.5 border-2 rounded-lg focus:border-[#3b3bb7] focus:outline-none ${
                        otpVerified
                          ? "bg-gray-50 border-gray-300"
                          : "border-gray-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={!formData.email || otpVerified || isSendingOtp}
                      className={`w-full sm:w-auto px-4 py-2.5 rounded-lg font-bold transition-all ${
                        !formData.email || otpVerified
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-[#3B3BB7] text-white hover:bg-[#2a2a8a]"
                      }`}
                    >
                      {isSendingOtp
                        ? "Sending..."
                        : otpVerified
                          ? "Verified"
                          : "Verify Email"}
                    </button>
                  </div>
                  {otpSent && !otpVerified && (
                    <div className="mt-4 p-4 bg-indigo-50/50 border-2 border-indigo-100 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-gray-900">
                          Enter Verification Code
                        </label>
                        <button
                          type="button"
                          onClick={resendOtp}
                          className="text-xs text-[#3B3BB7] font-bold hover:underline"
                        >
                          Resend Code
                        </button>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={otp}
                          onChange={handleOtpChange}
                          placeholder="6-digit OTP"
                          className="w-full sm:flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#3b3bb7] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={verifyOtp}
                          disabled={isVerifyingOtp || otp.length !== 6}
                          className="w-full sm:w-auto px-4 py-2.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
                        >
                          {isVerifyingOtp ? "..." : "Verify"}
                        </button>
                      </div>
                      {otpError && (
                        <p className="text-xs text-red-600 font-medium">
                          {otpError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Section 6: Declaration & Consent */}
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-[#3B3BB7] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  6
                </span>
                Declaration & Consent
              </h3>
              <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 border-2 border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.basePriceAgreement}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        basePriceAgreement: e.target.checked,
                      }))
                    }
                    className="mt-1 w-5 h-5 text-[#3B3BB7] rounded focus:ring-0"
                  />
                  <span className="text-sm text-gray-700">
                    <strong>I agree to participate in DPVL</strong> and accept
                    the base price structure decided by DPVL for the auction.
                  </span>
                </label>
                <label className="flex items-start gap-3 p-4 border-2 border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.declarationAgreement}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        declarationAgreement: e.target.checked,
                      }))
                    }
                    className="mt-1 w-5 h-5 text-[#3B3BB7] rounded focus:ring-0"
                  />
                  <span className="text-sm text-gray-700">
                    <strong>Player Declaration:</strong> I confirm that all
                    details provided above are true and correct. Any false
                    information may lead to disqualification from DPVL.
                  </span>
                </label>
                <label className="flex items-start gap-3 p-4 border-2 border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.terms}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, terms: e.target.checked }))
                    }
                    className="mt-1 w-5 h-5 text-[#3B3BB7] rounded focus:ring-0"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{" "}
                    <Link
                     target="_blank"
                      href="/terms-and-condition"
                      className="text-[#3B3BB7] font-bold hover:underline"
                    >
                      Terms and Conditions
                    </Link>
                  </span>
                </label>
              </div>
            </section>

            {/* Payment Section */}
            <div className="border-t pt-10">
              <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border-2 border-gray-100">
                {!isPaid ? (
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">
                        Registration Fee
                      </h4>
                      <p className="text-sm text-gray-500">
                        Non-refundable application processing fee
                      </p>
                    </div>
                    <div className="text-3xl font-black text-[#3B3BB7]">
                      ₹499
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3 text-green-600">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-xl font-bold">
                      Payment Received Successfully
                    </span>
                  </div>
                )}

                <div className="mt-8 space-y-4">
                  {paymentError && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg text-center border border-red-100 italic">
                      {paymentError}
                    </div>
                  )}

                  <label className="flex items-start bg-red-50 border border-red-200 text-red-800 gap-3 p-4 rounded-xl transition-colors">
                    {/* <input
                      type="checkbox"
                      checked={formData.terms}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          terms: e.target.checked,
                        }))
                      }
                      className="mt-1 w-5 h-5 text-[#3B3BB7] rounded focus:ring-0"
                    /> */}
                    <span className="text-sm text-center">
                    भुगतान होने के बाद कृपया वापस इसी स्क्रीन पर आएं और
                    कन्फर्मेशन मैसेज एवं ईमेल प्राप्त होने तक प्रतीक्षा करें।
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={
                      !otpVerified ||
                      !formData.terms ||
                      !formData.basePriceAgreement ||
                      !formData.declarationAgreement ||
                      isProcessingPayment
                    }
                    className={`w-full py-4 px-2 md:px-0 rounded-xl font-black text-sm md:text-lg transition-all shadow-lg active:scale-[0.98] ${
                      otpVerified &&
                      formData.terms &&
                      formData.basePriceAgreement &&
                      formData.declarationAgreement &&
                      !isProcessingPayment
                        ? "bg-[#3B3BB7] text-white hover:bg-indigo-800 shadow-indigo-200"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isProcessingPayment
                      ? isPaid
                        ? "Completing Registration..."
                        : "Processing Payment..."
                      : isPaid
                        ? "Submit Application"
                        : "Pay ₹499 & Complete Registration"}
                  </button>

                  {!otpVerified && (
                    <p className="text-sm text-center font-medium text-indigo-600 bg-indigo-50 p-2 rounded-lg">
                      Please verify your email address to enable payment
                    </p>
                  )}
                </div>
              </div>

              {/* Form Submission Message */}
              {formSubmitMessage && (
                <div
                  className={`mt-6 p-4 rounded-xl ${
                    isSubmitError
                      ? "bg-red-50 border border-red-200 text-red-800"
                      : "bg-green-50 border border-green-200 text-green-800"
                  }`}
                >
                  <p className="text-sm font-semibold">{formSubmitMessage}</p>
                </div>
              )}

              <div className="mt-8 text-center bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                <p className="text-[11px] md:text-xs text-yellow-800 leading-relaxed font-bold uppercase tracking-tight">
                  नोट: आधार कार्ड की फोटो साफ अपलोड करें। गलत जानकारी देने पर
                  आपका पंजीकरण रद्द किया जा सकता है।
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 max-w-sm w-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tighter">
              Registration Successfull
            </h3>
            <p className="text-gray-600 mb-8 text-sm leading-relaxed">
              Thank you for registering for the Delhi Pro Volleyball League. Our verification team will carefully review your profile and submitted details. Once the review process is completed, you will be notified via email regarding approval or rejection.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-4 bg-[#3B3BB7] text-white font-black rounded-2xl hover:bg-indigo-800 transition-all shadow-lg active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
