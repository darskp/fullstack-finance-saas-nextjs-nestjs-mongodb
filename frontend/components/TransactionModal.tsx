"use client"
import { useEffect, useState } from "react";
import { Button } from "./ui/Button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/Modal";
import EmojiPicker from "emoji-picker-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/Select";
import { INCOME_CATEGORY_CONSTANTS, EXPENSE_CATEGORY_CONSTANTS } from "@/utils/constants";
import { Calendar } from "./ui/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { ITransactionData } from "@/utils/types";
import { toast } from "sonner";
import { Input } from "./ui/input";

interface TransactionModalProps {
    type: 'Income' | 'Expense' | 'Transaction';
    handleAddTransaction: (data: ITransactionData) => void;
    handleUpdateTransaction: (data: ITransactionData) => void;
    showAddModal: boolean;
    setShowAddModal: (value: boolean) => void;
    transactionObj: ITransactionData | null;
    isEditMode: boolean;
    setIsEditMode: (value: boolean) => void;
}

const TransactionModal = ({
    type,
    handleAddTransaction,
    handleUpdateTransaction,
    showAddModal,
    setShowAddModal,
    transactionObj,
    isEditMode,
    setIsEditMode
}: TransactionModalProps) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const [subType, setSubType] = useState<'Income' | 'Expense' | "">(type === 'Transaction' ? "" : type as 'Income' | 'Expense');

    const constants = subType === 'Income' ? INCOME_CATEGORY_CONSTANTS : subType === 'Expense' ? EXPENSE_CATEGORY_CONSTANTS : [];
    const defaultEmoji = subType === 'Income' ? "🚀" : subType === 'Expense' ? "💸" : "🔄";

    const [selectedEmoji, setSelectedEmoji] = useState<string>(defaultEmoji);
    const [title, setTitle] = useState("")
    const [category, setCategory] = useState("")
    const [amount, setAmount] = useState("")
    const [date, setDate] = useState<Date | null>(null)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (isEditMode && transactionObj) {
            setSelectedEmoji(transactionObj.emoji || defaultEmoji);
            setTitle(transactionObj.title || "");
            setCategory(transactionObj.category || "");
            setAmount(transactionObj.amount || "");
            setDate(transactionObj.date ? new Date(transactionObj.date) : null);
            if (type === 'Transaction') {
                setSubType((transactionObj.transactionType as 'Income' | 'Expense') || "");
            }
        } else {
            const initialDefaultEmoji = type === 'Income' ? "🚀" : type === 'Expense' ? "💸" : "🔄";
            setSelectedEmoji(initialDefaultEmoji);
            setTitle("");
            setCategory("");
            setAmount("");
            setDate(null);
            if (type === 'Transaction') {
                setSubType("");
            }
        }
    }, [transactionObj, isEditMode, showAddModal, type]);

    const handleEmojiclick = (emjobj: { emoji: string }) => {
        setSelectedEmoji(emjobj.emoji)
        setShowEmojiPicker(false)
    }

    const handleSubmit = () => {
        const transactionData: ITransactionData = {
            title, category, emoji: selectedEmoji, amount, date, 
            transactionType: type === 'Transaction' ? subType : type,
            _id: isEditMode ? transactionObj?._id : undefined
        }
        if (!title || !category || !amount || !date) {
            toast.error("Please fill all the fields")
            return
        }
        if (isEditMode) {
            handleUpdateTransaction(transactionData)
        } else {
            handleAddTransaction(transactionData)
        }
    }

    return (
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
                <Button className="cursor-pointer" onClick={() => setIsEditMode(false)}>Add {type}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditMode ? `Update ${type}` : `Add ${type}`}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? "Update" : "Add"} {type.toLowerCase()} to the list in just a few simple steps
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-start justify-center gap-4">
                    <div className="relative">
                        <span className="text-3xl border border-gray-300 py-1 px-2 cursor-pointer rounded-md"
                            onClick={() => setShowEmojiPicker(true)}
                        >
                            {selectedEmoji}
                        </span>
                        {showEmojiPicker ? <div className="absolute top-0 left-15 z-50">
                            <EmojiPicker onEmojiClick={handleEmojiclick} />
                        </div> : null}
                    </div>

                    {type === 'Transaction' && (
                        <div className="w-full">
                            <span className="font-medium">Transaction Type</span>
                            <Select disabled={isEditMode} value={subType} onValueChange={(value) => { 
                                setSubType(value as 'Income' | 'Expense');
                                setCategory(""); // Reset category when switching type
                            }}>
                                <SelectTrigger className="mt-2 w-full cursor-pointer">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem className="cursor-pointer" value="Income">Income</SelectItem>
                                    <SelectItem className="cursor-pointer" value="Expense">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="w-full">
                        <span className="font-medium">Title</span>
                        <Input
                            className="mt-2"
                            placeholder={`Enter ${type.toLowerCase()} title`}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="w-full">
                        <span className="font-medium">Category</span>
                        <Select value={category} onValueChange={(value) => { setCategory(value) }}>
                            <SelectTrigger className="mt-2 w-full cursor-pointer">
                                <SelectValue placeholder="Select a Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Category</SelectLabel>
                                    {constants.map(({ value, title }, index) => {
                                        return (
                                            <SelectItem key={index} id={String(index)} className="cursor-pointer" value={value}>{title}</SelectItem>
                                        )
                                    })}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full">
                        <span className="font-medium">Amount</span>
                        <Input
                            className="mt-2"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <div className="w-full flex flex-col gap-2">
                        <span className="font-medium">Date</span>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild className="cursor-pointer">
                                <Button
                                    variant="outline"
                                    className="flex justify-between font-light"
                                >
                                    {date ? new Date(date).toLocaleDateString() : "Pick a date"}
                                    <ChevronDownIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 overflow-hidden">
                                <Calendar
                                    mode="single"
                                    selected={date ?? undefined}
                                    onSelect={(date) => {
                                        setDate(date ?? null)
                                        setOpen(false)
                                    }}
                                    captionLayout="dropdown"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">
                            Close
                        </Button>
                    </DialogClose>
                    <Button className="cursor-pointer" onClick={handleSubmit}>
                        {isEditMode ? `Update ${type}` : `Add ${type}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TransactionModal;
