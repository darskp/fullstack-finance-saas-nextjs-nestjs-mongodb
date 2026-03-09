import { SignIn } from "@clerk/nextjs";

export default function Signin() {
  return (
    <div className="flex items-center justify-center w-full h-full bg-[#212126]">
        <SignIn routing="hash" signUpUrl="/sign-up"/>
    </div>
  );
}
