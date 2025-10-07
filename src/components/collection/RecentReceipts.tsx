"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { data } from "../../data";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
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

const ReceiptCard = ({ receipt, index }: { receipt: any; index: number }) => (
  <motion.div
    key={receipt.id}
    variants={rowVariants}
    whileHover={{ 
      backgroundColor: "rgba(249, 250, 251, 0.8)",
      transition: { duration: 0.2 }
    }}
    className="hover:bg-gray-50"
  >
    <Card className="border border-gray-200 rounded-none mb-3">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm text-gray-500">#{receipt.id}</span>
              <span className="font-mono font-bold">{receipt.receiptId}</span>
            </div>
            <div className="text-sm text-gray-600">{receipt.operation}</div>
            <div className="font-mono font-bold text-green-600">{receipt.amount}</div>
            <div className="text-xs text-gray-500 font-mono">
              {receipt.date} • {receipt.time}
            </div>
          </div>
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button 
              size="sm" 
              className="bg-black hover:bg-gray-800 text-white rounded-none"
            >
              Reprint
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function RecentReceipts() {
  const isMobile = useIsMobile();
  const receipts = data.receipts;

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mb-8"
    >
      <motion.h2 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-xl font-bold font-mono mb-4"
      >
        RECENT RECEIPTS
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {isMobile ? (
          <div className="space-y-0">
            {receipts.map((receipt, index) => (
              <ReceiptCard key={receipt.id} receipt={receipt} index={index} />
            ))}
          </div>
        ) : (
          <Card className="border border-gray-300 rounded-none">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 hover:bg-gray-100">
                  <TableHead className="text-gray-700 font-medium">#</TableHead>
                  <TableHead className="text-gray-700 font-medium">Receipt ID</TableHead>
                  <TableHead className="text-gray-700 font-medium">Operation</TableHead>
                  <TableHead className="text-gray-700 font-medium">Amount</TableHead>
                  <TableHead className="text-gray-700 font-medium">Date</TableHead>
                  <TableHead className="text-gray-700 font-medium">Time</TableHead>
                  <TableHead className="text-gray-700 font-medium">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt, index) => (
                  <motion.tr
                    key={receipt.id}
                    variants={rowVariants}
                    whileHover={{ 
                      backgroundColor: "rgba(249, 250, 251, 0.8)",
                      transition: { duration: 0.2 }
                    }}
                    className="hover:bg-gray-50"
                  >
                    <TableCell className="font-mono">{receipt.id}.</TableCell>
                    <TableCell className="font-mono">{receipt.receiptId}</TableCell>
                    <TableCell>{receipt.operation}</TableCell>
                    <TableCell className="font-mono">{receipt.amount}</TableCell>
                    <TableCell className="font-mono">{receipt.date}</TableCell>
                    <TableCell className="font-mono">{receipt.time}</TableCell>
                    <TableCell>
                      <motion.div
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Button 
                          size="sm" 
                          className="bg-black hover:bg-gray-800 text-white rounded-none"
                        >
                          Reprint
                        </Button>
                      </motion.div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </motion.div>
    </motion.section>
  );
}
