"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { data } from "../../data";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

const FormContent = () => (
  <motion.div 
    variants={containerVariants}
    className="flex flex-col md:space-y-6 space-y-4"
  >
    <motion.div
      initial="hidden"
      animate="visible"
      variants={itemVariants}
      className="flex flex-row md:space-x-16 space-x-4"
    >
      {/* Collection Type */}
      <motion.div variants={itemVariants} className="space-y-2">
        <label className="text-sm font-bold text-gray-900">
          Collection Type
        </label>
        <Select>
          <SelectTrigger className="bg-white border-gray-300 rounded-none">
            <SelectValue placeholder="Select collection" />
          </SelectTrigger>
          <SelectContent>
            {data.collectionTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Amount */}
      <motion.div variants={itemVariants} className="space-y-2">
        <label className="text-sm font-bold text-gray-900">
          Amount
        </label>
        <Input 
          type="number"
          defaultValue="0"
          className="bg-white border-gray-300 rounded-none"
        />
      </motion.div>
    </motion.div>
    

    {/* Add Another Button */}
    <motion.div 
      variants={itemVariants}
      className="flex justify-end pt-4"
    >
      <motion.div
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <Button 
          className="bg-black hover:bg-gray-800 text-white rounded-none w-full md:w-32"
        >
          Add Another
        </Button>
      </motion.div>
    </motion.div>

    {/* Bottom Action Buttons */}
    <motion.div 
      variants={itemVariants}
      className="grid grid-cols-2 gap-4 pt-6"
    >
      <motion.div
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <Button 
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-none w-full"
        >
          Cancel
        </Button>
      </motion.div>
      
      <motion.div
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <Button 
          className="bg-green-600 hover:bg-green-700 text-white w-full"
        >
          Process
        </Button>
      </motion.div>
    </motion.div>
  </motion.div>
);

export default function CollectionForm() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Drawer>
          <DrawerTrigger asChild>
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-none w-full">
                New Collection
              </Button>
            </motion.div>
          </DrawerTrigger>
          <DrawerContent className="bg-gray-50 h-[50vh] min-h-[400px]">
            <DrawerHeader>
              <DrawerTitle>Collection Form</DrawerTitle>
              <DrawerDescription>
                Add a new collection for this vehicle
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4 flex-1 overflow-y-auto">
              <FormContent />
            </div>
          </DrawerContent>
        </Drawer>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card className="bg-gray-50 border border-gray-200 rounded-none">
        <CardContent className="p-8">
          <FormContent />
        </CardContent>
      </Card>
    </motion.section>
  );
}
