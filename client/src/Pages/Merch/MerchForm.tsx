import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useState } from "react";

const MerchForm: React.FC<{ tshirt: string }> = (props) => {
  const [formData, setFormData] = useState({ Name: "", Email: "", Phone: "" });
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State for error message
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // State for success message

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEle = e.currentTarget;
    const formDatab = new FormData(formEle);

    fetch(
      "https://script.google.com/macros/s/AKfycbxpnH9_o5MUnjdeWIvV8IHXJi_lSvtP3GB4QLbI7MrL_Nxd5RIC7h4AuRjU_ciMwve2/exec",
      {
        method: "POST",
        body: formDatab,
      }
    )
      .then((res) => {
        return res.json()
  })
      .then((data) => {
        console.log(data);
        setSuccessMessage("Your order has been successfully submitted!"); 
        setFormData({ Name: "", Email: "", Phone: "" });
        setSelectedSize(""); 
        setQuantity(1);        setErrorMessage(null);
      })
      .catch((error) => {
        console.log(error);
        setErrorMessage("There was an error submitting your order. Please try again."); // Set error message
        setSuccessMessage(null); 
      });
  };

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  return (
    <div className="w-full max-w-[90%] mx-auto p-6 shadow-2xl border-2 border-emerald-100/50 rounded-[2rem] bg-gradient-to-br from-white to-emerald-50/30">
      <h2 className="text-3xl font-bold text-primary-green mb-6">Complete Your Order</h2>
      <form onSubmit={handleSubmit}>
        {/* Name Input */}
        <div className="space-y-4 mb-6">
          <Label className="text-lg font-semibold text-gray-900">Your Name</Label>
          <input
            name="Name"
            type="text"
            value={formData.Name}
            onChange={handleChange}
            placeholder="Enter your name"
            className="w-full h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-300"
          />
        </div>

        {/* Email Input */}
        <div className="space-y-4 mb-6">
          <Label className="text-lg font-semibold text-gray-900">Your Email</Label>
          <input
            name="Email"
            type="email"
            value={formData.Email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-300"
          />
        </div>


        <div className="space-y-4 mb-6">
        <Label className="text-lg font-semibold text-gray-900">Your Phone</Label>
        <input
            name="Phone"
            type="text"
            value={formData.Phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            pattern="^\d{10}$"  // Pattern for 10 digits
            title="Phone number must be exactly 10 digits"
            className="w-full h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-300"
            required
        />
        </div>


        {/* Size Selector */}
        <div className="space-y-4 mb-6">
          <Label className="text-lg font-semibold text-gray-900">Select Size 🌐</Label>
          <Select value={selectedSize} onValueChange={setSelectedSize}>
            <SelectTrigger className="w-full h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-300">
              <SelectValue placeholder="Choose your size" />
            </SelectTrigger>
            <SelectContent>
              {sizeOptions.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <input name="Size" type="text" value={selectedSize} hidden />

        {/* Quantity Selector */}
        <div className="space-y-4 mb-6">
          <Label className="text-lg font-semibold text-gray-900">Quantity 📦</Label>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="lg"
              className="h-12 w-4 rounded-xl text-xl"
              onClick={(e) => {
                e.preventDefault();
                setQuantity(Math.max(1, quantity - 1));
              }}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
              className="h-12 w-14 text-center text-lg font-medium border-2 border-gray-200 rounded-xl focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            />
            <Button
              variant="outline"
              size="lg"
              className="h-12 w-4 rounded-xl text-xl"
              onClick={(e) => {
                e.preventDefault();
                setQuantity(quantity + 1);
              }}
            >
              +
            </Button>
          </div>
        </div>
        <input name="Quantity" type="text" value={quantity} hidden />
        <input name="Tshirt" type="text" value={props.tshirt} hidden />

        {/* Error and Success Messages */}
        {errorMessage && (
          <div className="mb-4 text-red-600 bg-red-100 p-2 rounded-lg">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 text-green-600 bg-green-100 p-2 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-14 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        >
          Submit Order
        </Button>
      </form>
    </div>
  );
};

export default MerchForm;
