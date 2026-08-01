import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface FormFields {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormFields>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const tempErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) tempErrors.name = "Name is required.";
    if (!formData.message.trim()) tempErrors.message = "Message is required.";
    if (!formData.email.trim()) {
      tempErrors.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = "Please enter a valid email address format.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const response = await api.post("/api/contact", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        message: formData.message.trim(),
      });

      if (response.data.success) {
        toast.success(response.data.message || "Message sent successfully!");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        throw new Error(response.data.message || "Server processing error.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Contact form submission error:", err);
      const serverMsg =
        err.response?.data?.message ||
        "Something went wrong, please try again.";
      toast.error(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/60 shadow-xl shadow-[#2d4029]/5"
    >
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm font-semibold text-[#2d4029]">
          Name
        </Label>
        <Input
          id="name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleInputChange}
          className={`rounded-xl border-gray-200 focus-visible:ring-[#4c6a46] bg-[#faf8f4]/30 h-11 ${errors.name ? "border-red-400 focus-visible:ring-red-400" : ""}`}
        />
        {errors.name && (
          <p className="text-xs font-medium text-red-500 mt-1">{errors.name}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-semibold text-[#2d4029]">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleInputChange}
          className={`rounded-xl border-gray-200 focus-visible:ring-[#4c6a46] bg-[#faf8f4]/30 h-11 ${errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}`}
        />
        {errors.email && (
          <p className="text-xs font-medium text-red-500 mt-1">
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone" className="text-sm font-semibold text-[#2d4029]">
          Phone Number{" "}
          <span className="text-xs text-gray-400 font-normal">(Optional)</span>
        </Label>
        <Input
          id="phone"
          placeholder="e.g., 09123456789"
          value={formData.phone}
          onChange={handleInputChange}
          className="rounded-xl border-gray-200 focus-visible:ring-[#4c6a46] bg-[#faf8f4]/30 h-11"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="message"
          className="text-sm font-semibold text-[#2d4029]"
        >
          Message
        </Label>
        <Textarea
          id="message"
          rows={5}
          placeholder="How can we help you? Share your inquiries..."
          value={formData.message}
          onChange={handleInputChange}
          className={`rounded-xl border-gray-200 focus-visible:ring-[#4c6a46] bg-[#faf8f4]/30 resize-none ${errors.message ? "border-red-400 focus-visible:ring-red-400" : ""}`}
        />
        {errors.message && (
          <p className="text-xs font-medium text-red-500 mt-1">
            {errors.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 bg-[#4c6a46] hover:bg-[#3d5538] text-white font-semibold rounded-xl tracking-wide shadow-md transition-all duration-200 focus-visible:ring-[#4c6a46]"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sending...</span>
          </span>
        ) : (
          <span>Submit Button</span>
        )}
      </Button>
    </form>
  );
}
