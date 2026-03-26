import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Expense extends Document {
    @Prop({ required: true, type: String, trim: true })
    transactionType: string

    @Prop({ required: true, type: String, trim: true })
    title: string

    @Prop({ required: true, type: String, trim: true })
    emoji: string

    @Prop({ required: true, type: String, trim: true })
    category: string

    @Prop({ required: true, type: String, trim: true })
    amount: string

    @Prop({ required: true, type: String, trim: true })
    userId: string

    @Prop({ required: true, type: Date, trim: true })
    date: Date

    createdAt: Date;
    updatedAt: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
