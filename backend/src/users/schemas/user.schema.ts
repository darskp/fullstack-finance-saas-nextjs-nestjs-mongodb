import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Income } from './income.schema';
import { Expense } from './expense.schema';

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true, unique: true })
    clerkId: string;

    @Prop({ required: true })
    fullName: string;

    @Prop({
        type: String,
        unique: true,
        sparse: true,
        default: null,
    })
    email: string | null;

    @Prop({ type: String, default: null })
    imageUrl: string | null;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Income' }] })
    income: Income[];

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }] })
    expenses: Expense[];
}

export const UserSchema = SchemaFactory.createForClass(User);
