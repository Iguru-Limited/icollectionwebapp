"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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

interface CollectionEntry {
  id: string;
  type: string;
  amount: string;
}

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
      ease: "easeOut" as const
    }
  }
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

const FormContent = ({ 
  entries, 
  onUpdateEntry, 
  onAddEntry, 
  onRemoveEntry, 
  onCancel, 
  onProcess
}: {
  entries: CollectionEntry[];
  onUpdateEntry: (id: string, field: keyof CollectionEntry, value: string) => void;
  onAddEntry: () => void;
  onRemoveEntry: (id: string) => void;
  onCancel: () => void;
  onProcess: () => void;
}) => (
  <motion.div 
    variants={containerVariants}
    className="flex flex-col md:space-y-6 space-y-4"
  >
    {/* Collection Entries */}
    {entries.map((entry, index) => (
      <motion.div
        key={entry.id}
        initial="hidden"
        animate="visible"
        variants={itemVariants}
        className="space-y-4"
      >
        {index > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Collection #{index + 1}
              </h3>
              {entries.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemoveEntry(entry.id)}
                  className="text-red-600 border-red-300 hover:bg-red-50 rounded-none"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 md:space-x-16 space-x-4">
          {/* Collection Type */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-sm font-bold text-gray-900">
              Collection Type
            </label>
            <Select 
              value={entry.type} 
              onValueChange={(value) => onUpdateEntry(entry.id, 'type', value)}
            >
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
              value={entry.amount}
              onChange={(e) => onUpdateEntry(entry.id, 'amount', e.target.value)}
              className="bg-white border-gray-300 rounded-none"
              placeholder="0"
            />
          </motion.div>
        </div>
      </motion.div>
    ))}

    {/* Add Another Button */}
    <motion.div 
      variants={itemVariants}
      className="flex justify-end md:pt-4 pt-2"
    >
      <motion.div
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <Button 
          onClick={onAddEntry}
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
          onClick={onCancel}
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
          onClick={onProcess}
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
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Initialize with one empty entry
  const [entries, setEntries] = useState<CollectionEntry[]>([
    { id: '1', type: '', amount: '' }
  ]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleUpdateEntry = (id: string, field: keyof CollectionEntry, value: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const handleAddEntry = () => {
    setEntries(prev => [...prev, { id: generateId(), type: '', amount: '' }]);
  };

  const handleRemoveEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const handleCancel = () => {
    if (isMobile) {
      setIsDrawerOpen(false);
    } else {
      router.push('/');
    }
  };

  const handleProcess = () => {
    // Here you would typically process the form data
    console.log('Processing entries:', entries);
    // For now, just show an alert
    alert(`Processing ${entries.length} collection(s)`);
    
    if (isMobile) {
      setIsDrawerOpen(false);
    } else {
      router.push('/');
    }
  };

  if (isMobile) {
    return (
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
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
          <DrawerContent className="bg-gray-50 h-[70vh] min-h-[500px]">
            <DrawerHeader>
              <DrawerTitle>Collection Form</DrawerTitle>
              <DrawerDescription>
                Add a new collection for this vehicle
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4 flex-1 overflow-y-auto">
              <FormContent 
                entries={entries}
                onUpdateEntry={handleUpdateEntry}
                onAddEntry={handleAddEntry}
                onRemoveEntry={handleRemoveEntry}
                onCancel={handleCancel}
                onProcess={handleProcess}
              />
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
          <FormContent 
            entries={entries}
            onUpdateEntry={handleUpdateEntry}
            onAddEntry={handleAddEntry}
            onRemoveEntry={handleRemoveEntry}
            onCancel={handleCancel}
            onProcess={handleProcess}
          />
        </CardContent>
      </Card>
    </motion.section>
  );
}
