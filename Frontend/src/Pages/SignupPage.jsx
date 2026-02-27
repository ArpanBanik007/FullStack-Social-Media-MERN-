import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../componants/InputField";
import Button from "../componants/Button";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import axios from "axios";

export default function SignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    avatar: "",
    coverImage: "",
  });

  const [avatarPreview, setAvatarPreview] = useState(
    "https://www.svgrepo.com/show/452030/avatar-default.svg"
  );
  const [coverPreview, setCoverPreview] = useState(
    "https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // custom update function
  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // field update handler
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === "avatar") {
        setAvatarPreview(url);
        updateFormData("avatar", file);
      } else {
        setCoverPreview(url);
        updateFormData("coverImage", file);
      }
    }
  };

  const fileInputAvtarRef = useRef(null);
  const fileInputCoverRef = useRef(null);

  const handelAvatarClickImage = () => {
    fileInputAvtarRef.current.click();
  };
  const handelCoverClickImage = () => {
    fileInputCoverRef.current.click();
  };

  // submit handler
  const handelSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("username", formData.username);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("password", formData.password);

      if (formData.avatar) formDataToSend.append("avatar", formData.avatar);
      if (formData.coverImage)
        formDataToSend.append("coverImage", formData.coverImage);

      const res = await axios.post(
        "http://localhost:8000/api/v1/users/register",
        formDataToSend,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setSuccess(res.data.message || "Registration successful!");

      setTimeout(() => {
        navigate("/home");
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // step navigation
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-600">
      <div className="bg-white p-6 rounded-2xl shadow-md w-96">
        {error && (
          <p className="mb-4 text-center text-red-600 font-medium">{error}</p>
        )}
        {success && (
          <p className="mb-4 text-center text-green-600 font-medium">
            {success}
          </p>
        )}
        <form onSubmit={handelSubmit}>
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold mb-4 flex justify-center">
                Basic Details
              </h2>
              <InputField
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
              />

              <InputField
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />

              <InputField
                type="text"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
              />
              <PhoneInput
                country={"in"}
                value={formData.phone}
                onChange={(value) => updateFormData("phone", value)}
                enableSearch={true}
                containerClass="w-full mb-5"
                inputClass="!w-full !px-3 !py-2 !border !border-gray-600 
              !rounded-r-md !focus:outline-none !focus:ring 
              !focus:ring-indigo-200"
                buttonClass="!border !border-gray-600 !rounded-l-md"
                inputProps={{
                  name: "phone",
                  required: true,
                  type: "tel",
                  pattern: "[0-9]*",
                  placeholder: "Enter your phone number",
                }}
              />
              <Button type="button" text="Next" onClick={nextStep} />
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold mb-4">
                Step 2 : CoverImage & Profile Picture
              </h2>
              <div>
                <div className="flex flex-col items-center mb-6">
                  <img
                    src={coverPreview}
                    alt="cover"
                    width="250"
                    className="cursor-pointer rounded-md"
                    onClick={handelCoverClickImage}
                  />

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputCoverRef}
                    onChange={(e) => handleFileChange(e, "coverImage")}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <img
                    src={avatarPreview}
                    alt="avatar"
                    width="150"
                    className="cursor-pointer rounded-full"
                    onClick={handelAvatarClickImage}
                  />

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputAvtarRef}
                    onChange={(e) => handleFileChange(e, "avatar")}
                  />
                </div>
                <div className="flex gap-2 mt-8 h-12">
                  <Button onClick={prevStep} type="button" text="Back" />
                  <Button onClick={nextStep} type="button" text="Next" />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl font-semibold mb-4">Step 3: Password</h2>
              <InputField
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />

              <div className="flex justify-between gap-2">
                <Button type="button" text="Back" onClick={prevStep} />

                <Button
                  type="submit"
                  loading={loading}
                  text="SignUp"
                  disabled={loading}
                />
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
