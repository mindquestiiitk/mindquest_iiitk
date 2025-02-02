import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface MerchFormProps {
  tshirt: string;
  updateCartData: (newItem: { name: string; qty: number; size: string }) => void;
}

const MerchForm1: React.FC<MerchFormProps> = ({ tshirt, updateCartData }) => {
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSize) return alert("Please select a size");

    updateCartData({ name: tshirt, qty: quantity, size: selectedSize });

    alert("Item added to cart!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-md">
      {/* T-Shirt Name */}
      <h2 className="text-lg font-semibold">{tshirt}</h2>
      
      {/* Size Selector */}
      <label className="block text-sm font-medium">Select Size:</label>
      <Select value={selectedSize} onValueChange={setSelectedSize}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose size" />
        </SelectTrigger>
        <SelectContent>
          {["S", "M", "L", "XL"].map(size => (
            <SelectItem key={size} value={size}>{size}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Quantity Selector */}
      <label className="block text-sm font-medium">Quantity:</label>
      <input 
        type="number" 
        value={quantity} 
        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
        className="w-full p-2 border rounded-md"
        min={1}
      />
      
      {/* Submit Button */}
      <Button type="submit" className="w-full">Add to Cart</Button>
    </form>
  );
};

export default MerchForm1;
