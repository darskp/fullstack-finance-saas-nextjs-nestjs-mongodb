import { SignUp } from "@clerk/nextjs";

export default function Signup() {
  return (
    <div className="flex items-center justify-center w-full h-full bg-[#212126]">
        <SignUp routing="hash" signInUrl="/sign-in"/>
    </div>
  );
}
