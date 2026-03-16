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
import { Input } from "./ui/Input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/Select";
import { INCOME_CATEGORY_CONSTANTS } from "@/utils/constants";
import { Calendar } from "./ui/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { ITransactionData } from "@/utils/types";
import { toast } from "sonner";

const IncomeModal = ({ handleAddIncome, showIncomeAddModal, setShowIncomeAddModal, handleUpdateIncome, incomeObj, isEditMode, setIsEditMode }: {
    handleAddIncome: (incomedata: ITransactionData) => void,
    handleUpdateIncome: (updateData: ITransactionData) => void,
    showIncomeAddModal: boolean,
    setShowIncomeAddModal: (value: boolean) => void,
    incomeObj: ITransactionData | null,
    isEditMode: boolean,
    setIsEditMode: (value: boolean) => void
}) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const [selectedEmoji, setSelectedEmoji] = useState<string>("🚀");
    const [title, setTitle] = useState("")
    const [category, setCategory] = useState("")
    const [amount, setAmount] = useState("")
    const [date, setDate] = useState<Date | null>(null)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (isEditMode && incomeObj) {
            setSelectedEmoji(incomeObj.emoji || "🚀");
            setTitle(incomeObj.title || "");
            setCategory(incomeObj.category || "");
            setAmount(incomeObj.amount || "");
            setDate(incomeObj.date ? new Date(incomeObj.date) : null);
        } else {
            setSelectedEmoji("🚀");
            setTitle("");
            setCategory("");
            setAmount("");
            setDate(null);
        }
    }, [incomeObj, isEditMode, showIncomeAddModal]);

    const handleEmojiclick = (emjobj: { emoji: string }) => {
        setSelectedEmoji(emjobj.emoji)
        setShowEmojiPicker(false)
    }

    const handleIncomeBtn = () => {
        const incomeData: ITransactionData = {
            title, category, emoji: selectedEmoji, amount, date, transactionType: 'Income',
            _id: isEditMode ? incomeObj?._id : undefined
        }
        if (!title || !category || !amount || !date) {
            toast.error("Please fill all the fields")
            return
        }
        if (isEditMode) {
            console.log("incomeData",incomeData);
            
            handleUpdateIncome(incomeData)
        } else {
            handleAddIncome(incomeData)
        }
    }

    const handleShowIncomeAddModal = () => {
        setShowIncomeAddModal(!showIncomeAddModal)
    }

    return (
        <Dialog open={showIncomeAddModal} onOpenChange={handleShowIncomeAddModal}>
            <DialogTrigger asChild>
                <Button className="cursor-pointer" onClick={() => setIsEditMode(false)}>Add Income</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditMode?"Update Income" : "Add Income"}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? "Update" : "Add"} income to the list in just a few simple steps
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-start justify-center gap-4">
                    <div className="relative">
                        <span className="text-3xl border border-gray-300 py-1 px-2 cursor-pointer rounded-md"
                            onClick={() => setShowEmojiPicker(true)}
                        >
                            {selectedEmoji}
                        </span>
                        {showEmojiPicker ? <div className="absolute top-0 left-15">
                            <EmojiPicker onEmojiClick={handleEmojiclick} />
                        </div> : null}
                    </div>

                    <div className="w-full">
                        <span className="font-medium">Title</span>
                        <Input
                            className="mt-2"
                            placeholder="Enter income title"
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
                                    {INCOME_CATEGORY_CONSTANTS.map(({ value, title }, index, array) => {
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
                    <Button className="cursor-pointer" onClick={handleIncomeBtn}>
                        {isEditMode ? "Update Income" : " Add Income"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default IncomeModal;
