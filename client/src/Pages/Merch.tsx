import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"

interface TShirt {
  id: number
  name: string
  image: string
  price: number
}

const tshirts: TShirt[] = [
  { id: 1, name: "Classic Green Tee", image: "https://via.placeholder.com/300x400", price: 29.99 },
  { id: 2, name: "Eco Warrior", image: "https://via.placeholder.com/300x400", price: 34.99 },
  { id: 3, name: "Nature Lover", image: "https://via.placeholder.com/300x400", price: 32.99 },
  { id: 4, name: "Green Mind", image: "https://via.placeholder.com/300x400", price: 31.99 },
]

export const Merch: React.FC = () => {
  const [selectedShirt, setSelectedShirt] = useState<TShirt | null>(null)

  return (
    <div className="min-h-screen bg-[#D4F3D9] text-card-overlay-background">
      <header className="py-6 px-4 bg-card-overlay-background text-[#D4F3D9]">
        <h1 className="text-4xl font-bold text-center">Unlock Your Mind Merch</h1>
      </header>
      <main className="container mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12"
        >
          <div className="flex justify-center items-center">
            <motion.img
              src={selectedShirt?.image || tshirts[0].image}
              alt={selectedShirt?.name || "T-Shirt"}
              className="w-full max-w-md rounded-lg shadow-xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6">Choose Your Style</h2>
            <div className="grid grid-cols-2 gap-4">
              {tshirts.map((shirt) => (
                <motion.div
                  key={shirt.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${selectedShirt?.id === shirt.id ? "bg-card-overlay-background text-[#D4F3D9]" : "bg-white"
                    }`}
                  onClick={() => setSelectedShirt(shirt)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img src={shirt.image || "/placeholder.svg"} alt={shirt.name} className="w-full rounded-md mb-2" />
                  <h3 className="font-semibold">{shirt.name}</h3>
                  <p className="text-sm">${shirt.price.toFixed(2)}</p>
                </motion.div>
              ))}
            </div>
            {selectedShirt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-8"
              >
                <h3 className="text-2xl font-bold mb-2">{selectedShirt.name}</h3>
                <p className="text-xl mb-4">${selectedShirt.price.toFixed(2)}</p>
                <button className="bg-card-overlay-background text-[#D4F3D9] px-6 py-3 rounded-full text-lg font-semibold hover:bg-[#005028] transition-colors duration-300">
                  Add to Cart
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}

