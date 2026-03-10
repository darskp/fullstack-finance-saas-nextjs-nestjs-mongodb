import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
}

export const UserSchema = SchemaFactory.createForClass(User);
